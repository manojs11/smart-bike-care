import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Service.css";
import { useBikes } from "../../context/BikeContext";
import { addService } from "../../services/serviceApi";

const SERVICE_CATALOG = [
  {
    name: "Engine Oil Change",
    icon: "🛢️",
    category: "Engine",
    description: "Replace engine oil to maintain smooth engine performance.",
    interval: "Every 3000–5000 km",
  },
  {
    name: "Oil Filter Replacement",
    icon: "🔧",
    category: "Engine",
    description: "Replace the oil filter to keep engine oil clean.",
    interval: "Every 5000–10000 km",
  },
  {
    name: "Air Filter Cleaning",
    icon: "🌬️",
    category: "Engine",
    description: "Clean or replace the air filter for better airflow.",
    interval: "Every 5000 km",
  },
  {
    name: "Brake Service",
    icon: "🛑",
    category: "Safety",
    description: "Inspect brake pads, discs and brake performance.",
    interval: "Every 5000 km",
  },
  {
    name: "Chain Lubrication",
    icon: "⛓️",
    category: "Transmission",
    description: "Lubricate and inspect the drive chain.",
    interval: "Every 500–1000 km",
  },
  {
    name: "Tyre Check",
    icon: "🏍️",
    category: "Safety",
    description: "Check tyre pressure, tread and overall condition.",
    interval: "Every 1000 km",
  },
  {
    name: "Battery Check",
    icon: "🔋",
    category: "Electrical",
    description: "Inspect battery voltage and electrical connections.",
    interval: "Every 5000 km",
  },
];

const SPARE_PARTS = [
  {
    name: "Engine Oil",
    icon: "🛢️",
    category: "Engine",
    description: "Engine oil replacement.",
    interval: "3000–5000 km",
    status: "not-due",
  },
  {
    name: "Oil Filter",
    icon: "🔧",
    category: "Engine",
    description: "Oil filter replacement.",
    interval: "5000–10000 km",
    status: "not-due",
  },
  {
    name: "Air Filter",
    icon: "🌬️",
    category: "Engine",
    description: "Air filter cleaning or replacement.",
    interval: "5000 km",
    status: "not-due",
  },
  {
    name: "Brake Pads",
    icon: "🛑",
    category: "Safety",
    description: "Brake pad inspection and replacement.",
    interval: "10000 km",
    status: "due-soon",
  },
  {
    name: "Chain Kit",
    icon: "⛓️",
    category: "Transmission",
    description: "Drive chain and sprocket maintenance.",
    interval: "15000–20000 km",
    status: "not-due",
  },
];

const getStatusClass = (status) => {
  if (!status) {
    return "not-due";
  }

  const value = status.toLowerCase();

  if (value.includes("due soon")) {
    return "due-soon";
  }

  if (value.includes("due")) {
    return "due";
  }

  return "not-due";
};

const normalizeService = (service) => {
  if (!service) {
    return null;
  }

  let bill = null;

  if (
    service.bill?.dataUrl ||
    service.bill?.dataUrl === ""
  ) {
    bill = service.bill;
  } else if (service.billData) {
    bill = {
      name: service.billName || "Service Bill",
      type: service.billType || "",
      size: service.billSize || 0,
      dataUrl: service.billData,
    };
  }

  return {
    ...service,
    id: service.id,
    service: service.service || "",
    date: service.date || "",
    kilometers:
      service.kilometers !== null &&
      service.kilometers !== undefined
        ? Number(service.kilometers)
        : 0,
    amount:
      service.amount !== null &&
      service.amount !== undefined
        ? Number(service.amount)
        : 0,
    status: service.status || "Completed",
    bill,
  };
};

function Service() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    bikes,
    selectedBike,
    selectedBikeId,
    setSelectedBike,
    loadBikes,
  } = useBikes();

  const [formData, setFormData] = useState({
    service: "",
    date: new Date().toISOString().split("T")[0],
    kilometers: "",
    amount: "",
    status: "Completed",
  });

  const [billData, setBillData] = useState(null);
  const [errors, setErrors] = useState({});
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSparePart, setSelectedSparePart] = useState(null);

  const [serviceHistory, setServiceHistory] = useState([]);

  useEffect(() => {
    if (!location.state) {
      return;
    }

    if (location.state.bikeId) {
      setSelectedBike(location.state.bikeId);
    }

    if (location.state.service) {
      setFormData((previous) => ({
        ...previous,
        service: location.state.service,
      }));
    }

    window.history.replaceState({}, document.title);
  }, [location.state, setSelectedBike]);

  useEffect(() => {
    if (!selectedBike) {
      setServiceHistory([]);
      return;
    }

    const history = Array.isArray(selectedBike.serviceHistory)
      ? selectedBike.serviceHistory
          .map(normalizeService)
          .filter(Boolean)
      : [];

    setServiceHistory(history);
  }, [selectedBike]);

  const currentOdometer = Number(selectedBike?.odometer || 0);

  const serviceKm = Number(formData.kilometers);
  const serviceAmount =
    formData.amount === ""
      ? 0
      : Number(formData.amount);

  const recommendations = useMemo(() => {
    if (!selectedBike) {
      return [];
    }

    const odometer = Number(selectedBike.odometer || 0);

    const items = [];

    if (odometer > 0 && odometer % 5000 >= 4000) {
      items.push({
        title: "Engine Oil Change",
        icon: "🛢️",
        status: "Due Soon",
        description:
          "Your bike is approaching the recommended engine oil service interval.",
        details: [
          `Current: ${odometer.toLocaleString()} km`,
          "Recommended every 5000 km",
        ],
      });
    }

    if (odometer > 0 && odometer % 10000 >= 8000) {
      items.push({
        title: "Brake Service",
        icon: "🛑",
        status: "Due Soon",
        description:
          "Consider checking brake pads and braking performance.",
        details: [
          `Current: ${odometer.toLocaleString()} km`,
          "Recommended every 10000 km",
        ],
      });
    }

    if (odometer > 0 && odometer % 5000 >= 4500) {
      items.push({
        title: "Air Filter Cleaning",
        icon: "🌬️",
        status: "Due Soon",
        description:
          "The air filter may need cleaning or replacement soon.",
        details: [
          `Current: ${odometer.toLocaleString()} km`,
          "Recommended every 5000 km",
        ],
      });
    }

    if (items.length === 0) {
      items.push({
        title: "Regular Maintenance",
        icon: "✅",
        status: "Not Due",
        description:
          "Your bike is currently within the normal maintenance interval.",
        details: [
          `Current: ${odometer.toLocaleString()} km`,
          "Continue regular maintenance",
        ],
      });
    }

    return items;
  }, [selectedBike]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setPageError("");
    setSuccessMessage("");
  };

  const handleBikeChange = (event) => {
    const bikeId = event.target.value;

    if (bikeId) {
      setSelectedBike(bikeId);
    }
  };

  const handleServiceSelect = (serviceName) => {
    setFormData((previous) => ({
      ...previous,
      service: serviceName,
    }));

    setErrors((previous) => ({
      ...previous,
      service: "",
    }));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleRecommendationUse = (serviceName) => {
    handleServiceSelect(serviceName);
  };

  const handleSparePartSelect = (part) => {
    if (selectedSparePart?.name === part.name) {
      setSelectedSparePart(null);
      return;
    }

    setSelectedSparePart(part);
  };

  const handleBillUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      setPageError(
        "Only JPG, JPEG and PNG bill images are allowed."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPageError(
        "Bill image size must be less than 2 MB."
      );

      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setBillData({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: reader.result,
      });

      setPageError("");
    };

    reader.onerror = () => {
      setPageError(
        "Unable to read the selected bill."
      );
    };

    reader.readAsDataURL(file);
  };

  const removeBill = () => {
    setBillData(null);
  };

  const validateForm = () => {
    const validationErrors = {};

    if (!selectedBike) {
      setPageError("Please select a bike.");
      return false;
    }

    if (!formData.service.trim()) {
      validationErrors.service =
        "Please select or enter a service.";
    }

    if (!formData.date) {
      validationErrors.date =
        "Please select the service date.";
    } else {
      const today = new Date()
        .toISOString()
        .split("T")[0];

      if (formData.date > today) {
        validationErrors.date =
          "Service date cannot be in the future.";
      }
    }

    if (
      formData.kilometers === "" ||
      !Number.isFinite(serviceKm)
    ) {
      validationErrors.kilometers =
        "Please enter a valid kilometer reading.";
    } else if (serviceKm < 0) {
      validationErrors.kilometers =
        "Kilometers cannot be negative.";
    } else if (serviceKm < currentOdometer) {
      validationErrors.kilometers =
        `Kilometers cannot be less than the current odometer (${currentOdometer} km).`;
    } else if (serviceKm > 1000000) {
      validationErrors.kilometers =
        "Please enter a valid kilometer reading.";
    }

    if (
      formData.amount !== "" &&
      (!Number.isFinite(serviceAmount) ||
        serviceAmount < 0)
    ) {
      validationErrors.amount =
        "Please enter a valid amount.";
    }

    if (serviceAmount > 10000000) {
      validationErrors.amount =
        "Please enter a valid service amount.";
    }

    if (!formData.status) {
      validationErrors.status =
        "Please select service status.";
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setPageError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    if (!selectedBike?.id) {
      setPageError("Selected bike is invalid.");
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        service: formData.service.trim(),
        date: formData.date,
        kilometers: serviceKm,
        amount: serviceAmount,
        status: formData.status,
        billName: billData?.name || null,
        billType: billData?.type || null,
        billSize: billData?.size || null,
        billData: billData?.dataUrl || null,
      };

      console.log(
        "Sending Service Request:",
        requestData
      );

      await addService(
        selectedBike.id,
        requestData
      );

      await loadBikes();

      setSuccessMessage(
        "Service record saved successfully."
      );

      setFormData({
        service: "",
        date: new Date()
          .toISOString()
          .split("T")[0],
        kilometers: "",
        amount: "",
        status: "Completed",
      });

      setBillData(null);
      setSelectedSparePart(null);
      setErrors({});

      setTimeout(() => {
        navigate("/service-history");
      }, 900);
    } catch (error) {
      console.error(
        "Save service error:",
        error.response?.data || error
      );

      setPageError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to save service record."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  if (!selectedBike && !bikes.length) {
    return (
      <div className="service-page">
        <div className="service-empty">
          <div className="service-empty-icon">
            🏍️
          </div>

          <h2>No Bike Available</h2>

          <p>
            Add a bike before creating a service
            record.
          </p>

          <button
            type="button"
            className="service-save-btn"
            onClick={() => navigate("/add-bike")}
          >
            Add Bike
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="service-page">
      <div className="service-header">
        <div>
          <span className="service-page-label">
            BIKE MAINTENANCE
          </span>

          <h1>Service Your Bike</h1>

          <p>
            Record maintenance and keep your bike
            service history updated.
          </p>
        </div>

        <button
          type="button"
          className="service-back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>

      <div className="service-layout">
        <div>
          <div className="service-form-card">
            <div className="service-card-heading">
              <div className="service-heading-icon">
                🔧
              </div>

              <div>
                <h2>Service Details</h2>
                <p>
                  Enter the details of the completed
                  or upcoming service.
                </p>
              </div>
            </div>

            {pageError && (
              <div className="service-error">
                {pageError}
              </div>
            )}

            {successMessage && (
              <div className="service-success-message">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="service-form-group">
                <label htmlFor="bike">
                  Select Bike
                </label>

                <select
                  id="bike"
                  value={selectedBikeId || ""}
                  onChange={handleBikeChange}
                >
                  {bikes.map((bike) => (
                    <option
                      key={bike.id}
                      value={bike.id}
                    >
                      {bike.brand} {bike.model} -{" "}
                      {bike.registrationNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div
                className={`service-form-group ${
                  errors.service
                    ? "has-error"
                    : ""
                }`}
              >
                <label htmlFor="service">
                  Service Type
                </label>

                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                >
                  <option value="">
                    Select a service
                  </option>

                  {SERVICE_CATALOG.map(
                    (service) => (
                      <option
                        key={service.name}
                        value={service.name}
                      >
                        {service.name}
                      </option>
                    )
                  )}
                </select>

                {errors.service && (
                  <span className="service-validation-error">
                    {errors.service}
                  </span>
                )}
              </div>

              <div className="service-form-row">
                <div
                  className={`service-form-group ${
                    errors.date
                      ? "has-error"
                      : ""
                  }`}
                >
                  <label htmlFor="date">
                    Service Date
                  </label>

                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    max={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    onChange={handleChange}
                  />

                  {errors.date && (
                    <span className="service-validation-error">
                      {errors.date}
                    </span>
                  )}
                </div>

                <div
                  className={`service-form-group ${
                    errors.kilometers
                      ? "has-error"
                      : ""
                  }`}
                >
                  <label htmlFor="kilometers">
                    Odometer Reading
                  </label>

                  <div className="service-input-unit">
                    <input
                      id="kilometers"
                      name="kilometers"
                      type="number"
                      min="0"
                      value={
                        formData.kilometers
                      }
                      onChange={handleChange}
                      placeholder="12500"
                    />

                    <span>km</span>
                  </div>

                  <span className="service-km-current">
                    Current odometer:{" "}
                    {currentOdometer.toLocaleString()}{" "}
                    km
                  </span>

                  {errors.kilometers && (
                    <span className="service-validation-error">
                      {errors.kilometers}
                    </span>
                  )}
                </div>
              </div>

              <div className="service-form-row">
                <div
                  className={`service-form-group ${
                    errors.amount
                      ? "has-error"
                      : ""
                  }`}
                >
                  <label htmlFor="amount">
                    Service Amount
                  </label>

                  <div className="service-input-unit">
                    <span>₹</span>

                    <input
                      id="amount"
                      name="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="850"
                    />
                  </div>

                  {errors.amount && (
                    <span className="service-validation-error">
                      {errors.amount}
                    </span>
                  )}
                </div>

                <div
                  className={`service-form-group ${
                    errors.status
                      ? "has-error"
                      : ""
                  }`}
                >
                  <label htmlFor="status">
                    Status
                  </label>

                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Completed">
                      Completed
                    </option>

                    <option value="Pending">
                      Pending
                    </option>
                  </select>

                  {errors.status && (
                    <span className="service-validation-error">
                      {errors.status}
                    </span>
                  )}
                </div>
              </div>

              <div className="service-bill-section">
                <div className="service-bill-heading">
                  <label>Service Bill</label>

                  <span>
                    Optional · JPG / PNG · Max 2MB
                  </span>
                </div>

                {!billData ? (
                  <div className="service-bill-upload">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      onChange={handleBillUpload}
                    />

                    <p>
                      Upload your service bill
                    </p>

                    <span>
                      Keep a digital copy of your
                      maintenance bill.
                    </span>
                  </div>
                ) : (
                  <div className="service-bill-preview">
                    {billData.type?.startsWith(
                      "image/"
                    ) && (
                      <img
                        src={billData.dataUrl}
                        alt="Service bill preview"
                      />
                    )}

                    <div>
                      <strong>
                        {billData.name}
                      </strong>

                      <span className="service-field-help">
                        {(
                          billData.size /
                          1024
                        ).toFixed(1)}{" "}
                        KB
                      </span>

                      <button
                        type="button"
                        onClick={removeBill}
                      >
                        Remove bill
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="service-form-actions">
                <button
                  type="button"
                  className="service-cancel-btn"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="service-save-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Saving..."
                    : "Save Service"}
                </button>
              </div>
            </form>
          </div>

          <div className="smart-recommendations-card">
            <div className="smart-recommendations-header">
              <div className="smart-icon">
                💡
              </div>

              <div>
                <h2>Smart Recommendations</h2>
                <p>
                  Maintenance suggestions based on
                  your bike usage.
                </p>
              </div>
            </div>

            <div className="recommendations-list">
              {recommendations.map(
                (recommendation, index) => (
                  <div
                    className="recommendation-item"
                    key={`${recommendation.title}-${index}`}
                  >
                    <div className="recommendation-icon">
                      {recommendation.icon}
                    </div>

                    <div className="recommendation-content">
                      <div className="recommendation-title-row">
                        <h3>
                          {recommendation.title}
                        </h3>

                        <span
                          className={`recommendation-status ${getStatusClass(
                            recommendation.status
                          )}`}
                        >
                          {recommendation.status}
                        </span>
                      </div>

                      <p>
                        {
                          recommendation.description
                        }
                      </p>

                      <div className="recommendation-details">
                        {recommendation.details.map(
                          (detail) => (
                            <span key={detail}>
                              {detail}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="recommendation-use-btn"
                      onClick={() =>
                        handleRecommendationUse(
                          recommendation.title
                        )
                      }
                    >
                      Use
                    </button>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="service-catalog">
            <div className="service-catalog-card">
              <div className="service-card-heading">
                <div className="service-heading-icon">
                  📋
                </div>

                <div>
                  <h2>Service Catalog</h2>
                  <p>
                    Select a common maintenance service.
                  </p>
                </div>
              </div>

              <div className="service-catalog-list">
                {SERVICE_CATALOG.map(
                  (service) => (
                    <div
                      className="service-catalog-item"
                      key={service.name}
                    >
                      <div className="service-catalog-icon">
                        {service.icon}
                      </div>

                      <div className="service-catalog-content">
                        <h3>{service.name}</h3>

                        <span>
                          {service.category}
                        </span>

                        <p>
                          {service.description}
                        </p>

                        <small>
                          {service.interval}
                        </small>
                      </div>

                      <button
                        type="button"
                        className="service-select-btn"
                        onClick={() =>
                          handleServiceSelect(
                            service.name
                          )
                        }
                      >
                        Select
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="service-spare-parts">
            <div className="service-spare-part-card">
              <div className="service-card-heading">
                <div className="service-heading-icon">
                  ⚙️
                </div>

                <div>
                  <h2>Spare Parts</h2>
                  <p>
                    Check commonly maintained bike
                    components.
                  </p>
                </div>
              </div>

              {selectedSparePart && (
                <div className="selected-spare-part">
                  <div className="selected-spare-part-icon">
                    {selectedSparePart.icon}
                  </div>

                  <div className="selected-spare-part-info">
                    <strong>
                      {selectedSparePart.name}
                    </strong>

                    <span>
                      {selectedSparePart.description}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedSparePart(null)
                    }
                  >
                    Remove
                  </button>
                </div>
              )}

              <div className="service-spare-parts-list">
                {SPARE_PARTS.map((part) => (
                  <div
                    className={`service-spare-part-item ${
                      selectedSparePart?.name ===
                      part.name
                        ? "selected"
                        : ""
                    }`}
                    key={part.name}
                  >
                    <div className="service-spare-part-icon">
                      {part.icon}
                    </div>

                    <div className="service-spare-part-content">
                      <h3>{part.name}</h3>

                      <span>
                        {part.category}
                      </span>

                      <p>
                        {part.description}
                      </p>

                      <div className="service-spare-part-details">
                        <span>
                          {part.interval}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`service-spare-part-status ${part.status}`}
                    >
                      {part.status === "due"
                        ? "Due"
                        : part.status ===
                          "due-soon"
                        ? "Due Soon"
                        : "Not Due"}
                    </span>

                    <button
                      type="button"
                      className="spare-part-select-btn"
                      onClick={() =>
                        handleSparePartSelect(
                          part
                        )
                      }
                    >
                      {selectedSparePart?.name ===
                      part.name
                        ? "Selected"
                        : "Select"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="service-bike-card">
            <div className="service-bike-icon">
              🏍️
            </div>

            <h2>
              {selectedBike?.brand}{" "}
              {selectedBike?.model}
            </h2>

            <p className="service-registration">
              {selectedBike?.registrationNumber ||
                "No registration number"}
            </p>

            <div className="service-bike-stats">
              <div>
                <span>Year</span>
                <strong>
                  {selectedBike?.year || "-"}
                </strong>
              </div>

              <div>
                <span>Odometer</span>
                <strong>
                  {Number(
                    selectedBike?.odometer || 0
                  ).toLocaleString()}{" "}
                  km
                </strong>
              </div>

              <div>
                <span>Next Service</span>
                <strong>
                  {Number(
                    selectedBike?.nextService || 0
                  ).toLocaleString()}{" "}
                  km
                </strong>
              </div>

              <div>
                <span>Last Service</span>
                <strong>
                  {selectedBike?.lastService
                    ? selectedBike.lastService
                    : "Not available"}
                </strong>
              </div>
            </div>

            <div className="service-status-box">
              <span>Bike Status</span>

              <strong>
                {selectedBike?.status || "Good"}
              </strong>
            </div>
          </div>

          <div className="service-history-card">
            <div className="service-history-header">
              <div className="service-card-heading">
                <div className="service-heading-icon">
                  🧾
                </div>

                <div>
                  <h2>Recent Service History</h2>

                  <p>
                    Your latest maintenance records.
                  </p>
                </div>
              </div>

              <span className="service-history-count">
                {serviceHistory.length}{" "}
                {serviceHistory.length === 1
                  ? "record"
                  : "records"}
              </span>
            </div>

            {serviceHistory.length > 0 ? (
              <div className="service-history-list">
                {serviceHistory
                  .slice(0, 5)
                  .map((record) => (
                    <div
                      className="service-history-item"
                      key={record.id}
                    >
                      <div className="history-service-icon">
                        🔧
                      </div>

                      <div className="history-service-info">
                        <h3>
                          {record.service}
                        </h3>

                        <p>
                          {record.date}
                        </p>

                        <span>
                          {Number(
                            record.kilometers || 0
                          ).toLocaleString()}{" "}
                          km
                        </span>
                      </div>

                      <div className="history-service-cost">
                        ₹
                        {Number(
                          record.amount || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </div>

                      <span
                        className={`service-history-status ${
                          record.status
                            ?.toLowerCase()
                            .includes("pending")
                            ? "pending"
                            : "completed"
                        }`}
                      >
                        {record.status}
                      </span>

                      {record.bill?.dataUrl && (
                        <button
                          type="button"
                          className="view-bill-btn"
                          onClick={() => {
                            window.open(
                              record.bill.dataUrl,
                              "_blank",
                              "noopener,noreferrer"
                            );
                          }}
                        >
                          View Bill
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="no-service-history">
                <div>🧾</div>

                <h3>
                  No service history
                </h3>

                <p>
                  Your saved service records will
                  appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Service;