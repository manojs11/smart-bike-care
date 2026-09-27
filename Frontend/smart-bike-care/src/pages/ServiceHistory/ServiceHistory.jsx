import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useBikes,
} from "../../context/BikeContext";

import {
  getBikeServices,
  deleteService,
} from "../../services/serviceApi";

import "./ServiceHistory.css";

function ServiceHistory() {
  const navigate = useNavigate();

  const {
    bikes,
    selectedBike,
    selectedBikeId,
    setSelectedBike,
  } = useBikes();

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("latest");

  const [serviceHistory, setServiceHistory] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [serviceError, setServiceError] = useState("");
  const [actionError, setActionError] = useState("");
  const [deletingServiceId, setDeletingServiceId] = useState(null);

  const normalizeServices = (services) => {
    return services
      .filter(
        (service) =>
          service &&
          typeof service === "object"
      )
      .map((service) => {
        let bill = null;

        if (service.billData) {
          bill = {
            name:
              service.billName ||
              "Service Bill",

            type:
              service.billType || "",

            size:
              Number(service.billSize) || 0,

            dataUrl:
              service.billData,
          };
        } else if (service.bill?.dataUrl) {
          bill = {
            name:
              service.bill.name ||
              "Service Bill",

            type:
              service.bill.type || "",

            size:
              Number(service.bill.size) || 0,

            dataUrl:
              service.bill.dataUrl,
          };
        }

        return {
          ...service,

          id: service.id,

          service:
            service.service || "",

          date:
            service.date || "",

          kilometers:
            Number(service.kilometers) || 0,

          amount:
            Number(service.amount) || 0,

          status:
            service.status ||
            "Completed",

          bill,
        };
      });
  };

  const loadServiceHistory = async () => {
    if (!selectedBikeId) {
      setServiceHistory([]);
      return;
    }

    try {
      setLoadingServices(true);
      setServiceError("");

      const response =
        await getBikeServices(selectedBikeId);

      const services =
        Array.isArray(response.data)
          ? response.data
          : [];

      const normalizedServices =
        normalizeServices(services);

      setServiceHistory(
        normalizedServices
      );
    } catch (error) {
      console.error(
        "Load service history error:",
        error.response?.data || error
      );

      setServiceHistory([]);

      setServiceError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to load service history."
      );
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    setSearchText("");
    setStatusFilter("All");
    setSortOrder("latest");
    setActionError("");

    loadServiceHistory();
  }, [selectedBikeId]);

  const handleBikeChange = (event) => {
    const bikeId = event.target.value;

    const bikeExists =
      bikes.some(
        (bike) =>
          String(bike.id) ===
          String(bikeId)
      );

    if (!bikeExists) {
      setActionError(
        "The selected bike could not be found."
      );
      return;
    }

    setSelectedBike(bikeId);

    setSearchText("");
    setStatusFilter("All");
    setSortOrder("latest");

    setActionError("");
    setServiceError("");
  };

  const formatAmount = (amount) => {
    const value = Number(amount);

    if (
      !Number.isFinite(value) ||
      value < 0
    ) {
      return "0";
    }

    return value.toLocaleString("en-IN");
  };

  const formatKilometers = (kilometers) => {
    const value = Number(kilometers);

    if (
      !Number.isFinite(value) ||
      value < 0
    ) {
      return "0";
    }

    return value.toLocaleString("en-IN");
  };

  const formatDate = (date) => {
    if (!date) {
      return "No date";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;

    if (value.length > 100) {
      return;
    }

    setSearchText(value);
    setActionError("");
  };

  const handleStatusChange = (event) => {
    const value = event.target.value;

    const allowedStatuses = [
      "All",
      "Completed",
      "Pending",
    ];

    if (
      !allowedStatuses.includes(value)
    ) {
      setActionError(
        "Invalid service status selected."
      );
      return;
    }

    setStatusFilter(value);
    setActionError("");
  };

  const handleSortChange = (event) => {
    const value = event.target.value;

    const allowedSortOrders = [
      "latest",
      "oldest",
      "highest",
      "lowest",
    ];

    if (
      !allowedSortOrders.includes(value)
    ) {
      setActionError(
        "Invalid sorting option selected."
      );
      return;
    }

    setSortOrder(value);
    setActionError("");
  };

  const filteredServices = useMemo(() => {
    let records = [
      ...serviceHistory,
    ];

    const search =
      searchText
        .trim()
        .toLowerCase();

    if (search) {
      records =
        records.filter(
          (service) => {
            const serviceName =
              String(
                service.service || ""
              ).toLowerCase();

            const serviceDate =
              String(
                service.date || ""
              ).toLowerCase();

            const serviceStatus =
              String(
                service.status ||
                  "Completed"
              ).toLowerCase();

            const serviceKm =
              String(
                service.kilometers || ""
              ).toLowerCase();

            const serviceAmount =
              String(
                service.amount || ""
              ).toLowerCase();

            return (
              serviceName.includes(search) ||
              serviceDate.includes(search) ||
              serviceStatus.includes(search) ||
              serviceKm.includes(search) ||
              serviceAmount.includes(search)
            );
          }
        );
    }

    if (statusFilter !== "All") {
      records =
        records.filter(
          (service) =>
            String(
              service.status ||
                "Completed"
            ).toLowerCase() ===
            statusFilter.toLowerCase()
        );
    }

    records.sort((a, b) => {
      if (sortOrder === "latest") {
        return String(
          b.date || ""
        ).localeCompare(
          String(a.date || "")
        );
      }

      if (sortOrder === "oldest") {
        return String(
          a.date || ""
        ).localeCompare(
          String(b.date || "")
        );
      }

      if (sortOrder === "highest") {
        return (
          Number(b.amount || 0) -
          Number(a.amount || 0)
        );
      }

      if (sortOrder === "lowest") {
        return (
          Number(a.amount || 0) -
          Number(b.amount || 0)
        );
      }

      return 0;
    });

    return records;
  }, [
    serviceHistory,
    searchText,
    statusFilter,
    sortOrder,
  ]);

  const totalServices =
    serviceHistory.length;

  const totalAmount =
    serviceHistory.reduce(
      (total, service) => {
        const amount =
          Number(
            service.amount || 0
          );

        if (
          !Number.isFinite(amount) ||
          amount < 0
        ) {
          return total;
        }

        return total + amount;
      },
      0
    );

  const lastService =
    serviceHistory.length > 0
      ? [
          ...serviceHistory,
        ].sort(
          (a, b) =>
            String(
              b.date || ""
            ).localeCompare(
              String(
                a.date || ""
              )
            )
        )[0]
      : null;

  const handleClearFilters = () => {
    setSearchText("");
    setStatusFilter("All");
    setSortOrder("latest");
    setActionError("");
  };

  const handleEditService = (service) => {
    if (!service?.id) {
      setActionError(
        "Unable to edit this service because the service ID is missing."
      );
      return;
    }

    /*
     * IMPORTANT:
     * The backend uses:
     *
     * GET /api/services/{serviceId}
     *
     * Therefore only serviceId is required
     * for the EditService page.
     */
    navigate(
      `/service/edit/${service.id}`
    );
  };

  const handleDeleteService = async (
    service
  ) => {
    if (!service?.id) {
      setActionError(
        "Unable to delete this service because the service ID is missing."
      );
      return;
    }

    if (!selectedBikeId) {
      setActionError(
        "Unable to delete this service because the bike ID is missing."
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${service.service}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionError("");

      setDeletingServiceId(
        service.id
      );

      /*
       * IMPORTANT:
       * Backend endpoint:
       *
       * DELETE /api/services/{serviceId}
       *
       * Do NOT send bikeId here.
       */
      await deleteService(
        service.id
      );

      await loadServiceHistory();
    } catch (error) {
      console.error(
        "Delete service error:",
        error.response?.data || error
      );

      setActionError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to delete service."
      );
    } finally {
      setDeletingServiceId(null);
    }
  };

  const handleViewBill = (service) => {
    const billData =
      service?.bill?.dataUrl;

    if (!billData) {
      setActionError(
        "No bill is available for this service."
      );
      return;
    }

    if (
      typeof billData !== "string" ||
      !billData.startsWith("data:")
    ) {
      setActionError(
        "The saved bill file is invalid."
      );
      return;
    }

    const newWindow =
      window.open("", "_blank");

    if (!newWindow) {
      setActionError(
        "Please allow pop-ups to view the bill."
      );
      return;
    }

    if (
      billData.startsWith("data:image/")
    ) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Service Bill</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                background: #f5f7fb;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
              }

              img {
                max-width: 100%;
                max-height: 90vh;
                object-fit: contain;
              }
            </style>
          </head>

          <body>
            <img
              src="${billData}"
              alt="Service Bill"
            />
          </body>
        </html>
      `);
    } else {
      newWindow.document.write(`
        <html>
          <head>
            <title>Service Bill</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                background: #f5f7fb;
              }

              iframe {
                width: 100%;
                height: 100vh;
                border: none;
              }
            </style>
          </head>

          <body>
            <iframe
              src="${billData}"
              title="Service Bill"
            ></iframe>
          </body>
        </html>
      `);
    }

    newWindow.document.close();

    setActionError("");
  };

  const handleRecordService = () => {
    if (!selectedBike) {
      setActionError(
        "Please select a bike before recording a service."
      );
      return;
    }

    navigate("/service", {
      state: {
        bikeId: selectedBike.id,
      },
    });
  };

  const handleRetry = async () => {
    if (!selectedBikeId) {
      return;
    }

    setServiceError("");
    setActionError("");

    await loadServiceHistory();
  };

  if (bikes.length === 0) {
    return (
      <div className="service-history-page">
        <div className="service-history-empty">
          <div className="service-history-empty-icon">
            📋
          </div>

          <h2>
            No Bikes Added
          </h2>

          <p>
            Add a bike first to view
            its complete service
            history.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/bikes/add")
            }
          >
            + Add Your Bike
          </button>
        </div>
      </div>
    );
  }

  if (!selectedBike) {
    return (
      <div className="service-history-page">
        <div className="service-history-header">
          <div>
            <span className="service-history-label">
              MAINTENANCE RECORDS
            </span>

            <h1>
              Service History
            </h1>

            <p>
              Select a bike to view its
              complete maintenance
              history.
            </p>
          </div>

          <button
            type="button"
            className="service-history-back-btn"
            onClick={() =>
              navigate("/bikes")
            }
          >
            ← My Bikes
          </button>
        </div>

        <div className="service-history-bike-selector">
          <div>
            <span>
              SELECT BIKE
            </span>

            <h2>
              Motorcycle
            </h2>
          </div>

          <select
            value={
              selectedBikeId || ""
            }
            onChange={
              handleBikeChange
            }
          >
            <option value="">
              Select a bike
            </option>

            {bikes.map((bike) => (
              <option
                key={bike.id}
                value={bike.id}
              >
                {bike.brand}{" "}
                {bike.model} -{" "}
                {
                  bike.registrationNumber
                }
              </option>
            ))}
          </select>
        </div>

        {actionError && (
          <div className="service-error">
            ⚠️ {actionError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="service-history-page">
      <div className="service-history-header">
        <div>
          <span className="service-history-label">
            MAINTENANCE RECORDS
          </span>

          <h1>
            Service History
          </h1>

          <p>
            View and track the complete
            maintenance history of your
            bike.
          </p>
        </div>

        <button
          type="button"
          className="service-history-back-btn"
          onClick={() =>
            navigate("/service")
          }
        >
          ← Service
        </button>
      </div>

      {actionError && (
        <div className="service-error">
          ⚠️ {actionError}
        </div>
      )}

      <div className="service-history-bike-selector">
        <div>
          <span>
            SELECT BIKE
          </span>

          <h2>
            Motorcycle
          </h2>
        </div>

        <select
          value={
            selectedBikeId || ""
          }
          onChange={
            handleBikeChange
          }
        >
          <option
            value=""
            disabled
          >
            Select a bike
          </option>

          {bikes.map((bike) => (
            <option
              key={bike.id}
              value={bike.id}
            >
              {bike.brand}{" "}
              {bike.model} -{" "}
              {
                bike.registrationNumber
              }
            </option>
          ))}
        </select>
      </div>

      <div className="service-history-bike-card">
        <div className="service-history-bike-icon">
          🏍️
        </div>

        <div className="service-history-bike-info">
          <h2>
            {selectedBike.brand}{" "}
            {selectedBike.model}
          </h2>

          <p>
            {
              selectedBike.registrationNumber
            }
          </p>
        </div>

        <div className="service-history-current-km">
          <span>
            CURRENT ODOMETER
          </span>

          <strong>
            {formatKilometers(
              selectedBike.odometer
            )}{" "}
            KM
          </strong>
        </div>
      </div>

      {loadingServices && (
        <div className="service-history-loading">
          <div className="service-history-loading-icon">
            ⏳
          </div>

          <h3>
            Loading Service History
          </h3>

          <p>
            Fetching service records...
          </p>
        </div>
      )}

      {serviceError &&
        !loadingServices && (
          <div className="service-history-error">
            <strong>
              Unable to load service history
            </strong>

            <p>
              {serviceError}
            </p>

            <button
              type="button"
              onClick={
                handleRetry
              }
            >
              Retry
            </button>
          </div>
        )}

      <div className="service-history-summary">
        <div className="history-summary-card">
          <div className="history-summary-icon">
            🔧
          </div>

          <div>
            <span>
              TOTAL SERVICES
            </span>

            <strong>
              {totalServices}
            </strong>
          </div>
        </div>

        <div className="history-summary-card">
          <div className="history-summary-icon">
            ₹
          </div>

          <div>
            <span>
              TOTAL SPENT
            </span>

            <strong>
              ₹
              {formatAmount(
                totalAmount
              )}
            </strong>
          </div>
        </div>

        <div className="history-summary-card">
          <div className="history-summary-icon">
            📅
          </div>

          <div>
            <span>
              LAST SERVICE
            </span>

            <strong>
              {lastService
                ? formatDate(
                    lastService.date
                  )
                : "Not yet"}
            </strong>
          </div>
        </div>

        <div className="history-summary-card">
          <div className="history-summary-icon">
            🛣️
          </div>

          <div>
            <span>
              LAST SERVICE KM
            </span>

            <strong>
              {lastService
                ? `${formatKilometers(
                    lastService.kilometers
                  )} KM`
                : "0"}
            </strong>
          </div>
        </div>
      </div>

      <div className="service-history-filters">
        <div className="history-search-box">
          <span>
            🔍
          </span>

          <input
            type="text"
            placeholder="Search service records..."
            value={searchText}
            onChange={
              handleSearchChange
            }
            maxLength={100}
          />
        </div>

        <select
          value={statusFilter}
          onChange={
            handleStatusChange
          }
          className="history-filter-select"
        >
          <option value="All">
            All Status
          </option>

          <option value="Completed">
            Completed
          </option>

          <option value="Pending">
            Pending
          </option>
        </select>

        <select
          value={sortOrder}
          onChange={
            handleSortChange
          }
          className="history-filter-select"
        >
          <option value="latest">
            Latest First
          </option>

          <option value="oldest">
            Oldest First
          </option>

          <option value="highest">
            Highest Cost
          </option>

          <option value="lowest">
            Lowest Cost
          </option>
        </select>

        {(searchText ||
          statusFilter !== "All" ||
          sortOrder !== "latest") && (
          <button
            type="button"
            className="history-clear-btn"
            onClick={
              handleClearFilters
            }
          >
            Clear
          </button>
        )}
      </div>

      <div className="complete-history-card">
        <div className="complete-history-header">
          <div>
            <span className="service-history-label">
              RECORDS
            </span>

            <h2>
              Complete Service History
            </h2>

            <p>
              All maintenance records
              for this bike.
            </p>
          </div>

          <span className="history-count">
            {filteredServices.length}{" "}
            Records
          </span>
        </div>

        {loadingServices ? (
          <div className="complete-history-empty">
            <div>
              ⏳
            </div>

            <h3>
              Loading records...
            </h3>

            <p>
              Please wait while the
              latest service records
              are loaded.
            </p>
          </div>
        ) : serviceError ? (
          <div className="complete-history-empty">
            <div>
              ⚠️
            </div>

            <h3>
              Service records
              unavailable
            </h3>

            <p>
              {serviceError}
            </p>

            <button
              type="button"
              onClick={
                handleRetry
              }
            >
              Retry
            </button>
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="complete-history-list">
            {filteredServices.map(
              (service, index) => {
                const status =
                  service.status ||
                  "Completed";

                const statusClass =
                  status.toLowerCase() ===
                  "pending"
                    ? "pending"
                    : "completed";

                const isDeleting =
                  deletingServiceId ===
                  service.id;

                return (
                  <div
                    className="complete-history-item"
                    key={
                      service.id ||
                      `${service.date}-${index}`
                    }
                  >
                    <div className="complete-history-icon">
                      🔧
                    </div>

                    <div className="complete-history-info">
                      <h3>
                        {service.service ||
                          "Bike Service"}
                      </h3>

                      <div className="history-meta">
                        <span>
                          📅{" "}
                          {formatDate(
                            service.date
                          )}
                        </span>

                        <span>
                          🛣️{" "}
                          {formatKilometers(
                            service.kilometers
                          )}{" "}
                          KM
                        </span>
                      </div>
                    </div>

                    <div className="complete-history-cost">
                      <strong>
                        ₹
                        {formatAmount(
                          service.amount
                        )}
                      </strong>

                      <span
                        className={`history-status ${statusClass}`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="service-history-actions">
                      <button
                        type="button"
                        className="service-edit-btn"
                        onClick={() =>
                          handleEditService(
                            service
                          )
                        }
                        disabled={isDeleting}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="service-delete-btn"
                        onClick={() =>
                          handleDeleteService(
                            service
                          )
                        }
                        disabled={isDeleting}
                      >
                        {isDeleting
                          ? "Deleting..."
                          : "Delete"}
                      </button>

                      {service.bill
                        ?.dataUrl && (
                        <button
                          type="button"
                          className="history-bill-btn"
                          onClick={() =>
                            handleViewBill(
                              service
                            )
                          }
                          disabled={isDeleting}
                        >
                          📄 View Bill
                        </button>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        ) : (
          <div className="complete-history-empty">
            <div>
              📋
            </div>

            <h3>
              {serviceHistory.length === 0
                ? "No Service Records"
                : "No Matching Records"}
            </h3>

            <p>
              {serviceHistory.length === 0
                ? "You haven't recorded any service for this bike yet."
                : "Try changing your search or filter."}
            </p>

            {serviceHistory.length === 0 ? (
              <button
                type="button"
                onClick={
                  handleRecordService
                }
              >
                + Record Service
              </button>
            ) : (
              <button
                type="button"
                onClick={
                  handleClearFilters
                }
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      <div className="history-bottom-action">
        <button
          type="button"
          onClick={
            handleRecordService
          }
        >
          + Record New Service
        </button>
      </div>
    </div>
  );
}

export default ServiceHistory;

