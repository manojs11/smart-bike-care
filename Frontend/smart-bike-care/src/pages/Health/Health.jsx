import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useBikes } from "../../context/BikeContext";
import { getBikeHealth } from "../../services/healthApi";

import "./Health.css";

const Health = () => {
  const navigate = useNavigate();

  const {
    bikes,
    selectedBike,
    selectedBikeId,
    setSelectedBike,
  } = useBikes();

  const [healthData, setHealthData] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState("");

  // =========================================================
  // LOAD HEALTH DATA
  // =========================================================

  useEffect(() => {
    if (!selectedBikeId) {
      setHealthData(null);
      return;
    }

    const loadHealth = async () => {
      try {
        setHealthLoading(true);
        setHealthError("");

        const response = await getBikeHealth(selectedBikeId);

        setHealthData(response.data);
      } catch (error) {
        console.error(
          "Failed to load bike health:",
          error
        );

        setHealthError(
          error.response?.data?.message ||
            "Unable to load bike health."
        );
      } finally {
        setHealthLoading(false);
      }
    };

    loadHealth();
  }, [selectedBikeId]);

  // =========================================================
  // REFRESH HEALTH
  // =========================================================

  const refreshHealth = async () => {
    if (!selectedBikeId) {
      return;
    }

    try {
      setHealthLoading(true);
      setHealthError("");

      const response = await getBikeHealth(selectedBikeId);

      setHealthData(response.data);
    } catch (error) {
      console.error(
        "Failed to refresh bike health:",
        error
      );

      setHealthError(
        error.response?.data?.message ||
          "Unable to refresh bike health."
      );
    } finally {
      setHealthLoading(false);
    }
  };

  // =========================================================
  // BIKE SELECTION
  // =========================================================

  const handleBikeChange = (event) => {
    setSelectedBike(event.target.value);
  };

  // =========================================================
  // BASIC VALUES
  // =========================================================

  const odometer = Number(
    healthData?.odometer ??
      selectedBike?.odometer ??
      0
  );

  const nextService = Number(
    healthData?.nextService ??
      selectedBike?.nextService ??
      odometer + 5000
  );

  const remainingKm = Number(
    healthData?.remainingKm ??
      nextService - odometer
  );

  const lastService =
    healthData?.lastService ??
    selectedBike?.lastService ??
    null;

  const serviceHistory =
    Array.isArray(healthData?.serviceHistory)
      ? healthData.serviceHistory
      : Array.isArray(selectedBike?.serviceHistory)
      ? selectedBike.serviceHistory
      : [];

  // =========================================================
  // HEALTH SCORE
  // =========================================================

  const overallScore = Number(
    healthData?.healthScore ??
      selectedBike?.health ??
      100
  );

  const overallStatus =
    healthData?.healthStatus || "Good";

  // =========================================================
  // SERVICE STATUS
  // =========================================================

  const serviceStatus = useMemo(() => {
    const backendStatus =
      healthData?.serviceStatus;

    if (
      backendStatus === "Service Due" ||
      remainingKm <= 0
    ) {
      return {
        text: "Service Due",
        className: "danger",
      };
    }

    if (
      backendStatus === "Service Soon" ||
      remainingKm <= 500
    ) {
      return {
        text: "Service Soon",
        className: "warning",
      };
    }

    return {
      text: backendStatus || "Good",
      className: "good",
    };
  }, [
    healthData?.serviceStatus,
    remainingKm,
  ]);

  // =========================================================
  // COMPONENT DATA
  // =========================================================

  const backendComponents =
    Array.isArray(healthData?.components)
      ? healthData.components
      : [];

  const getComponent = (name) => {
    const component =
      backendComponents.find(
        (item) =>
          String(item.name || "")
            .toLowerCase() ===
          name.toLowerCase()
      );

    return component || null;
  };

  const engine = getComponent("Engine");
  const brakes = getComponent("Brakes");
  const tyres = getComponent("Tyres");
  const battery = getComponent("Battery");
  const chain = getComponent("Chain");

  // Backend uses "Oil"; UI uses "Engine Oil".
  const oil =
    getComponent("Oil") ||
    getComponent("Engine Oil");

  const engineScore = Number(
    engine?.score ?? 100
  );

  const brakeScore = Number(
    brakes?.score ?? 95
  );

  const tyreScore = Number(
    tyres?.score ?? 95
  );

  const batteryScore = Number(
    battery?.score ?? 95
  );

  const chainScore = Number(
    chain?.score ?? 95
  );

  const oilScore = Number(
    oil?.score ?? 96
  );

  const engineStatus =
    engine?.status || "Excellent";

  const brakeStatus =
    brakes?.status || "Good";

  const tyreStatus =
    tyres?.status || "Good";

  const batteryStatus =
    battery?.status || "Good";

  const chainStatus =
    chain?.status || "Good";

  const oilStatus =
    oil?.status || "Good";

  // =========================================================
  // COMPONENT SCORES
  // =========================================================

  const componentScores = useMemo(() => {
    return [
      {
        name: "Engine",
        score: engineScore,
      },
      {
        name: "Brakes",
        score: brakeScore,
      },
      {
        name: "Tyres",
        score: tyreScore,
      },
      {
        name: "Battery",
        score: batteryScore,
      },
      {
        name: "Chain",
        score: chainScore,
      },
      {
        name: "Engine Oil",
        score: oilScore,
      },
    ];
  }, [
    engineScore,
    brakeScore,
    tyreScore,
    batteryScore,
    chainScore,
    oilScore,
  ]);

  // =========================================================
  // STRONGEST / WEAKEST COMPONENT
  // =========================================================

  const strongestComponent = useMemo(() => {
    if (componentScores.length === 0) {
      return {
        name: "None",
        score: 0,
      };
    }

    return componentScores.reduce(
      (highest, component) =>
        component.score > highest.score
          ? component
          : highest
    );
  }, [componentScores]);

  const weakestComponent = useMemo(() => {
    if (componentScores.length === 0) {
      return {
        name: "None",
        score: 0,
      };
    }

    return componentScores.reduce(
      (lowest, component) =>
        component.score < lowest.score
          ? component
          : lowest
    );
  }, [componentScores]);

  // =========================================================
  // HEALTH ALERTS
  // =========================================================

  const healthAlerts = useMemo(() => {
    const backendAlerts =
      Array.isArray(healthData?.alerts)
        ? healthData.alerts
        : [];

    if (backendAlerts.length > 0) {
      return backendAlerts.map(
        (alert, index) => {
          const severity =
            alert.severity || "medium";

          let type = "warning";
          let icon = "⚠️";
          let priority = "MEDIUM";

          if (severity === "high") {
            type = "danger";
            icon = "🔴";
            priority = "HIGH";
          } else if (
            severity === "low"
          ) {
            type = "info";
            icon = "🔵";
            priority = "LOW";
          }

          if (
            String(alert.title || "")
              .toLowerCase()
              .includes("good")
          ) {
            type = "success";
            icon = "✅";
            priority = "GOOD";
          }

          return {
            id:
              alert.id ||
              `backend-alert-${index}`,
            type,
            icon,
            title:
              alert.title ||
              "Maintenance Alert",
            priority,
            message:
              alert.message ||
              "Maintenance attention may be required.",
            action:
              alert.action ||
              "Check the recommended maintenance.",
          };
        }
      );
    }

    if (!selectedBike) {
      return [];
    }

    return [
      {
        id: "all-good",
        type: "success",
        icon: "✅",
        title: "Everything Looks Good",
        priority: "GOOD",
        message:
          "No important maintenance alerts were detected for your bike.",
        action:
          "Continue following the recommended maintenance schedule.",
      },
    ];
  }, [
    healthData?.alerts,
    selectedBike,
  ]);

  // =========================================================
  // EMPTY STATE - NO BIKES
  // =========================================================

  if (bikes.length === 0) {
    return (
      <div className="health-page">
        <div className="health-empty-state">
          <div className="health-empty-icon">
            🏍️
          </div>

          <h2>No Bike Added</h2>

          <p>
            Add your bike to start monitoring its
            health, maintenance and service condition.
          </p>

          <button
            type="button"
            className="health-primary-btn"
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

  // =========================================================
  // EMPTY STATE - NO SELECTED BIKE
  // =========================================================

  if (!selectedBike) {
    return (
      <div className="health-page">
        <div className="health-empty-state">
          <div className="health-empty-icon">
            🏍️
          </div>

          <h2>Select Your Bike</h2>

          <p>
            Select a bike to view its health,
            maintenance and service condition.
          </p>

          <select
            value={selectedBikeId || ""}
            onChange={handleBikeChange}
            className="health-bike-select"
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
                {bike.brand} {bike.model}
                {bike.registrationNumber
                  ? ` - ${bike.registrationNumber}`
                  : ""}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <div className="health-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="health-page-header">
        <div>
          <p className="health-page-eyebrow">
            SMART BIKE CARE
          </p>

          <h1>
            Bike Health
          </h1>

          <p className="health-page-subtitle">
            Monitor your bike's maintenance condition
            and overall health.
          </p>
        </div>

        <button
          type="button"
          className="health-refresh-btn"
          onClick={refreshHealth}
          disabled={healthLoading}
        >
          {healthLoading
            ? "↻ Loading..."
            : "↻ Refresh"}
        </button>
      </div>

      {/* =====================================================
          LOADING / ERROR
      ===================================================== */}

      {healthLoading && (
        <div className="health-loading">
          Loading bike health...
        </div>
      )}

      {healthError && (
        <div className="health-error">
          {healthError}
        </div>
      )}

      {/* =====================================================
          BIKE SELECTOR
      ===================================================== */}

      <section className="health-bike-selector-section">
        <div className="health-bike-selector-content">

          <div>
            <span className="health-selector-label">
              Select Bike
            </span>

            <h2>
              {selectedBike.brand}{" "}
              {selectedBike.model}
            </h2>

            <p>
              {selectedBike.registrationNumber ||
                "Registration not available"}
            </p>
          </div>

          <select
            value={selectedBikeId || ""}
            onChange={handleBikeChange}
            className="health-bike-select"
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
      </section>

      {/* =====================================================
          SELECTED BIKE
      ===================================================== */}

      <section className="health-selected-bike-section">

        <div className="health-selected-bike-image">
          {selectedBike.imageData ? (
            <img
              src={selectedBike.imageData}
              alt={`${selectedBike.brand} ${selectedBike.model}`}
            />
          ) : (
            <div className="health-bike-placeholder">
              🏍️
            </div>
          )}
        </div>

        <div className="health-selected-bike-info">

          <span className="health-bike-label">
            YOUR BIKE
          </span>

          <h2>
            {selectedBike.brand}{" "}
            {selectedBike.model}
          </h2>

          <p className="health-bike-registration">
            {selectedBike.registrationNumber}
          </p>

          <div className="health-bike-meta">

            <div>
              <span>Year</span>

              <strong>
                {selectedBike.year || "-"}
              </strong>
            </div>

            <div>
              <span>Odometer</span>

              <strong>
                {odometer.toLocaleString()} km
              </strong>
            </div>

            <div>
              <span>Health</span>

              <strong>
                {overallScore}%
              </strong>
            </div>

          </div>
        </div>

        <div className="health-selected-bike-score">

          <div className="health-score-circle">
            <span>
              {overallScore}
            </span>

            <small>
              /100
            </small>
          </div>

          <strong>
            {overallStatus}
          </strong>

        </div>
      </section>

      {/* =====================================================
          OVERVIEW
      ===================================================== */}

      <section className="health-overview-section">

        <div className="health-section-header">
          <div>

            <span className="health-section-label">
              OVERVIEW
            </span>

            <h2>
              Bike Overview
            </h2>

            <p>
              Current estimated condition of major bike
              components.
            </p>

          </div>
        </div>

        <div className="health-overview-grid">

          {/* ENGINE */}

          <div className="health-overview-card">

            <div className="health-card-top">

              <div className="health-card-icon">
                ⚙️
              </div>

              <span className="health-card-score">
                {engineScore}%
              </span>

            </div>

            <h3>
              Engine
            </h3>

            <p>
              {engineStatus}
            </p>

            <div className="health-progress">
              <div
                className="health-progress-fill"
                style={{
                  width: `${engineScore}%`,
                }}
              />
            </div>

          </div>

          {/* BRAKES */}

          <div className="health-overview-card">

            <div className="health-card-top">

              <div className="health-card-icon">
                🛑
              </div>

              <span className="health-card-score">
                {brakeScore}%
              </span>

            </div>

            <h3>
              Brakes
            </h3>

            <p>
              {brakeStatus}
            </p>

            <div className="health-progress">
              <div
                className="health-progress-fill"
                style={{
                  width: `${brakeScore}%`,
                }}
              />
            </div>

          </div>

          {/* TYRES */}

          <div className="health-overview-card">

            <div className="health-card-top">

              <div className="health-card-icon">
                🛞
              </div>

              <span className="health-card-score">
                {tyreScore}%
              </span>

            </div>

            <h3>
              Tyres
            </h3>

            <p>
              {tyreStatus}
            </p>

            <div className="health-progress">
              <div
                className="health-progress-fill"
                style={{
                  width: `${tyreScore}%`,
                }}
              />
            </div>

          </div>

          {/* BATTERY */}

          <div className="health-overview-card">

            <div className="health-card-top">

              <div className="health-card-icon">
                🔋
              </div>

              <span className="health-card-score">
                {batteryScore}%
              </span>

            </div>

            <h3>
              Battery
            </h3>

            <p>
              {batteryStatus}
            </p>

            <div className="health-progress">
              <div
                className="health-progress-fill"
                style={{
                  width: `${batteryScore}%`,
                }}
              />
            </div>

          </div>

          {/* CHAIN */}

          <div className="health-overview-card">

            <div className="health-card-top">

              <div className="health-card-icon">
                🔗
              </div>

              <span className="health-card-score">
                {chainScore}%
              </span>

            </div>

            <h3>
              Chain
            </h3>

            <p>
              {chainStatus}
            </p>

            <div className="health-progress">
              <div
                className="health-progress-fill"
                style={{
                  width: `${chainScore}%`,
                }}
              />
            </div>

          </div>

          {/* ENGINE OIL */}

          <div className="health-overview-card">

            <div className="health-card-top">

              <div className="health-card-icon">
                🛢️
              </div>

              <span className="health-card-score">
                {oilScore}%
              </span>

            </div>

            <h3>
              Engine Oil
            </h3>

            <p>
              {oilStatus}
            </p>

            <div className="health-progress">
              <div
                className="health-progress-fill"
                style={{
                  width: `${oilScore}%`,
                }}
              />
            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          H3 ENGINE HEALTH
      ===================================================== */}

      <section className="health-detail-section">

        <div className="health-detail-header">

          <div className="health-detail-title">

            <div className="health-detail-icon">
              ⚙️
            </div>

            <div>
              <span>H3</span>
              <h2>
                Engine Health
              </h2>
            </div>

          </div>

          <span className="health-detail-status">
            {engineStatus}
          </span>

        </div>

        <div className="health-detail-body">

          <div className="health-detail-score">

            <div className="health-score-circle">

              <span>
                {engineScore}
              </span>

              <small>
                %
              </small>

            </div>

          </div>

          <div className="health-detail-info">

            <div className="health-info-card">
              <span>
                Current Odometer
              </span>

              <strong>
                {odometer.toLocaleString()} km
              </strong>
            </div>

            <div className="health-info-card">
              <span>
                Next Service
              </span>

              <strong>
                {nextService.toLocaleString()} km
              </strong>
            </div>

            <div className="health-info-card">
              <span>
                Remaining
              </span>

              <strong>
                {Math.max(
                  remainingKm,
                  0
                ).toLocaleString()} km
              </strong>
            </div>

          </div>
        </div>

        <div className="health-maintenance-message">

          <strong>
            Maintenance Recommendation
          </strong>

          <p>
            {remainingKm <= 0
              ? "Engine maintenance is due. Schedule a service inspection as soon as possible."
              : remainingKm <= 500
              ? "Your bike is approaching its service interval. Plan an engine inspection soon."
              : "Engine condition is currently good. Continue following the recommended maintenance schedule."}
          </p>

        </div>

      </section>

      {/* =====================================================
          H4 BRAKE HEALTH
      ===================================================== */}

      <section className="health-detail-section">

        <div className="health-detail-header">

          <div className="health-detail-title">

            <div className="health-detail-icon">
              🛑
            </div>

            <div>
              <span>H4</span>
              <h2>
                Brake Health
              </h2>
            </div>

          </div>

          <span className="health-detail-status">
            {brakeStatus}
          </span>

        </div>

        <div className="health-detail-body">

          <div className="health-detail-score">

            <div className="health-score-circle">

              <span>
                {brakeScore}
              </span>

              <small>
                %
              </small>

            </div>

          </div>

          <div className="health-detail-info">

            <div className="health-info-card">
              <span>
                Brake Condition
              </span>

              <strong>
                {brakeStatus}
              </strong>
            </div>

            <div className="health-info-card">
              <span>
                Inspection
              </span>

              <strong>
                Recommended
              </strong>
            </div>

            <div className="health-info-card">
              <span>
                Service Interval
              </span>

              <strong>
                5,000 km
              </strong>
            </div>

          </div>
        </div>

        <div className="health-maintenance-message">

          <strong>
            Brake Safety Recommendation
          </strong>

          <p>
            Check brake pad wear, brake fluid level and
            braking performance during regular maintenance.
          </p>

        </div>

      </section>

      {/* =====================================================
          H5 TYRE HEALTH
      ===================================================== */}

      <section className="health-detail-section">

        <div className="health-detail-header">

          <div className="health-detail-title">

            <div className="health-detail-icon">
              🛞
            </div>

            <div>
              <span>H5</span>
              <h2>
                Tyre Health
              </h2>
            </div>

          </div>

          <span className="health-detail-status">
            {tyreStatus}
          </span>

        </div>

        <div className="health-detail-body">

          <div className="health-detail-score">

            <div className="health-score-circle">

              <span>
                {tyreScore}
              </span>

              <small>
                %
              </small>

            </div>

          </div>

          <div className="health-detail-info">

            <div className="health-info-card">
              <span>
                Tyre Condition
              </span>

              <strong>
                {tyreStatus}
              </strong>
            </div>

            <div className="health-info-card">
              <span>
                Pressure Check
              </span>

              <strong>
                Recommended
              </strong>
            </div>

            <div className="health-info-card">
              <span>
                Tread Inspection
              </span>

              <strong>
                Recommended
              </strong>
            </div>

          </div>

        </div>

        <div className="health-maintenance-message">

          <strong>
            Tyre Safety Recommendation
          </strong>

          <p>
            Check tyre pressure, tread depth and visible
            damage regularly, especially before long rides.
          </p>

        </div>

      </section>

      {/* =====================================================
          H6 BATTERY HEALTH
      ===================================================== */}

      <section className="health-detail-section">

        <div className="health-detail-header">

          <div className="health-detail-title">

            <div className="health-detail-icon">
              🔋
            </div>

            <div>
              <span>H6</span>
              <h2>
                Battery Health
              </h2>
            </div>

          </div>

          <span className="health-detail-status">
            {batteryStatus}
          </span>

        </div>

        <div className="health-detail-body">

          <div className="health-detail-score">

            <div className="health-score-circle">

              <span>
                {batteryScore}
              </span>

              <small>
                %
              </small>

            </div>

          </div>

          <div className="health-detail-info">

            <div className="health-info-card">
              <span>
                Battery Condition
              </span>

              <strong>
                {batteryStatus}
              </strong>
            </div>

            <div className="health-info-card">
              <span>
                Terminal Check
              </span>

              <strong>
                Recommended
              </strong>
            </div>

            <div className="health-info-card">
              <span>
                Electrical Check
              </span>

              <strong>
                Recommended
              </strong>
            </div>

          </div>

        </div>

        <div className="health-maintenance-message">

          <strong>
            Battery Recommendation
          </strong>

          <p>
            Check battery terminals, charging performance
            and electrical connections during maintenance.
          </p>

        </div>

      </section>

      {/* =====================================================
          H7 CHAIN HEALTH
      ===================================================== */}

      <section className="health-chain-section">

        <div className="health-chain-header">

          <div>

            <span>
              H7
            </span>

            <h2>
              Chain Health
            </h2>

            <p>
              Monitor chain condition and maintenance.
            </p>

          </div>

          <div className="health-chain-score">

            <span>
              {chainScore}
            </span>

            <small>
              %
            </small>

          </div>

        </div>

        <div className="health-chain-grid">

          <div className="health-chain-info-card">
            <span>
              Chain Condition
            </span>

            <strong>
              {chainStatus}
            </strong>
          </div>

          <div className="health-chain-info-card">
            <span>
              Lubrication
            </span>

            <strong>
              Recommended
            </strong>
          </div>

          <div className="health-chain-info-card">
            <span>
              Chain Slack
            </span>

            <strong>
              Check
            </strong>
          </div>

          <div className="health-chain-info-card">
            <span>
              Sprocket
            </span>

            <strong>
              Inspect
            </strong>
          </div>

        </div>

        <div className="health-chain-maintenance">

          <strong>
            Chain Maintenance Recommendation
          </strong>

          <p>
            Clean and lubricate the chain regularly. Check
            chain slack and sprocket wear during service.
          </p>

        </div>

      </section>

      {/* =====================================================
          H8 ENGINE OIL
      ===================================================== */}

      <section className="health-oil-section">

        <div className="health-oil-header">

          <div>

            <span>
              H8
            </span>

            <h2>
              Engine Oil Health
            </h2>

            <p>
              Monitor engine oil maintenance condition.
            </p>

          </div>

          <div className="health-oil-score">

            <span>
              {oilScore}
            </span>

            <small>
              %
            </small>

          </div>

        </div>

        <div className="health-oil-grid">

          <div className="health-oil-info-card">
            <span>
              Oil Condition
            </span>

            <strong>
              {oilStatus}
            </strong>
          </div>

          <div className="health-oil-info-card">
            <span>
              Current Odometer
            </span>

            <strong>
              {odometer.toLocaleString()} km
            </strong>
          </div>

          <div className="health-oil-info-card">
            <span>
              Next Service
            </span>

            <strong>
              {nextService.toLocaleString()} km
            </strong>
          </div>

          <div className="health-oil-info-card">
            <span>
              Remaining Distance
            </span>

            <strong>
              {Math.max(
                remainingKm,
                0
              ).toLocaleString()} km
            </strong>
          </div>

        </div>

        <div className="health-oil-maintenance">

          <strong>
            Oil Maintenance Recommendation
          </strong>

          <p>
            {oilScore <= 60
              ? "Engine oil service is due. Check oil level and replace the oil according to the manufacturer's recommendation."
              : oilScore <= 82
              ? "Engine oil maintenance is approaching. Plan an oil check or replacement soon."
              : "Engine oil condition is currently within the recommended maintenance range."}
          </p>

        </div>

        <div className="health-oil-checklist">

          <div>
            <span>✓</span>
            <p>
              Check oil level
            </p>
          </div>

          <div>
            <span>✓</span>
            <p>
              Check oil condition
            </p>
          </div>

          <div>
            <span>✓</span>
            <p>
              Check oil change interval
            </p>
          </div>

          <div>
            <span>✓</span>
            <p>
              Check for oil leakage
            </p>
          </div>

        </div>

        <div className="health-oil-tip">

          <strong>
            Maintenance Tip
          </strong>

          <p>
            Always use the engine oil grade recommended by
            your bike manufacturer.
          </p>

        </div>

      </section>

      {/* =====================================================
          H9 OVERALL HEALTH SCORE
      ===================================================== */}

      <section className="health-score-section">

        <div className="health-score-header">

          <div>

            <span>
              H9
            </span>

            <h2>
              Overall Health Score
            </h2>

            <p>
              Combined health assessment of your bike's
              major components.
            </p>

          </div>

          <div className="health-overall-score-circle">

            <span>
              {overallScore}
            </span>

            <small>
              /100
            </small>

          </div>

        </div>

        <div className="health-score-assessment">

          <div className="health-score-assessment-card">
            <span>
              Health Assessment
            </span>

            <strong>
              {overallStatus}
            </strong>
          </div>

          <div className="health-score-assessment-card">
            <span>
              Strongest Area
            </span>

            <strong>
              {strongestComponent.name}
            </strong>
          </div>

          <div className="health-score-assessment-card">
            <span>
              Needs Attention
            </span>

            <strong>
              {weakestComponent.score < 75
                ? weakestComponent.name
                : "None"}
            </strong>
          </div>

          <div className="health-score-assessment-card">
            <span>
              Current Odometer
            </span>

            <strong>
              {odometer.toLocaleString()} km
            </strong>
          </div>

          <div className="health-score-assessment-card">
            <span>
              Next Service
            </span>

            <strong>
              {nextService.toLocaleString()} km
            </strong>
          </div>

        </div>

        <div className="health-component-scores">

          <h3>
            Component Health
          </h3>

          {componentScores.map(
            (component) => (
              <div
                className="health-component-row"
                key={component.name}
              >

                <div className="health-component-name">

                  <span>
                    {component.name}
                  </span>

                  <strong>
                    {component.score}%
                  </strong>

                </div>

                <div className="health-progress">

                  <div
                    className="health-progress-fill"
                    style={{
                      width: `${component.score}%`,
                    }}
                  />

                </div>

              </div>
            )
          )}

        </div>

        <div className="health-score-guide">

          <h3>
            Health Score Guide
          </h3>

          <div className="health-guide-grid">

            <div>
              <span>
                90–100
              </span>

              <p>
                Excellent
              </p>
            </div>

            <div>
              <span>
                75–89
              </span>

              <p>
                Good
              </p>
            </div>

            <div>
              <span>
                60–74
              </span>

              <p>
                Needs Attention
              </p>
            </div>

            <div>
              <span>
                Below 60
              </span>

              <p>
                Critical
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          H10 HEALTH ALERTS
      ===================================================== */}

      <section className="health-alerts-section">

        <div className="health-alerts-header">

          <div>

            <p className="health-section-label">
              H10
            </p>

            <h2>
              Health Alerts
            </h2>

            <p>
              Important maintenance alerts based on your
              bike's current condition.
            </p>

          </div>

          <div className="health-alerts-count">

            {healthAlerts.length}

            <span>
              Alerts
            </span>

          </div>

        </div>

        <div className="health-alert-list">

          {healthAlerts.map(
            (alert) => (
              <div
                key={alert.id}
                className={`health-alert-card health-alert-card-${alert.type}`}
              >

                <div className="health-alert-icon">
                  {alert.icon}
                </div>

                <div className="health-alert-content">

                  <div className="health-alert-title-row">

                    <h3>
                      {alert.title}
                    </h3>

                    <span
                      className={`health-alert-badge health-alert-badge-${alert.type}`}
                    >
                      {alert.priority}
                    </span>

                  </div>

                  <p>
                    {alert.message}
                  </p>

                  {alert.action && (
                    <div className="health-alert-action">

                      <strong>
                        Recommended:
                      </strong>{" "}

                      {alert.action}

                    </div>
                  )}

                </div>

              </div>
            )
          )}

        </div>

      </section>

      {/* =====================================================
          H11 HEALTH & SERVICE HISTORY
      ===================================================== */}

      <section className="health-history-section">

        <div className="health-history-header">

          <div>

            <span className="health-section-label">
              H11 • HEALTH HISTORY
            </span>

            <h2>
              Health & Service History
            </h2>

            <p>
              Review the maintenance and service records
              for your bike.
            </p>

          </div>

          <div className="health-history-info">

            <span className="health-history-count">

              {serviceHistory.length} Record
              {serviceHistory.length !== 1
                ? "s"
                : ""}

            </span>

          </div>

        </div>

        {serviceHistory.length > 0 ? (

          <div className="health-history-list">

            {serviceHistory
              .slice()
              .sort((a, b) => {

                const dateA =
                  new Date(a.date || 0);

                const dateB =
                  new Date(b.date || 0);

                return dateB - dateA;
              })
              .map(
                (service, index) => {

                  const billAvailable =
                    Boolean(
                      service.billName ||
                        service.billData
                    );

                  return (
                    <div
                      className="health-history-card"
                      key={
                        service.id ||
                        index
                      }
                    >

                      <div className="health-history-icon">
                        🔧
                      </div>

                      <div className="health-history-content">

                        <div className="health-history-card-header">

                          <div>

                            <h3>
                              {service.service ||
                                "Bike Service"}
                            </h3>

                            <span className="health-history-date">

                              {service.date
                                ? new Date(
                                    service.date
                                  ).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )
                                : "Date not available"}

                            </span>

                          </div>

                          <span
                            className={`health-history-status ${
                              service.status
                                ? service.status
                                    .toLowerCase()
                                    .replace(
                                      /\s+/g,
                                      "-"
                                    )
                                : "completed"
                            }`}
                          >
                            {service.status ||
                              "Completed"}
                          </span>

                        </div>

                        <div className="health-history-details">

                          <div className="health-history-detail">

                            <span className="health-history-detail-label">
                              Odometer
                            </span>

                            <strong>

                              {service.kilometers !==
                                undefined &&
                              service.kilometers !==
                                null &&
                              service.kilometers !==
                                ""
                                ? `${Number(
                                    service.kilometers
                                  ).toLocaleString()} km`
                                : "N/A"}

                            </strong>

                          </div>

                          <div className="health-history-detail">

                            <span className="health-history-detail-label">
                              Amount
                            </span>

                            <strong>

                              {service.amount !==
                                undefined &&
                              service.amount !==
                                null &&
                              service.amount !==
                                ""
                                ? `₹${Number(
                                    service.amount
                                  ).toLocaleString(
                                    "en-IN"
                                  )}`
                                : "N/A"}

                            </strong>

                          </div>

                          <div className="health-history-detail">

                            <span className="health-history-detail-label">
                              Bill
                            </span>

                            <strong>
                              {billAvailable
                                ? "Available"
                                : "Not Added"}
                            </strong>

                          </div>

                        </div>

                        {billAvailable && (
                          <div className="health-history-bill">

                            📄{" "}

                            {service.billName ||
                              "Service Bill"}

                          </div>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

          </div>

        ) : (

          <div className="health-history-empty">

            <div className="health-history-empty-icon">
              📋
            </div>

            <h3>
              No Service History
            </h3>

            <p>
              Service and maintenance records will
              appear here after you add your first
              service.
            </p>

            <button
              type="button"
              className="health-primary-btn"
              onClick={() =>
                navigate("/service")
              }
            >
              Add Service Record
            </button>

          </div>

        )}

      </section>

      {/* =====================================================
          MAINTENANCE STATUS
      ===================================================== */}

      <section className="maintenance-status-section">

        <div className="maintenance-status-header">

          <div>

            <span>
              MAINTENANCE
            </span>

            <h2>
              Maintenance Status
            </h2>

          </div>

          <div
            className={`maintenance-status-badge ${serviceStatus.className}`}
          >
            {serviceStatus.text}
          </div>

        </div>

        <div className="maintenance-status-grid">

          <div>
            <span>
              Current Odometer
            </span>

            <strong>
              {odometer.toLocaleString()} km
            </strong>
          </div>

          <div>
            <span>
              Next Service
            </span>

            <strong>
              {nextService.toLocaleString()} km
            </strong>
          </div>

          <div>
            <span>
              Remaining
            </span>

            <strong>
              {Math.max(
                remainingKm,
                0
              ).toLocaleString()} km
            </strong>
          </div>

          <div>
            <span>
              Last Service
            </span>

            <strong>
              {lastService
                ? new Date(
                    lastService
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )
                : "Not available"}
            </strong>
          </div>

        </div>

        <div className="maintenance-status-message">

          {remainingKm <= 0 ? (
            <>
              <strong>
                Service is due.
              </strong>

              <p>
                Your bike has reached the recommended
                service interval. Schedule maintenance
                as soon as possible.
              </p>
            </>
          ) : remainingKm <= 500 ? (
            <>
              <strong>
                Service is approaching.
              </strong>

              <p>
                Only {remainingKm} km remain before
                the next recommended service.
              </p>
            </>
          ) : (
            <>
              <strong>
                Maintenance is on track.
              </strong>

              <p>
                Your bike has approximately{" "}
                {remainingKm.toLocaleString()} km
                remaining before the next service.
              </p>
            </>
          )}

        </div>

      </section>

      {/* =====================================================
          HEALTH SUMMARY
      ===================================================== */}

      <section className="health-summary-section">

        <div className="health-summary-icon">
          💡
        </div>

        <div>

          <span>
            HEALTH SUMMARY
          </span>

          <h2>

            {overallStatus === "Excellent"
              ? "Your bike is in excellent condition."
              : overallStatus === "Good"
              ? "Your bike is in good condition."
              : overallStatus ===
                "Needs Attention"
              ? "Your bike needs some maintenance attention."
              : "Your bike requires immediate maintenance attention."}

          </h2>

          <p>

            Overall estimated health score:{" "}
            <strong>
              {overallScore}%
            </strong>.
            Continue checking your bike regularly
            and follow the recommended service
            schedule.

          </p>

        </div>

      </section>

    </div>
  );
};

export default Health;

