import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { useBikes } from "../../context/BikeContext";

import { getBikeReminders } from "../../services/reminderApi";

import "./Reminders.css";


const Reminders = () => {

  const navigate = useNavigate();

  const {
    bikes,
    selectedBike,
    selectedBikeId,
    setSelectedBike,
  } = useBikes();


  // ==============================
  // STATE
  // ==============================

  const [reminders, setReminders] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [actionError, setActionError] = useState("");

  const [filter, setFilter] = useState("All");

  const [search, setSearch] = useState("");


  // ==============================
  // CURRENT ODOMETER
  // ==============================

  const currentOdometer = useMemo(() => {

    return Number(
      selectedBike?.odometer || 0
    );

  }, [selectedBike?.odometer]);


  // ==============================
  // LOAD REMINDERS FROM BACKEND
  // ==============================

  useEffect(() => {

    if (!selectedBikeId) {

      setReminders([]);

      return;
    }


    const loadReminders = async () => {

      try {

        setLoading(true);

        setError("");

        const response =
          await getBikeReminders(selectedBikeId);


        /*
         * Backend response:
         *
         * [
         *   {
         *      serviceName: "...",
         *      category: "...",
         *      currentKm: 10000,
         *      lastServiceKm: 8000,
         *      interval: 3000,
         *      dueKm: 11000,
         *      remainingKm: 1000,
         *      status: "Upcoming"
         *   }
         * ]
         */

        const data = Array.isArray(response.data)
          ? response.data
          : [];


        setReminders(data);

      } catch (err) {

        console.error(
          "Failed to load reminders:",
          err
        );

        setReminders([]);

        if (err.response?.status === 401) {

          setError(
            "Your session has expired. Please login again."
          );

        } else if (err.response?.status === 403) {

          setError(
            "You are not authorized to view this bike."
          );

        } else if (err.response?.status === 404) {

          setError(
            "Bike not found."
          );

        } else {

          setError(
            err.response?.data?.message ||
            "Failed to load service reminders."
          );
        }

      } finally {

        setLoading(false);
      }
    };


    loadReminders();

  }, [selectedBikeId]);


  // ==============================
  // FILTER + SEARCH
  // ==============================

  const filteredReminders = useMemo(() => {

    let result = [...reminders];


    // Status filter

    if (filter !== "All") {

      result = result.filter(
        (reminder) =>
          reminder.status === filter
      );

    }


    // Search

    const searchText =
      search.trim().toLowerCase();


    if (searchText) {

      result = result.filter(
        (reminder) => {

          const serviceName =
            String(
              reminder.serviceName || ""
            ).toLowerCase();


          const description =
            String(
              reminder.description || ""
            ).toLowerCase();


          const bikeName =
            String(
              reminder.bikeName || ""
            ).toLowerCase();


          const category =
            String(
              reminder.category || ""
            ).toLowerCase();


          return (
            serviceName.includes(searchText) ||
            description.includes(searchText) ||
            bikeName.includes(searchText) ||
            category.includes(searchText)
          );

        }
      );

    }


    return result;

  }, [
    reminders,
    filter,
    search,
  ]);


  // ==============================
  // SUMMARY
  // ==============================

  const summary = useMemo(() => {

    return {

      total: reminders.length,

      due: reminders.filter(
        (reminder) =>
          reminder.status === "Due"
      ).length,

      dueSoon: reminders.filter(
        (reminder) =>
          reminder.status === "Due Soon"
      ).length,

      upcoming: reminders.filter(
        (reminder) =>
          reminder.status === "Upcoming"
      ).length,

    };

  }, [reminders]);


  // ==============================
  // BIKE CHANGE
  // ==============================

  const handleBikeChange = (event) => {

    const bikeId = event.target.value;


    const bikeExists = bikes.some(
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

    setFilter("All");

    setSearch("");

    setActionError("");

    setError("");

  };


  // ==============================
  // SEARCH
  // ==============================

  const handleSearchChange = (event) => {

    const value = event.target.value;


    if (value.length > 100) {
      return;
    }


    setSearch(value);

    setActionError("");

  };


  // ==============================
  // SERVICE NOW
  // ==============================

  const handleService = (reminder) => {

    if (!selectedBike) {

      setActionError(
        "Please select a bike before recording a service."
      );

      return;
    }


    if (!reminder?.serviceName) {

      setActionError(
        "This reminder does not contain a valid service."
      );

      return;
    }


    navigate("/service", {

      state: {

        service:
          reminder.serviceName,

        bikeId:
          selectedBike.id,

      },

    });

  };


  // ==============================
  // RECORD SERVICE
  // ==============================

  const handleRecordService = () => {

    if (!selectedBike) {

      setActionError(
        "Please select a bike before recording a service."
      );

      return;
    }


    navigate("/service", {

      state: {

        bikeId:
          selectedBike.id,

      },

    });

  };


  // ==============================
  // SERVICE HISTORY
  // ==============================

  const handleServiceHistory = () => {

    if (!selectedBike) {

      setActionError(
        "Please select a bike first."
      );

      return;
    }


    navigate("/service-history", {

      state: {

        bikeId:
          selectedBike.id,

      },

    });

  };


  // ==============================
  // STATUS CLASS
  // ==============================

  const getStatusClass = (status) => {

    if (status === "Due") {
      return "due";
    }


    if (status === "Due Soon") {
      return "due-soon";
    }


    return "upcoming";

  };


  // ==============================
  // STATUS ICON
  // ==============================

  const getStatusIcon = (status) => {

    if (status === "Due") {
      return "🔴";
    }


    if (status === "Due Soon") {
      return "🟠";
    }


    return "🟢";

  };


  // ==============================
  // NO BIKES
  // ==============================

  if (!bikes.length) {

    return (

      <div className="reminders-page">

        <div className="reminders-header">

          <div>

            <span className="reminders-label">
              MAINTENANCE
            </span>

            <h1>
              Service Reminders
            </h1>

            <p>
              Keep track of your bike
              maintenance and upcoming
              services.
            </p>

          </div>

        </div>


        <div className="reminders-empty">

          <div className="reminders-empty-icon">
            🏍️
          </div>

          <h2>
            No Bikes Added
          </h2>

          <p>
            Add your bike first to start
            receiving service reminders.
          </p>


          <button
            type="button"
            className="reminders-primary-btn"
            onClick={() =>
              navigate("/bikes/add")
            }
          >
            Add Your Bike
          </button>

        </div>

      </div>

    );

  }


  // ==============================
  // NO SELECTED BIKE
  // ==============================

  if (!selectedBike) {

    return (

      <div className="reminders-page">

        <div className="reminders-header">

          <div>

            <span className="reminders-label">
              MAINTENANCE
            </span>

            <h1>
              Service Reminders
            </h1>

            <p>
              Select a bike to view its
              maintenance reminders.
            </p>

          </div>


          <button
            type="button"
            className="reminders-primary-btn"
            onClick={() =>
              navigate("/bikes")
            }
          >
            Select Bike
          </button>

        </div>


        <div className="reminders-bike-selector">

          <div className="reminders-bike-selector-content">

            <div className="reminders-bike-icon">
              🏍️
            </div>


            <div className="reminders-bike-info">

              <span>
                SELECT BIKE
              </span>


              <select
                value={selectedBikeId || ""}
                onChange={handleBikeChange}
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
                    {bike.registrationNumber}

                  </option>

                ))}

              </select>

            </div>

          </div>

        </div>


        {actionError && (

          <div className="service-error">

            ⚠️ {actionError}

          </div>

        )}

      </div>

    );

  }


  // ==============================
  // MAIN PAGE
  // ==============================

  return (

    <div className="reminders-page">


      {/* ============================
          HEADER
      ============================ */}

      <div className="reminders-header">

        <div>

          <span className="reminders-label">
            MAINTENANCE
          </span>


          <h1>
            Service Reminders
          </h1>


          <p>
            Stay updated with your bike's
            upcoming maintenance needs.
          </p>

        </div>


        <button
          type="button"
          className="reminders-primary-btn"
          onClick={handleRecordService}
        >
          + Record Service
        </button>

      </div>


      {/* ============================
          ACTION ERROR
      ============================ */}

      {actionError && (

        <div className="service-error">

          ⚠️ {actionError}

        </div>

      )}


      {/* ============================
          ERROR
      ============================ */}

      {error && (

        <div className="service-error">

          ⚠️ {error}

          <button
            type="button"
            onClick={() => {

              setError("");

              if (selectedBikeId) {

                getBikeReminders(
                  selectedBikeId
                )
                  .then((response) => {

                    const data =
                      Array.isArray(response.data)
                        ? response.data
                        : [];

                    setReminders(data);

                  })
                  .catch((err) => {

                    console.error(err);

                    setError(
                      "Unable to reload reminders."
                    );

                  });

              }

            }}
            style={{
              marginLeft: "10px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>

        </div>

      )}


      {/* ============================
          BIKE SELECTOR
      ============================ */}

      <div className="reminders-bike-selector">

        <div className="reminders-bike-selector-content">


          <div className="reminders-bike-icon">
            🏍️
          </div>


          <div className="reminders-bike-info">

            <span>
              SELECT BIKE
            </span>


            <select
              value={selectedBikeId || ""}
              onChange={handleBikeChange}
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
                  {bike.registrationNumber}

                </option>

              ))}

            </select>

          </div>


          <div className="reminders-current-km">

            <span>
              Current Odometer
            </span>


            <strong>

              {currentOdometer.toLocaleString()} km

            </strong>

          </div>


        </div>

      </div>


      {/* ============================
          LOADING
      ============================ */}

      {loading ? (

        <div className="reminders-no-results">

          <div className="reminders-no-results-icon">
            ⏳
          </div>

          <h3>
            Loading Reminders
          </h3>

          <p>
            Checking your bike's
            maintenance schedule...
          </p>

        </div>

      ) : (

        <>


          {/* ========================
              SUMMARY
          ======================== */}

          <div className="reminders-summary">


            <div className="reminder-summary-card">

              <div className="reminder-summary-icon">
                📋
              </div>

              <div>

                <span>
                  Total
                </span>

                <strong>
                  {summary.total}
                </strong>

              </div>

            </div>


            <div className="reminder-summary-card reminder-summary-due">

              <div className="reminder-summary-icon">
                🔴
              </div>

              <div>

                <span>
                  Due
                </span>

                <strong>
                  {summary.due}
                </strong>

              </div>

            </div>


            <div className="reminder-summary-card reminder-summary-soon">

              <div className="reminder-summary-icon">
                🟠
              </div>

              <div>

                <span>
                  Due Soon
                </span>

                <strong>
                  {summary.dueSoon}
                </strong>

              </div>

            </div>


            <div className="reminder-summary-card reminder-summary-upcoming">

              <div className="reminder-summary-icon">
                🟢
              </div>

              <div>

                <span>
                  Upcoming
                </span>

                <strong>
                  {summary.upcoming}
                </strong>

              </div>

            </div>


          </div>


          {/* ========================
              TOOLBAR
          ======================== */}

          <div className="reminders-toolbar">


            <div className="reminder-filters">

              {[
                "All",
                "Due",
                "Due Soon",
                "Upcoming",
              ].map((item) => (

                <button
                  key={item}
                  type="button"
                  className={
                    filter === item
                      ? "active"
                      : ""
                  }
                  onClick={() => {

                    setFilter(item);

                    setActionError("");

                  }}
                >
                  {item}
                </button>

              ))}

            </div>


            <div className="reminder-search">

              <span>
                🔍
              </span>


              <input
                type="text"
                placeholder="Search reminders..."
                value={search}
                onChange={handleSearchChange}
                maxLength={100}
              />

            </div>


          </div>


          {/* ========================
              REMINDER SECTION
          ======================== */}

          <div className="reminders-section">


            <div className="reminders-section-header">

              <div>

                <h2>
                  Maintenance Reminders
                </h2>

                <p>
                  Services recommended based on
                  your bike's current mileage.
                </p>

              </div>


              <span className="reminders-count">

                {filteredReminders.length}{" "}

                reminder
                {filteredReminders.length !== 1
                  ? "s"
                  : ""}

              </span>

            </div>


            {filteredReminders.length > 0 ? (

              <div className="reminders-list">

                {filteredReminders.map(
                  (reminder, index) => {

                    const statusClass =
                      getStatusClass(
                        reminder.status
                      );


                    return (

                      <div
                        className={`reminder-card reminder-card-${statusClass}`}
                        key={`${selectedBikeId}-${reminder.serviceName}-${index}`}
                      >


                        {/* LEFT */}

                        <div className="reminder-card-left">


                          <div
                            className={`reminder-status-icon reminder-status-${statusClass}`}
                          >

                            {getStatusIcon(
                              reminder.status
                            )}

                          </div>


                          <div className="reminder-card-content">


                            <div className="reminder-card-title-row">

                              <h3>
                                {reminder.serviceName}
                              </h3>


                              <span
                                className={`reminder-status reminder-status-${statusClass}`}
                              >

                                {reminder.status}

                              </span>

                            </div>


                            {reminder.description && (

                              <p className="reminder-description">

                                {reminder.description}

                              </p>

                            )}


                            <div className="reminder-details">


                              {/* DUE KM */}

                              {reminder.dueKm !==
                                undefined && (

                                <div className="reminder-detail">

                                  <span>
                                    📍
                                  </span>

                                  <span>

                                    Due at{" "}

                                    <strong>

                                      {Number(
                                        reminder.dueKm
                                      ).toLocaleString()}{" "}
                                      km

                                    </strong>

                                  </span>

                                </div>

                              )}


                              {/* REMAINING KM */}

                              {reminder.remainingKm !==
                                undefined && (

                                <div className="reminder-detail">

                                  <span>
                                    🛣️
                                  </span>

                                  <span>

                                    {Number(
                                      reminder.remainingKm
                                    ) <= 0

                                      ? "Service is due"

                                      : `${Number(
                                          reminder.remainingKm
                                        ).toLocaleString()} km remaining`}

                                  </span>

                                </div>

                              )}


                              {/* LAST SERVICE */}

                              {reminder.lastServiceKm !==
                                undefined &&
                                reminder.lastServiceKm !==
                                  null && (

                                  <div className="reminder-detail">

                                    <span>
                                      🔧
                                    </span>

                                    <span>

                                      Last service:{" "}

                                      <strong>

                                        {Number(
                                          reminder.lastServiceKm
                                        ).toLocaleString()}{" "}
                                        km

                                      </strong>

                                    </span>

                                  </div>

                                )}


                            </div>


                          </div>


                        </div>


                        {/* ACTION */}

                        <div className="reminder-card-action">

                          <button
                            type="button"
                            onClick={() =>
                              handleService(
                                reminder
                              )
                            }
                          >

                            Service Now

                          </button>

                        </div>


                      </div>

                    );

                  }
                )}

              </div>

            ) : (

              <div className="reminders-no-results">

                <div className="reminders-no-results-icon">

                  {filter === "All"
                    ? "✅"
                    : "🔍"}

                </div>


                {filter === "All" ? (

                  <>

                    <h3>
                      All Maintenance Is
                      Up to Date
                    </h3>

                    <p>

                      There are currently no
                      service reminders for{" "}

                      {selectedBike
                        ? `${selectedBike.brand} ${selectedBike.model}.`
                        : "your bike."}

                    </p>

                  </>

                ) : (

                  <>

                    <h3>
                      No {filter} Reminders
                    </h3>

                    <p>
                      No reminders match the
                      selected filter or search.
                    </p>

                  </>

                )}


                {(filter !== "All" ||
                  search) && (

                  <button
                    type="button"
                    className="reminders-secondary-btn"
                    onClick={() => {

                      setFilter("All");

                      setSearch("");

                      setActionError("");

                    }}
                  >

                    Clear Filters

                  </button>

                )}

              </div>

            )}


          </div>


          {/* ========================
              QUICK ACTIONS
          ======================== */}

          <div className="reminders-actions-section">


            <div className="reminders-actions-header">

              <div>

                <span className="reminders-actions-label">
                  QUICK ACTIONS
                </span>

                <h2>
                  Manage Your Bike
                </h2>

                <p>
                  Quickly access your maintenance
                  records and bike management.
                </p>

              </div>

            </div>


            <div className="reminders-actions-grid">


              {/* SERVICE HISTORY */}

              <div className="reminders-action-card">

                <div className="reminders-action-icon reminders-action-history">
                  📜
                </div>


                <div className="reminders-action-content">

                  <h3>
                    Service History
                  </h3>

                  <p>
                    View all completed maintenance
                    records.
                  </p>

                </div>


                <button
                  type="button"
                  className="reminders-action-button"
                  onClick={
                    handleServiceHistory
                  }
                >

                  <span>
                    View History
                  </span>

                  <span>
                    →
                  </span>

                </button>

              </div>


              {/* RECORD SERVICE */}

              <div className="reminders-action-card">

                <div className="reminders-action-icon reminders-action-service">
                  🔧
                </div>


                <div className="reminders-action-content">

                  <h3>
                    Record a Service
                  </h3>

                  <p>
                    Add a completed or pending
                    service record.
                  </p>

                </div>


                <button
                  type="button"
                  className="reminders-action-button"
                  onClick={
                    handleRecordService
                  }
                >

                  <span>
                    Add Service
                  </span>

                  <span>
                    →
                  </span>

                </button>

              </div>


              {/* MY BIKES */}

              <div className="reminders-action-card">

                <div className="reminders-action-icon reminders-action-bike">
                  🏍️
                </div>


                <div className="reminders-action-content">

                  <h3>
                    My Bikes
                  </h3>

                  <p>
                    Manage your bikes and update
                    their details.
                  </p>

                </div>


                <button
                  type="button"
                  className="reminders-action-button"
                  onClick={() =>
                    navigate("/bikes")
                  }
                >

                  <span>
                    View Bikes
                  </span>

                  <span>
                    →
                  </span>

                </button>

              </div>


            </div>

          </div>


        </>

      )}

    </div>

  );

};


export default Reminders;