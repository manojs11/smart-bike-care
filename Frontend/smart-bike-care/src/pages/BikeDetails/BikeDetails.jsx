import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useBikes } from "../../context/BikeContext";

import "./BikeDetails.css";

function BikeDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const {
    getBikeById,
    deleteBike,
    updateOdometer,
    selectedBikeId,
    setSelectedBike,
  } = useBikes();

  const bike = getBikeById(id);

  const [newOdometer, setNewOdometer] =
    useState(
      bike ? bike.odometer : ""
    );

  const [odometerError, setOdometerError] =
    useState("");

  const [odometerSuccess, setOdometerSuccess] =
    useState("");

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [deleteError, setDeleteError] =
    useState("");

  useEffect(() => {
    if (
      bike &&
      selectedBikeId !== bike.id
    ) {
      setSelectedBike(bike.id);
    }
  }, [
    bike,
    selectedBikeId,
    setSelectedBike,
  ]);

  useEffect(() => {
    if (bike) {
      setNewOdometer(bike.odometer);
    }
  }, [bike]);

  if (!bike) {
    return (
      <div className="bike-not-found">
        <div className="not-found-icon">
          🏍️
        </div>

        <h2>Bike Not Found</h2>

        <p>
          The bike you are looking for
          does not exist.
        </p>

        <Link
          to="/bikes"
          className="back-bikes-btn"
        >
          ← Back to My Bikes
        </Link>
      </div>
    );
  }

  const handleOdometerUpdate =
    async () => {
      const value = Number(
        newOdometer
      );

      setOdometerError("");
      setOdometerSuccess("");

      if (
        newOdometer === "" ||
        Number.isNaN(value)
      ) {
        setOdometerError(
          "Please enter a valid odometer reading."
        );

        return;
      }

      if (value < bike.odometer) {
        setOdometerError(
          `Odometer cannot be less than ${bike.odometer.toLocaleString()} km.`
        );

        return;
      }

      try {
        await updateOdometer(
          bike.id,
          value
        );

        setNewOdometer(value);

        setOdometerSuccess(
          "Odometer updated successfully."
        );
      } catch (error) {
        console.error(
          "Odometer update error:",
          error
        );

        setOdometerError(
          error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Unable to update odometer."
        );
      }
    };

  const handleDeleteBike =
    async () => {
      if (isDeleting) {
        return;
      }

      setIsDeleting(true);
      setDeleteError("");

      try {
        await deleteBike(bike.id);

        setShowDeleteModal(false);

        navigate("/bikes");
      } catch (error) {
        console.error(
          "Delete bike error:",
          error
        );

        setDeleteError(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Unable to delete bike. Please try again."
        );
      } finally {
        setIsDeleting(false);
      }
    };

  const handleEditBike = () => {
    setSelectedBike(bike.id);

    navigate(
      `/bikes/${bike.id}/edit`
    );
  };

  const handleService = () => {
    setSelectedBike(bike.id);

    navigate("/service");
  };

  const completedServices =
    bike.serviceHistory
      ? bike.serviceHistory.length
      : 0;

  const totalSpent =
    bike.serviceHistory
      ? bike.serviceHistory.reduce(
          (total, service) =>
            total +
            Number(
              service.amount || 0
            ),
          0
        )
      : 0;

  const bikeImage =
    bike.imageData ||
    bike.image ||
    null;

  return (
    <div className="bike-details-page">
      <Link
        to="/bikes"
        className="back-to-bikes"
      >
        ← Back to My Bikes
      </Link>

      <div className="bike-details-header">
        <div>
          <span className="details-label">
            BIKE DETAILS
          </span>

          <h1>
            {bike.brand} {bike.model}
          </h1>

          <p>
            View your bike information,
            service history and maintenance.
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="edit-bike-btn"
            onClick={handleEditBike}
          >
            ✏️ Edit
          </button>

          <button
            type="button"
            className="delete-bike-btn"
            onClick={() => {
              setDeleteError("");
              setShowDeleteModal(true);
            }}
            disabled={isDeleting}
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {odometerSuccess && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 16px",
            borderRadius: "8px",
            background: "#dcfce7",
            color: "#15803d",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          ✓ {odometerSuccess}
        </div>
      )}

      <div className="bike-main-card">
        <div className="details-bike-image">
          <div className="details-bike-circle"></div>

          {bikeImage ? (
            <img
              src={bikeImage}
              alt={`${bike.brand} ${bike.model}`}
              style={{
                position: "relative",
                zIndex: 2,
                width: "90%",
                height: "90%",
                objectFit: "contain",
              }}
            />
          ) : (
            <span>
              🏍️
            </span>
          )}

          <div className="details-bike-status">
            <span
              className={`status-dot ${
                bike.status === "Good"
                  ? "good-dot"
                  : "warning-dot"
              }`}
            ></span>

            {bike.status}
          </div>
        </div>

        <div className="bike-main-info">
          <span className="main-bike-brand">
            {bike.brand}
          </span>

          <h2>
            {bike.model}
          </h2>

          <div className="registration-box">
            <span>
              REGISTRATION NUMBER
            </span>

            <strong>
              {bike.registrationNumber ||
                "Not available"}
            </strong>
          </div>

          <div className="bike-basic-details">
            <div>
              <span>
                Manufacturing Year
              </span>

              <strong>
                {bike.year ||
                  "Not available"}
              </strong>
            </div>

            <div>
              <span>
                Purchase Date
              </span>

              <strong>
                {bike.purchaseDate ||
                  "Not available"}
              </strong>
            </div>

            <div>
              <span>
                Current Odometer
              </span>

              <strong>
                {Number(
                  bike.odometer || 0
                ).toLocaleString()}{" "}
                km
              </strong>
            </div>

            <div>
              <span>
                Next Service
              </span>

              <strong>
                {Number(
                  bike.nextService || 0
                ) > 0
                  ? `${Number(
                      bike.nextService
                    ).toLocaleString()} km`
                  : "Not set"}
              </strong>
            </div>
          </div>
        </div>

        <div className="main-health">
          <span className="health-title">
            BIKE HEALTH
          </span>

          <strong className="health-percentage">
            {Number(
              bike.health || 0
            )}
            %
          </strong>

          <div className="large-health-bar">
            <div
              className="large-health-progress"
              style={{
                width: `${Math.min(
                  Math.max(
                    Number(
                      bike.health || 0
                    ),
                    0
                  ),
                  100
                )}%`,
              }}
            ></div>
          </div>

          <span className="health-description">
            {Number(
              bike.health || 0
            ) >= 90
              ? "Excellent condition. Keep it up!"
              : Number(
                  bike.health || 0
                ) >= 70
              ? "Good condition. Some maintenance may be required."
              : "Your bike needs attention."}
          </span>
        </div>
      </div>

      <div className="bike-statistics">
        <div className="stat-card">
          <div className="stat-icon">
            🔧
          </div>

          <div>
            <span>Services</span>

            <strong>
              {completedServices}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            ₹
          </div>

          <div>
            <span>Total Spent</span>

            <strong>
              ₹
              {totalSpent.toLocaleString()}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            📍
          </div>

          <div>
            <span>Current KM</span>

            <strong>
              {Number(
                bike.odometer || 0
              ).toLocaleString()}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            ❤️
          </div>

          <div>
            <span>Health</span>

            <strong>
              {Number(
                bike.health || 0
              )}
              %
            </strong>
          </div>
        </div>
      </div>

      <div className="details-content-grid">
        <div className="service-history-card">
          <div className="card-heading">
            <div>
              <h2>
                Service History
              </h2>

              <p>
                Your bike's previous
                maintenance records.
              </p>
            </div>

            <button
              type="button"
              className="view-all-link"
              onClick={handleService}
            >
              View All →
            </button>
          </div>

          {bike.serviceHistory &&
          bike.serviceHistory.length >
            0 ? (
            <div className="service-history-list">
              {bike.serviceHistory.map(
                (
                  service,
                  index
                ) => (
                  <div
                    className="service-history-item"
                    key={
                      service.id ||
                      index
                    }
                  >
                    <div className="service-timeline">
                      <div className="timeline-dot"></div>

                      {index !==
                        bike
                          .serviceHistory
                          .length -
                          1 && (
                        <div className="timeline-line"></div>
                      )}
                    </div>

                    <div className="service-history-info">
                      <div className="service-history-top">
                        <div>
                          <h3>
                            {
                              service.service
                            }
                          </h3>

                          <span>
                            {
                              service.date
                            }
                          </span>
                        </div>

                        <span className="completed-badge">
                          {service.status ||
                            "Completed"}
                        </span>
                      </div>

                      <div className="service-history-bottom">
                        <span>
                          {Number(
                            service.kilometers ||
                              0
                          ).toLocaleString()}{" "}
                          km
                        </span>

                        <strong>
                          ₹
                          {Number(
                            service.amount ||
                              0
                          ).toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="no-service-history">
              <p>
                No service history available.
              </p>
            </div>
          )}
        </div>

        <div className="odometer-card">
          <div className="card-heading">
            <div>
              <h2>
                Update Odometer
              </h2>

              <p>
                Keep your reading updated
                for accurate recommendations.
              </p>
            </div>
          </div>

          <div className="current-odometer">
            <span>
              CURRENT READING
            </span>

            <strong>
              {Number(
                bike.odometer || 0
              ).toLocaleString()}{" "}
              km
            </strong>
          </div>

          <div className="odometer-input-group">
            <label htmlFor="newOdometer">
              New Odometer Reading
            </label>

            <div className="odometer-input">
              <input
                id="newOdometer"
                type="number"
                min={bike.odometer}
                value={newOdometer}
                onChange={(event) => {
                  setNewOdometer(
                    event.target.value
                  );

                  setOdometerError("");
                  setOdometerSuccess("");
                }}
                placeholder="Enter kilometers"
              />

              <span>
                km
              </span>
            </div>

            {odometerError && (
              <span className="odometer-error">
                {odometerError}
              </span>
            )}

            <button
              type="button"
              className="update-odometer-btn"
              onClick={
                handleOdometerUpdate
              }
            >
              Update Odometer
            </button>
          </div>

          <div className="odometer-tip">
            <span>
              💡
            </span>

            <p>
              Updating your odometer
              helps us calculate when
              your next service is due.
            </p>
          </div>
        </div>
      </div>

      <div className="maintenance-card">
        <div className="card-heading">
          <div>
            <h2>
              Maintenance Status
            </h2>

            <p>
              Keep these important bike
              components checked regularly.
            </p>
          </div>
        </div>

        <div className="maintenance-grid">
          <MaintenanceItem
            icon="🛢️"
            title="Engine Oil"
            text={
              Number(
                bike.nextService || 0
              ) > 0 &&
              Number(
                bike.odometer || 0
              ) >=
                Number(
                  bike.nextService || 0
                )
                ? "Service due"
                : "Check during next service"
            }
            warning={
              Number(
                bike.nextService || 0
              ) > 0 &&
              Number(
                bike.odometer || 0
              ) >=
                Number(
                  bike.nextService || 0
                )
            }
          />

          <MaintenanceItem
            icon="⛓️"
            title="Chain"
            text="Regular cleaning and lubrication recommended."
            warning={false}
          />

          <MaintenanceItem
            icon="🛑"
            title="Brakes"
            text="Inspect brake pads and brake fluid."
            warning={false}
          />

          <MaintenanceItem
            icon="🛞"
            title="Tyres"
            text="Check tyre pressure and tread."
            warning={false}
          />
        </div>
      </div>

      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-icon">
              ⚠️
            </div>

            <h2>
              Delete Bike?
            </h2>

            <p>
              Are you sure you want to
              delete{" "}
              <strong>
                {bike.brand}{" "}
                {bike.model}
              </strong>
              ?
            </p>

            <p>
              This action cannot be
              undone.
            </p>

            {deleteError && (
              <div
                style={{
                  marginTop: "15px",
                  padding: "10px 12px",
                  borderRadius: "7px",
                  background: "#fee2e2",
                  color: "#dc2626",
                  fontSize: "12px",
                  textAlign: "left",
                }}
              >
                {deleteError}
              </div>
            )}

            <div className="delete-modal-actions">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => {
                  if (!isDeleting) {
                    setShowDeleteModal(
                      false
                    );
                    setDeleteError("");
                  }
                }}
                disabled={isDeleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="modal-delete-btn"
                onClick={
                  handleDeleteBike
                }
                disabled={isDeleting}
              >
                {isDeleting
                  ? "Deleting..."
                  : "Delete Bike"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MaintenanceItem({
  icon,
  title,
  text,
  warning,
}) {
  return (
    <div className="maintenance-item">
      <div
        className={`maintenance-icon ${
          warning
            ? "warning"
            : "good"
        }`}
      >
        {icon}
      </div>

      <div className="maintenance-info">
        <h3>
          {title}
        </h3>

        <p>
          {text}
        </p>
      </div>

      <span
        className={`maintenance-status ${
          warning
            ? "warning-status"
            : "good-status"
        }`}
      >
        {warning
          ? "Check Soon"
          : "Good"}
      </span>
    </div>
  );
}

export default BikeDetails;