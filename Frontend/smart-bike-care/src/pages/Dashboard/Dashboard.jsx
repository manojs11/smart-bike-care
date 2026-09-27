import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBikes } from "../../context/BikeContext";
import { getDashboard } from "../../services/dashboardApi";
import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();

    const {
        bikes: contextBikes,
        selectedBike,
        selectedBikeId,
        setSelectedBike,
    } = useBikes();

    const [dashboardResponse, setDashboardResponse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /*
     * Load dashboard data from backend
     */
    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getDashboard();

                setDashboardResponse(response?.data || null);
            } catch (err) {
                console.error(
                    "Failed to load dashboard:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                        "Failed to load dashboard data."
                );
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    /*
     * Backend bikes are the primary dashboard source.
     * Context bikes are used as a fallback.
     */
    const bikes = useMemo(() => {
        if (
            dashboardResponse?.bikes &&
            Array.isArray(dashboardResponse.bikes)
        ) {
            return dashboardResponse.bikes;
        }

        return Array.isArray(contextBikes)
            ? contextBikes
            : [];
    }, [dashboardResponse, contextBikes]);

    /*
     * Find currently selected bike.
     *
     * Dashboard backend data can contain a fresh copy
     * of the bike, so prefer that over the old context object.
     */
    const currentBike = useMemo(() => {
        if (!bikes.length) {
            return null;
        }

        if (selectedBikeId) {
            const matchedBike = bikes.find(
                (bike) =>
                    String(bike.id) ===
                    String(selectedBikeId)
            );

            if (matchedBike) {
                return matchedBike;
            }
        }

        if (selectedBike?.id) {
            const matchedBike = bikes.find(
                (bike) =>
                    String(bike.id) ===
                    String(selectedBike.id)
            );

            if (matchedBike) {
                return matchedBike;
            }
        }

        return bikes[0];
    }, [bikes, selectedBikeId, selectedBike]);

    /*
     * Keep selected bike in context when backend data is loaded.
     */
    useEffect(() => {
        if (!currentBike) {
            return;
        }

        if (
            String(selectedBikeId || "") !==
            String(currentBike.id)
        ) {
            setSelectedBike(currentBike.id);
        }
    }, [
        currentBike,
        selectedBikeId,
        setSelectedBike,
    ]);

    /*
     * Bike selector
     */
    const handleBikeChange = (event) => {
        const bikeId = event.target.value;

        if (!bikeId) {
            return;
        }

        setSelectedBike(bikeId);
    };

    const handleHome = () => {
        navigate("/");
    };

    /*
     * Dashboard summary data.
     *
     * These values now come from the backend dashboard
     * whenever available.
     */
    const dashboardData = useMemo(() => {
        const totalBikes =
            Number(
                dashboardResponse?.totalBikes
            ) || bikes.length;

        const totalServices =
            Number(
                dashboardResponse?.totalServices
            ) ||
            bikes.reduce(
                (total, bike) =>
                    total +
                    (bike.serviceHistory?.length || 0),
                0
            );

        const serviceDue =
            Number(
                dashboardResponse?.serviceDueBikes
            ) ||
            bikes.filter((bike) => {
                const currentKm =
                    Number(bike.odometer || 0);

                const nextServiceKm =
                    Number(bike.nextService || 0);

                return (
                    nextServiceKm > 0 &&
                    currentKm >= nextServiceKm
                );
            }).length;

        const serviceSoon =
            Number(
                dashboardResponse?.serviceSoonBikes
            ) ||
            bikes.filter((bike) => {
                const currentKm =
                    Number(bike.odometer || 0);

                const nextServiceKm =
                    Number(bike.nextService || 0);

                const remaining =
                    nextServiceKm - currentKm;

                return (
                    nextServiceKm > 0 &&
                    remaining > 0 &&
                    remaining <= 500
                );
            }).length;

        const totalAlerts =
            serviceDue + serviceSoon;

        const averageHealth =
            totalBikes > 0
                ? Math.round(
                      bikes.reduce(
                          (total, bike) =>
                              total +
                              Number(
                                  bike.health || 0
                              ),
                          0
                      ) / totalBikes
                  )
                : 0;

        const totalServiceAmount =
            Number(
                dashboardResponse?.totalServiceAmount
            ) || 0;

        return {
            totalBikes,
            totalServices,
            totalAlerts,
            serviceDue,
            serviceSoon,
            averageHealth,
            totalServiceAmount,
        };
    }, [dashboardResponse, bikes]);

    /*
     * Current bike service information
     */
    const bikeServiceData = useMemo(() => {
        if (!currentBike) {
            return {
                currentKm: 0,
                nextServiceKm: 0,
                remainingKm: 0,
                serviceStatus: "Not Set",
                serviceClass: "not-set",
            };
        }

        const currentKm =
            Number(currentBike.odometer || 0);

        const nextServiceKm =
            Number(currentBike.nextService || 0);

        const remainingKm =
            nextServiceKm - currentKm;

        let serviceStatus =
            "Service On Track";

        let serviceClass = "good";

        if (nextServiceKm <= 0) {
            serviceStatus = "Not Set";
            serviceClass = "not-set";
        } else if (remainingKm <= 0) {
            serviceStatus = "Service Due";
            serviceClass = "due";
        } else if (remainingKm <= 500) {
            serviceStatus = "Service Soon";
            serviceClass = "upcoming";
        }

        return {
            currentKm,
            nextServiceKm,
            remainingKm,
            serviceStatus,
            serviceClass,
        };
    }, [currentBike]);

    /*
     * Service status cards
     */
    const serviceStatus = useMemo(() => {
        if (!currentBike) {
            return [];
        }

        const getServiceDetails = () => {
            if (
                bikeServiceData.serviceStatus ===
                "Service Due"
            ) {
                return {
                    status: "Service Due",
                    className: "due",
                    icon: "🔴",
                };
            }

            if (
                bikeServiceData.serviceStatus ===
                "Service Soon"
            ) {
                return {
                    status: "Coming Soon",
                    className: "upcoming",
                    icon: "🟡",
                };
            }

            if (
                bikeServiceData.serviceStatus ===
                "Not Set"
            ) {
                return {
                    status: "Not Set",
                    className: "not-set",
                    icon: "⚪",
                };
            }

            return {
                status: "Not Due",
                className: "good",
                icon: "🟢",
            };
        };

        const generalService =
            getServiceDetails();

        return [
            {
                name: "General Service",
                ...generalService,
            },
            {
                name: "Engine Oil",
                ...generalService,
            },
            {
                name: "Chain Service",
                ...generalService,
            },
            {
                name: "Brake Inspection",
                ...generalService,
            },
        ];
    }, [
        currentBike,
        bikeServiceData,
    ]);

    /*
     * Last service
     */
    const lastService = useMemo(() => {
        if (!currentBike) {
            return "No service yet";
        }

        if (currentBike.lastService) {
            return currentBike.lastService;
        }

        if (
            currentBike.serviceHistory?.length > 0
        ) {
            const latestService =
                currentBike.serviceHistory[0];

            return (
                latestService?.date ||
                "Recorded"
            );
        }

        return "No service yet";
    }, [currentBike]);

    /*
     * Loading state
     */
    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-empty">
                    <div className="dashboard-empty-icon">
                        🏍️
                    </div>

                    <p className="dashboard-empty-label">
                        DASHBOARD
                    </p>

                    <h2>
                        Loading Dashboard
                    </h2>

                    <p className="dashboard-empty-description">
                        Loading your bike maintenance
                        information...
                    </p>
                </div>
            </div>
        );
    }

    /*
     * Backend/API error
     */
    if (error && !bikes.length) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-welcome">
                    <div>
                        <p>Welcome back 👋</p>

                        <h1>
                            Your Bike Maintenance Overview
                        </h1>

                        <span>
                            Keep your bike healthy and
                            ready for every journey.
                        </span>
                    </div>

                    <div className="dashboard-welcome-actions">
                        <button
                            type="button"
                            className="dashboard-home-button"
                            onClick={handleHome}
                        >
                            Home
                        </button>

                        <button
                            type="button"
                            className="dashboard-add-bike-button"
                            onClick={() =>
                                navigate("/bikes/add")
                            }
                        >
                            + Add Bike
                        </button>
                    </div>
                </div>

                <div className="dashboard-empty">
                    <div className="dashboard-empty-icon">
                        ⚠️
                    </div>

                    <p className="dashboard-empty-label">
                        DASHBOARD ERROR
                    </p>

                    <h2>
                        Unable to Load Dashboard
                    </h2>

                    <p className="dashboard-empty-description">
                        {error}
                    </p>

                    <button
                        type="button"
                        className="dashboard-primary-button"
                        onClick={() =>
                            window.location.reload()
                        }
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    /*
     * No bikes
     */
    if (!bikes.length) {
        return (
            <div className="dashboard-page">

                <div className="dashboard-welcome">
                    <div>
                        <p>
                            Welcome back 👋
                        </p>

                        <h1>
                            Your Bike Maintenance Overview
                        </h1>

                        <span>
                            Keep your bike healthy and
                            ready for every journey.
                        </span>
                    </div>

                    <div className="dashboard-welcome-actions">

                        <button
                            type="button"
                            className="dashboard-home-button"
                            onClick={handleHome}
                        >
                            Home
                        </button>

                        <button
                            type="button"
                            className="dashboard-add-bike-button"
                            onClick={() =>
                                navigate("/bikes/add")
                            }
                        >
                            + Add Bike
                        </button>

                    </div>
                </div>

                <div className="dashboard-empty">

                    <div className="dashboard-empty-icon">
                        🏍️
                    </div>

                    <p className="dashboard-empty-label">
                        GET STARTED
                    </p>

                    <h2>
                        No Bike Added
                    </h2>

                    <p className="dashboard-empty-description">
                        Add your first bike to start
                        managing maintenance, service
                        history, documents and bike health.
                    </p>

                    <button
                        type="button"
                        className="dashboard-primary-button"
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

    /*
     * Safety fallback
     */
    if (!currentBike) {
        return (
            <div className="dashboard-page">

                <div className="dashboard-welcome">
                    <div>
                        <p>
                            Welcome back 👋
                        </p>

                        <h1>
                            Your Bike Maintenance Overview
                        </h1>

                        <span>
                            Select a bike to view its
                            maintenance information.
                        </span>
                    </div>

                    <div className="dashboard-welcome-actions">

                        <button
                            type="button"
                            className="dashboard-home-button"
                            onClick={handleHome}
                        >
                            Home
                        </button>

                        <button
                            type="button"
                            className="dashboard-add-bike-button"
                            onClick={() =>
                                navigate("/bikes/add")
                            }
                        >
                            + Add Bike
                        </button>

                    </div>
                </div>

                <div className="dashboard-empty">

                    <div className="dashboard-empty-icon">
                        🏍️
                    </div>

                    <p className="dashboard-empty-label">
                        SELECT BIKE
                    </p>

                    <h2>
                        Select Your Bike
                    </h2>

                    <p className="dashboard-empty-description">
                        Select a bike to view its current
                        health, service status and
                        maintenance information.
                    </p>

                    <div className="dashboard-bike-selector-empty">

                        <label htmlFor="dashboard-bike-select-empty">
                            Select Bike
                        </label>

                        <select
                            id="dashboard-bike-select-empty"
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
                                    {bike.model}

                                    {bike.registrationNumber
                                        ? ` - ${bike.registrationNumber}`
                                        : ""}
                                </option>
                            ))}
                        </select>

                    </div>
                </div>
            </div>
        );
    }

    /*
     * Main Dashboard
     */
    return (
        <div className="dashboard-page">

            {/* Welcome */}
            <div className="dashboard-welcome">

                <div>
                    <p>
                        Welcome back 👋
                    </p>

                    <h1>
                        Your Bike Maintenance Overview
                    </h1>

                    <span>
                        Keep your bike healthy and ready
                        for every journey.
                    </span>
                </div>

                <div className="dashboard-welcome-actions">

                    <button
                        type="button"
                        className="dashboard-home-button"
                        onClick={handleHome}
                    >
                        Home
                    </button>

                    <button
                        type="button"
                        className="dashboard-add-bike-button"
                        onClick={() =>
                            navigate("/bikes/add")
                        }
                    >
                        + Add Bike
                    </button>

                </div>
            </div>

            {/* Current Bike */}
            <div className="dashboard-current-bike">

                <div className="current-bike-main">

                    <div className="current-bike-image">

                        {currentBike.imageData ? (
                            <img
                                src={
                                    currentBike.imageData
                                }
                                alt={`${currentBike.brand} ${currentBike.model}`}
                            />
                        ) : currentBike.image ? (
                            <img
                                src={currentBike.image}
                                alt={`${currentBike.brand} ${currentBike.model}`}
                            />
                        ) : (
                            <span>
                                🏍️
                            </span>
                        )}

                    </div>

                    <div className="current-bike-details">

                        <p className="dashboard-label">
                            CURRENT BIKE
                        </p>

                        <h2>
                            {currentBike.brand}{" "}
                            {currentBike.model}
                        </h2>

                        <p className="current-bike-registration">
                            {currentBike.registrationNumber ||
                                "Registration not available"}
                        </p>

                        <div className="current-bike-meta">

                            <div>
                                <span>
                                    Current KM
                                </span>

                                <strong>
                                    {bikeServiceData.currentKm.toLocaleString()}{" "}
                                    km
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Next Service
                                </span>

                                <strong>
                                    {bikeServiceData.nextServiceKm >
                                    0
                                        ? `${bikeServiceData.nextServiceKm.toLocaleString()} km`
                                        : "Not set"}
                                </strong>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="current-bike-right">

                    <div className="dashboard-bike-selector">

                        <label htmlFor="dashboard-bike-select">
                            Select Bike
                        </label>

                        <select
                            id="dashboard-bike-select"
                            value={
                                selectedBikeId ||
                                currentBike.id ||
                                ""
                            }
                            onChange={
                                handleBikeChange
                            }
                        >
                            {bikes.map((bike) => (
                                <option
                                    key={bike.id}
                                    value={bike.id}
                                >
                                    {bike.brand}{" "}
                                    {bike.model}

                                    {bike.registrationNumber
                                        ? ` - ${bike.registrationNumber}`
                                        : ""}
                                </option>
                            ))}
                        </select>

                    </div>

                    <div className="health-display">

                        <span>
                            Bike Health
                        </span>

                        <strong>
                            {Number(
                                currentBike.health || 0
                            )}
                            %
                        </strong>

                    </div>

                    <div
                        className={`service-status-pill ${bikeServiceData.serviceClass}`}
                    >
                        <span></span>

                        {bikeServiceData.serviceStatus}
                    </div>

                    <div className="current-bike-actions">

                        <button
                            type="button"
                            className="dashboard-secondary-button"
                            onClick={() =>
                                navigate(
                                    `/bikes/${currentBike.id}`
                                )
                            }
                        >
                            View Bike
                        </button>

                        <button
                            type="button"
                            className="dashboard-primary-button"
                            onClick={() =>
                                navigate("/service")
                            }
                        >
                            Record Service
                        </button>

                    </div>

                </div>
            </div>

            {/* Service Distance */}
            <div className="dashboard-service-distance">

                <div className="service-distance-header">

                    <div>
                        <p className="dashboard-label">
                            SERVICE SCHEDULE
                        </p>

                        <h2>
                            Next Service
                        </h2>
                    </div>

                    <strong>
                        {bikeServiceData.nextServiceKm >
                        0
                            ? `${bikeServiceData.nextServiceKm.toLocaleString()} KM`
                            : "Not Set"}
                    </strong>

                </div>

                {bikeServiceData.nextServiceKm >
                0 ? (
                    <>
                        <div className="service-progress-track">

                            <div
                                className={`service-progress-bar ${bikeServiceData.serviceClass}`}
                                style={{
                                    width: `${Math.min(
                                        Math.max(
                                            (bikeServiceData.currentKm /
                                                bikeServiceData.nextServiceKm) *
                                                100,
                                            0
                                        ),
                                        100
                                    )}%`,
                                }}
                            ></div>

                        </div>

                        <div className="service-distance-footer">

                            <span>
                                Current:{" "}
                                {bikeServiceData.currentKm.toLocaleString()}{" "}
                                km
                            </span>

                            <strong
                                className={`remaining-km ${bikeServiceData.serviceClass}`}
                            >
                                {bikeServiceData.remainingKm <=
                                0
                                    ? "Service Due"
                                    : `${bikeServiceData.remainingKm.toLocaleString()} km remaining`}
                            </strong>

                        </div>
                    </>
                ) : (
                    <p className="service-not-set-message">
                        Add service information to track
                        your next maintenance schedule.
                    </p>
                )}

            </div>

            {/* Summary Cards */}
            <div className="dashboard-summary-grid">

                <button
                    type="button"
                    className="dashboard-summary-card"
                    onClick={() =>
                        navigate("/bikes")
                    }
                >
                    <div className="summary-card-icon">
                        🏍️
                    </div>

                    <div>
                        <span>
                            My Bikes
                        </span>

                        <strong>
                            {dashboardData.totalBikes}
                        </strong>
                    </div>

                    <span className="summary-card-arrow">
                        →
                    </span>
                </button>

                <button
                    type="button"
                    className="dashboard-summary-card"
                    onClick={() =>
                        navigate("/health")
                    }
                >
                    <div className="summary-card-icon">
                        ❤️
                    </div>

                    <div>
                        <span>
                            Average Health
                        </span>

                        <strong>
                            {dashboardData.averageHealth}%
                        </strong>
                    </div>

                    <span className="summary-card-arrow">
                        →
                    </span>
                </button>

                <button
                    type="button"
                    className="dashboard-summary-card"
                    onClick={() =>
                        navigate("/reminders")
                    }
                >
                    <div className="summary-card-icon">
                        🔧
                    </div>

                    <div>
                        <span>
                            Service Due
                        </span>

                        <strong>
                            {dashboardData.serviceDue}
                        </strong>
                    </div>

                    <span className="summary-card-arrow">
                        →
                    </span>
                </button>

                <button
                    type="button"
                    className="dashboard-summary-card"
                    onClick={() =>
                        navigate("/reminders")
                    }
                >
                    <div className="summary-card-icon">
                        🔔
                    </div>

                    <div>
                        <span>
                            Alerts
                        </span>

                        <strong>
                            {dashboardData.totalAlerts}
                        </strong>
                    </div>

                    <span className="summary-card-arrow">
                        →
                    </span>
                </button>

            </div>

            {/* Service Status */}
            <div className="dashboard-section">

                <div className="section-title">

                    <div>
                        <p className="dashboard-label">
                            MAINTENANCE
                        </p>

                        <h2>
                            Service Status
                        </h2>
                    </div>

                    <button
                        type="button"
                        className="section-action-button"
                        onClick={() =>
                            navigate(
                                "/service-history"
                            )
                        }
                    >
                        View History
                    </button>

                </div>

                <div className="service-status-grid">

                    {serviceStatus.map(
                        (service) => (
                            <div
                                className={`status-card ${service.className}`}
                                key={
                                    service.name
                                }
                            >
                                <div className="status-card-icon">
                                    {service.icon}
                                </div>

                                <div className="status-card-content">
                                    <h3>
                                        {
                                            service.name
                                        }
                                    </h3>

                                    <p>
                                        {
                                            service.status
                                        }
                                    </p>
                                </div>
                            </div>
                        )
                    )}

                </div>
            </div>

            {/* Service Overview */}
            <div className="dashboard-section">

                <div className="section-title">

                    <div>
                        <p className="dashboard-label">
                            SERVICE ACTIVITY
                        </p>

                        <h2>
                            Service Overview
                        </h2>
                    </div>

                    <button
                        type="button"
                        className="section-action-button"
                        onClick={() =>
                            navigate("/service")
                        }
                    >
                        Record Service
                    </button>

                </div>

                <div className="dashboard-service-overview">

                    <div>
                        <span>
                            Total Services
                        </span>

                        <strong>
                            {currentBike
                                .serviceHistory
                                ?.length || 0}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Next Service
                        </span>

                        <strong>
                            {bikeServiceData.nextServiceKm >
                            0
                                ? `${bikeServiceData.nextServiceKm.toLocaleString()} km`
                                : "Not set"}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Last Service
                        </span>

                        <strong>
                            {lastService}
                        </strong>
                    </div>

                </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-section quick-actions-section">

                <div className="section-title">

                    <div>
                        <p className="dashboard-label">
                            SHORTCUTS
                        </p>

                        <h2>
                            Quick Actions
                        </h2>
                    </div>

                </div>

                <div className="quick-actions-grid">

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/service")
                        }
                    >
                        <span>
                            🔧
                        </span>

                        <div>
                            <strong>
                                Record Service
                            </strong>

                            <small>
                                Add a new maintenance
                                record
                            </small>
                        </div>

                        <b>
                            →
                        </b>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/reminders")
                        }
                    >
                        <span>
                            🔔
                        </span>

                        <div>
                            <strong>
                                View Reminders
                            </strong>

                            <small>
                                Check upcoming
                                maintenance
                            </small>
                        </div>

                        <b>
                            →
                        </b>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/documents")
                        }
                    >
                        <span>
                            📄
                        </span>

                        <div>
                            <strong>
                                Documents
                            </strong>

                            <small>
                                Manage bike documents
                            </small>
                        </div>

                        <b>
                            →
                        </b>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/health")
                        }
                    >
                        <span>
                            ❤️
                        </span>

                        <div>
                            <strong>
                                Bike Health
                            </strong>

                            <small>
                                Check your bike health
                            </small>
                        </div>

                        <b>
                            →
                        </b>
                    </button>

                </div>
            </div>

        </div>
    );
}

export default Dashboard;

