import React from "react";
import { Link, useNavigate } from "react-router-dom";

import { useBikes } from "../../context/BikeContext";

import "./MyBikes.css";

function MyBikes() {
  const navigate = useNavigate();

  const {
    bikes,
    selectedBikeId,
    setSelectedBike,
  } = useBikes();

  const serviceDueCount = bikes.filter(
    (bike) => bike.status === "Service Due"
  ).length;

  const healthyBikeCount = bikes.filter(
    (bike) => bike.status === "Good"
  ).length;

  const handleSelectBike = (bikeId) => {
    setSelectedBike(bikeId);
  };

  const handleViewBike = (bikeId) => {
    setSelectedBike(bikeId);
    navigate(`/bikes/${bikeId}`);
  };

  const handleService = (bikeId) => {
    setSelectedBike(bikeId);
    navigate("/service");
  };

  return (
    <div className="my-bikes-page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="my-bikes-header">

        <div>

          <span className="page-label">
            MY GARAGE
          </span>

          <h1>
            My Bikes
          </h1>

          <p>
            Manage your bikes and keep track of their maintenance.
          </p>

        </div>

        <Link
          to="/bikes/add"
          className="add-bike-btn"
        >
          <span>+</span>
          Add Bike
        </Link>

      </div>


      {/* =========================
          BIKE SUMMARY
      ========================= */}

      <div className="bike-summary">

        <div className="summary-card">

          <div className="summary-icon">
            🏍️
          </div>

          <div>

            <span>
              Total Bikes
            </span>

            <strong>
              {bikes.length}
            </strong>

          </div>

        </div>


        <div className="summary-card">

          <div className="summary-icon">
            🔧
          </div>

          <div>

            <span>
              Service Due
            </span>

            <strong>
              {serviceDueCount}
            </strong>

          </div>

        </div>


        <div className="summary-card">

          <div className="summary-icon">
            ❤️
          </div>

          <div>

            <span>
              Healthy Bikes
            </span>

            <strong>
              {healthyBikeCount}
            </strong>

          </div>

        </div>

      </div>


      {/* =========================
          BIKES SECTION
      ========================= */}

      <section className="bikes-section">

        <div className="section-title-row">

          <div>

            <h2>
              Your Bikes
            </h2>

            <p>
              Select a bike to view its maintenance details.
            </p>

          </div>

          <span className="bike-count">

            {bikes.length}{" "}

            {bikes.length === 1
              ? "Bike"
              : "Bikes"}

          </span>

        </div>


        {/* =========================
            BIKE LIST
        ========================= */}

        {bikes.length > 0 ? (

          <div className="bike-grid">

            {bikes.map((bike) => {

              const isSelected =
                selectedBikeId === bike.id;


              /*
               * Backend stores the image as imageData.
               * Keep bike.image as a fallback for
               * compatibility with older data.
               */
              const bikeImage =
                bike.imageData ||
                bike.image ||
                null;


              return (

                <div
                  className={`bike-card ${
                    isSelected
                      ? "selected"
                      : ""
                  }`}
                  key={bike.id}
                  onClick={() =>
                    handleSelectBike(bike.id)
                  }
                >

                  {/* =========================
                      BIKE IMAGE
                  ========================= */}

                  <div className="bike-image">

                    {bikeImage ? (

                      <img
                        src={bikeImage}
                        alt={`${bike.brand} ${bike.model}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />

                    ) : (

                      <span className="bike-emoji">
                        🏍️
                      </span>

                    )}


                    {/* =========================
                        BIKE STATUS
                    ========================= */}

                    <span
                      className={`bike-status ${
                        bike.status === "Good"
                          ? "good"
                          : "warning"
                      }`}
                    >
                      {bike.status}
                    </span>


                    {/* =========================
                        SELECTED BADGE
                    ========================= */}

                    {isSelected && (

                      <span className="selected-bike-badge">
                        ✓ Selected
                      </span>

                    )}

                  </div>


                  {/* =========================
                      BIKE CARD CONTENT
                  ========================= */}

                  <div className="bike-card-content">

                    <div className="bike-title">

                      <div>

                        <span className="bike-brand">
                          {bike.brand}
                        </span>

                        <h3>
                          {bike.model}
                        </h3>

                      </div>


                      <button
                        type="button"
                        className="more-btn"
                        onClick={(event) => {

                          event.stopPropagation();

                          handleViewBike(
                            bike.id
                          );

                        }}
                      >
                        ⋮
                      </button>

                    </div>


                    {/* =========================
                        BIKE DETAILS
                    ========================= */}

                    <div className="bike-details">

                      <div className="bike-detail-item">

                        <span>
                          Registration
                        </span>

                        <strong>
                          {bike.registrationNumber ||
                            "Not available"}
                        </strong>

                      </div>


                      <div className="bike-detail-item">

                        <span>
                          Year
                        </span>

                        <strong>
                          {bike.year ||
                            "Not available"}
                        </strong>

                      </div>


                      <div className="bike-detail-item">

                        <span>
                          Odometer
                        </span>

                        <strong>

                          {Number(
                            bike.odometer || 0
                          ).toLocaleString()}{" "}

                          km

                        </strong>

                      </div>

                    </div>


                    {/* =========================
                        BIKE HEALTH
                    ========================= */}

                    <div className="bike-health">

                      <div className="health-header">

                        <span>
                          Bike Health
                        </span>

                        <strong>

                          {Number(
                            bike.health || 0
                          )}

                          %

                        </strong>

                      </div>


                      <div className="health-bar">

                        <div
                          className="health-progress"
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

                    </div>


                    {/* =========================
                        BIKE ACTIONS
                    ========================= */}

                    <div className="bike-actions">

                      <button
                        type="button"
                        className="view-bike-btn"
                        onClick={(event) => {

                          event.stopPropagation();

                          handleViewBike(
                            bike.id
                          );

                        }}
                      >

                        View Bike

                        <span>
                          →
                        </span>

                      </button>


                      <button
                        type="button"
                        className="service-btn"
                        onClick={(event) => {

                          event.stopPropagation();

                          handleService(
                            bike.id
                          );

                        }}
                      >
                        Service
                      </button>

                    </div>

                  </div>

                </div>

              );

            })}

          </div>

        ) : (

          /* =========================
              NO BIKES
          ========================= */

          <div className="add-bike-card">

            <div className="add-bike-icon">
              🏍️
            </div>

            <div className="add-bike-content">

              <h3>
                No Bikes Added
              </h3>

              <p>
                Add your first bike to start managing its
                maintenance.
              </p>

              <Link
                to="/bikes/add"
                className="add-another-btn"
              >
                + Add Your Bike
              </Link>

            </div>

          </div>

        )}

      </section>

    </div>
  );
}

export default MyBikes;