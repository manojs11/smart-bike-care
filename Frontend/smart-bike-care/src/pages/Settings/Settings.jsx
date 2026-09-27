import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

import {
    getSettings,
    updateSettings,
} from "../../services/settingsApi";

import {
    getMyProfile,
    changePassword,
} from "../../services/profileApi";

const DEFAULT_SETTINGS = {
    serviceNotifications: true,
    serviceDueAlerts: true,
    documentExpiryAlerts: true,
    reminderNotifications: true,
    emergencyAlerts: true,
    serviceReminders: true,
    reminderFrequency: "7",
    serviceDueThreshold: "500",
    documentReminders: true,
};

const mapSettings = (data) => ({
    serviceNotifications: data?.serviceNotifications ?? true,
    serviceDueAlerts: data?.serviceDueAlerts ?? true,
    documentExpiryAlerts: data?.documentExpiryAlerts ?? true,
    reminderNotifications: data?.reminderNotifications ?? true,
    emergencyAlerts: data?.emergencyAlerts ?? true,
    serviceReminders: data?.serviceReminders ?? true,
    reminderFrequency: data?.reminderFrequency ?? "7",
    serviceDueThreshold: data?.serviceDueThreshold ?? "500",
    documentReminders: data?.documentReminders ?? true,
});

function Settings() {
    const navigate = useNavigate();

    const [activeMenu, setActiveMenu] = useState("notifications");

    const [settings, setSettings] = useState(DEFAULT_SETTINGS);

    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        photoData: "",
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            setError("");

            const [settingsResponse, profileResponse] =
                await Promise.all([
                    getSettings(),
                    getMyProfile(),
                ]);

            if (settingsResponse?.data) {
                setSettings(mapSettings(settingsResponse.data));
            }

            if (profileResponse?.data) {
                setProfile({
                    name: profileResponse.data.name || "",
                    email: profileResponse.data.email || "",
                    phone: profileResponse.data.phone || "",
                    photoData: profileResponse.data.photoData || "",
                });
            }
        } catch (err) {
            console.error("Failed to load settings:", err);

            setError(
                err?.response?.data?.message ||
                    "Failed to load settings. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (field) => {
        setSettings((previous) => ({
            ...previous,
            [field]: !previous[field],
        }));
    };

    const handleSelectChange = (field, value) => {
        setSettings((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleSaveSettings = async () => {
        try {
            setSaving(true);
            setMessage("");
            setError("");

            const payload = {
                serviceNotifications: settings.serviceNotifications,
                serviceDueAlerts: settings.serviceDueAlerts,
                documentExpiryAlerts: settings.documentExpiryAlerts,
                reminderNotifications: settings.reminderNotifications,
                emergencyAlerts: settings.emergencyAlerts,
                serviceReminders: settings.serviceReminders,
                reminderFrequency: settings.reminderFrequency,
                serviceDueThreshold: settings.serviceDueThreshold,
                documentReminders: settings.documentReminders,
            };

            const response = await updateSettings(payload);

            if (response?.data) {
                setSettings(mapSettings(response.data));
            }

            setMessage("Settings saved successfully.");

            setTimeout(() => {
                setMessage("");
            }, 3000);
        } catch (err) {
            console.error("Failed to save settings:", err);

            setError(
                err?.response?.data?.message ||
                    "Failed to save settings. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (event) => {
        event.preventDefault();

        setPasswordMessage("");
        setPasswordError("");

        if (!passwordData.currentPassword.trim()) {
            setPasswordError("Please enter your current password.");
            return;
        }

        if (!passwordData.newPassword.trim()) {
            setPasswordError("Please enter a new password.");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError(
                "New password must be at least 6 characters."
            );
            return;
        }

        if (
            passwordData.newPassword !==
            passwordData.confirmPassword
        ) {
            setPasswordError("New passwords do not match.");
            return;
        }

        try {
            setPasswordSaving(true);

            const payload = {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            };

            const response = await changePassword(payload);

            setPasswordMessage(
                response?.data?.message ||
                    "Password changed successfully."
            );

            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            setTimeout(() => {
                setPasswordMessage("");
            }, 4000);
        } catch (err) {
            console.error("Failed to change password:", err);

            setPasswordError(
                err?.response?.data?.message ||
                    "Failed to change password. Please check your current password."
            );
        } finally {
            setPasswordSaving(false);
        }
    };

    const handleResetSettings = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to reset all settings to default?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setSaving(true);
            setMessage("");
            setError("");

            const response = await updateSettings(DEFAULT_SETTINGS);

            if (response?.data) {
                setSettings(mapSettings(response.data));
            } else {
                setSettings(DEFAULT_SETTINGS);
            }

            setMessage("Settings reset to default successfully.");

            setTimeout(() => {
                setMessage("");
            }, 3000);
        } catch (err) {
            console.error("Failed to reset settings:", err);

            setError(
                err?.response?.data?.message ||
                    "Failed to reset settings."
            );
        } finally {
            setSaving(false);
        }
    };

    const getInitial = () => {
        if (!profile.name) {
            return "U";
        }

        return profile.name.charAt(0).toUpperCase();
    };

    if (loading) {
        return (
            <div className="settings-page">
                <div className="settings-content">
                    <div className="settings-card">
                        <div className="settings-card-header">
                            <h2>Loading Settings</h2>
                            <p>
                                Loading your Smart Bike Care settings...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="settings-page">

            {/* Header */}
            <div className="settings-header">

                <span className="settings-label">
                    SMART BIKE CARE
                </span>

                <h1>Settings</h1>

                <p>
                    Manage your account, notifications and maintenance
                    preferences.
                </p>
            </div>

            {/* Save Message */}
            {message && (
                <div className="settings-save-message">
                    <span>✓</span>
                    <span>{message}</span>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="settings-form-error">
                    {error}
                </div>
            )}

            <div className="settings-layout">

                {/* Left Menu */}
                <aside className="settings-menu">

                    <button
                        type="button"
                        className={`settings-menu-item ${
                            activeMenu === "account"
                                ? "settings-menu-item-active"
                                : ""
                        }`}
                        onClick={() => setActiveMenu("account")}
                    >
                        <span className="settings-menu-icon">
                            👤
                        </span>

                        <span>
                            <strong>Account</strong>
                            <small>
                                Profile information
                            </small>
                        </span>
                    </button>

                    <button
                        type="button"
                        className={`settings-menu-item ${
                            activeMenu === "notifications"
                                ? "settings-menu-item-active"
                                : ""
                        }`}
                        onClick={() =>
                            setActiveMenu("notifications")
                        }
                    >
                        <span className="settings-menu-icon">
                            🔔
                        </span>

                        <span>
                            <strong>Notifications</strong>
                            <small>
                                Alert preferences
                            </small>
                        </span>
                    </button>

                    <button
                        type="button"
                        className={`settings-menu-item ${
                            activeMenu === "maintenance"
                                ? "settings-menu-item-active"
                                : ""
                        }`}
                        onClick={() =>
                            setActiveMenu("maintenance")
                        }
                    >
                        <span className="settings-menu-icon">
                            🔧
                        </span>

                        <span>
                            <strong>Maintenance</strong>
                            <small>
                                Reminder settings
                            </small>
                        </span>
                    </button>

                    <button
                        type="button"
                        className={`settings-menu-item ${
                            activeMenu === "security"
                                ? "settings-menu-item-active"
                                : ""
                        }`}
                        onClick={() =>
                            setActiveMenu("security")
                        }
                    >
                        <span className="settings-menu-icon">
                            🔒
                        </span>

                        <span>
                            <strong>Security</strong>
                            <small>
                                Password settings
                            </small>
                        </span>
                    </button>

                </aside>

                {/* Content */}
                <main className="settings-content">

                    {/* Account */}
                    {activeMenu === "account" && (
                        <div className="settings-card">

                            <div className="settings-card-header">
                                <h2>Account</h2>
                                <p>
                                    Your Smart Bike Care account
                                    information.
                                </p>
                            </div>

                            <div className="settings-account-profile">

                                <div className="settings-account-avatar">
                                    {profile.photoData ? (
                                        <img
                                            src={profile.photoData}
                                            alt={profile.name}
                                            style={{
                                                width: "48px",
                                                height: "48px",
                                                borderRadius: "50%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    ) : (
                                        getInitial()
                                    )}
                                </div>

                                <div className="settings-account-info">
                                    <strong>
                                        {profile.name ||
                                            "Not Added"}
                                    </strong>

                                    <span>
                                        {profile.email ||
                                            "Email not added"}
                                    </span>

                                    <span>
                                        {profile.phone ||
                                            "Phone not added"}
                                    </span>
                                </div>

                                <span className="settings-status-active">
                                    Active
                                </span>

                                <button
                                    type="button"
                                    className="settings-secondary-btn"
                                    onClick={() =>
                                        navigate("/profile")
                                    }
                                >
                                    Edit Profile
                                </button>
                            </div>

                            <div className="settings-option">
                                <div>
                                    <strong>
                                        Account Type
                                    </strong>

                                    <p>
                                        Your Smart Bike Care account
                                        role.
                                    </p>
                                </div>

                                <span className="settings-option-value">
                                    Bike Owner
                                </span>
                            </div>

                            <div className="settings-option">
                                <div>
                                    <strong>
                                        Account Status
                                    </strong>

                                    <p>
                                        Current account status.
                                    </p>
                                </div>

                                <span className="settings-status-active">
                                    Active
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Notifications */}
                    {activeMenu === "notifications" && (
                        <div className="settings-card">

                            <div className="settings-card-header">
                                <h2>Notifications</h2>
                                <p>
                                    Control which notifications and
                                    alerts you receive.
                                </p>
                            </div>

                            <div className="settings-option">
                                <div>
                                    <strong>
                                        Service Notifications
                                    </strong>

                                    <p>
                                        Receive notifications about
                                        bike service updates.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className={`settings-toggle ${
                                        settings.serviceNotifications
                                            ? "settings-toggle-active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleToggle(
                                            "serviceNotifications"
                                        )
                                    }
                                >
                                    <span className="settings-toggle-circle" />
                                </button>
                            </div>

                            <div className="settings-option">
                                <div>
                                    <strong>
                                        Service Due Alerts
                                    </strong>

                                    <p>
                                        Get notified when your bike
                                        service is due.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className={`settings-toggle ${
                                        settings.serviceDueAlerts
                                            ? "settings-toggle-active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleToggle(
                                            "serviceDueAlerts"
                                        )
                                    }
                                >
                                    <span className="settings-toggle-circle" />
                                </button>
                            </div>

                            <div className="settings-option">
                                <div>
                                    <strong>
                                        Document Expiry Alerts
                                    </strong>

                                    <p>
                                        Get alerts before your bike
                                        documents expire.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className={`settings-toggle ${
                                        settings.documentExpiryAlerts
                                            ? "settings-toggle-active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleToggle(
                                            "documentExpiryAlerts"
                                        )
                                    }
                                >
                                    <span className="settings-toggle-circle" />
                                </button>
                            </div>

                            <div className="settings-option">
                                <div>
                                    <strong>
                                        Reminder Notifications
                                    </strong>

                                    <p>
                                        Receive maintenance reminder
                                        notifications.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className={`settings-toggle ${
                                        settings.reminderNotifications
                                            ? "settings-toggle-active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleToggle(
                                            "reminderNotifications"
                                        )
                                    }
                                >
                                    <span className="settings-toggle-circle" />
                                </button>
                            </div>

                            <div className="settings-option">
                                <div>
                                    <strong>
                                        Emergency Alerts
                                    </strong>

                                    <p>
                                        Allow emergency-related alerts
                                        and notifications.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className={`settings-toggle ${
                                        settings.emergencyAlerts
                                            ? "settings-toggle-active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleToggle(
                                            "emergencyAlerts"
                                        )
                                    }
                                >
                                    <span className="settings-toggle-circle" />
                                </button>
                            </div>

                        </div>
                    )}

                    {/* Maintenance */}
                    {activeMenu === "maintenance" && (
                        <>
                            <div className="settings-card">

                                <div className="settings-card-header">
                                    <h2>Maintenance</h2>
                                    <p>
                                        Configure your bike maintenance
                                        reminder preferences.
                                    </p>
                                </div>

                                <div className="settings-option">
                                    <div>
                                        <strong>
                                            Service Reminders
                                        </strong>

                                        <p>
                                            Enable automatic maintenance
                                            service reminders.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className={`settings-toggle ${
                                            settings.serviceReminders
                                                ? "settings-toggle-active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleToggle(
                                                "serviceReminders"
                                            )
                                        }
                                    >
                                        <span className="settings-toggle-circle" />
                                    </button>
                                </div>

                                <div className="settings-option">
                                    <div>
                                        <strong>
                                            Document Reminders
                                        </strong>

                                        <p>
                                            Enable reminders for
                                            expiring bike documents.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className={`settings-toggle ${
                                            settings.documentReminders
                                                ? "settings-toggle-active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleToggle(
                                                "documentReminders"
                                            )
                                        }
                                    >
                                        <span className="settings-toggle-circle" />
                                    </button>
                                </div>

                            </div>

                            <div className="settings-card">

                                <div className="settings-card-header">
                                    <h2>Reminder Preferences</h2>
                                    <p>
                                        Choose when maintenance reminders
                                        should be displayed.
                                    </p>
                                </div>

                                <div className="settings-form-row">

                                    <div className="settings-form-group">
                                        <label>
                                            Reminder Frequency
                                        </label>

                                        <select
                                            value={
                                                settings.reminderFrequency
                                            }
                                            onChange={(event) =>
                                                handleSelectChange(
                                                    "reminderFrequency",
                                                    event.target.value
                                                )
                                            }
                                        >
                                            <option value="1">
                                                Every 1 day
                                            </option>

                                            <option value="3">
                                                Every 3 days
                                            </option>

                                            <option value="7">
                                                Every 7 days
                                            </option>

                                            <option value="14">
                                                Every 14 days
                                            </option>

                                            <option value="30">
                                                Every 30 days
                                            </option>
                                        </select>

                                        <small>
                                            How often maintenance
                                            reminders are checked.
                                        </small>
                                    </div>

                                    <div className="settings-form-group">
                                        <label>
                                            Service Due Threshold
                                        </label>

                                        <select
                                            value={
                                                settings.serviceDueThreshold
                                            }
                                            onChange={(event) =>
                                                handleSelectChange(
                                                    "serviceDueThreshold",
                                                    event.target.value
                                                )
                                            }
                                        >
                                            <option value="100">
                                                100 km
                                            </option>

                                            <option value="250">
                                                250 km
                                            </option>

                                            <option value="500">
                                                500 km
                                            </option>

                                            <option value="1000">
                                                1000 km
                                            </option>

                                            <option value="1500">
                                                1500 km
                                            </option>
                                        </select>

                                        <small>
                                            Distance before the service
                                            due alert is shown.
                                        </small>
                                    </div>

                                </div>

                            </div>
                        </>
                    )}

                    {/* Security */}
                    {activeMenu === "security" && (
                        <div className="settings-card">

                            <div className="settings-card-header">
                                <h2>Change Password</h2>

                                <p>
                                    Update your Smart Bike Care account
                                    password.
                                </p>
                            </div>

                            <form
                                className="settings-password-form"
                                onSubmit={handlePasswordChange}
                            >

                                <div className="settings-password-field">
                                    <label htmlFor="currentPassword">
                                        Current Password
                                    </label>

                                    <input
                                        id="currentPassword"
                                        type="password"
                                        value={
                                            passwordData.currentPassword
                                        }
                                        onChange={(event) =>
                                            setPasswordData(
                                                (previous) => ({
                                                    ...previous,
                                                    currentPassword:
                                                        event.target
                                                            .value,
                                                })
                                            )
                                        }
                                        placeholder="Enter current password"
                                    />
                                </div>

                                <div className="settings-password-field">
                                    <label htmlFor="newPassword">
                                        New Password
                                    </label>

                                    <input
                                        id="newPassword"
                                        type="password"
                                        value={
                                            passwordData.newPassword
                                        }
                                        onChange={(event) =>
                                            setPasswordData(
                                                (previous) => ({
                                                    ...previous,
                                                    newPassword:
                                                        event.target
                                                            .value,
                                                })
                                            )
                                        }
                                        placeholder="Enter new password"
                                    />
                                </div>

                                <div className="settings-password-field">
                                    <label htmlFor="confirmPassword">
                                        Confirm New Password
                                    </label>

                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={
                                            passwordData.confirmPassword
                                        }
                                        onChange={(event) =>
                                            setPasswordData(
                                                (previous) => ({
                                                    ...previous,
                                                    confirmPassword:
                                                        event.target
                                                            .value,
                                                })
                                            )
                                        }
                                        placeholder="Confirm new password"
                                    />
                                </div>

                                {passwordError && (
                                    <div className="settings-form-error">
                                        {passwordError}
                                    </div>
                                )}

                                {passwordMessage && (
                                    <div className="settings-form-success">
                                        {passwordMessage}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="settings-primary-btn"
                                    disabled={passwordSaving}
                                >
                                    {passwordSaving
                                        ? "Changing Password..."
                                        : "Change Password"}
                                </button>

                            </form>
                        </div>
                    )}

                </main>
            </div>

            {/* Bottom Actions */}
            <div className="settings-actions">

                <button
                    type="button"
                    className="settings-reset-btn"
                    onClick={handleResetSettings}
                    disabled={saving}
                >
                    {saving
                        ? "Resetting..."
                        : "Reset to Default"}
                </button>

                <button
                    type="button"
                    className="settings-primary-btn settings-save-btn"
                    onClick={handleSaveSettings}
                    disabled={saving}
                >
                    {saving
                        ? "Saving..."
                        : "Save Settings"}
                </button>

            </div>

        </div>
    );
}

export default Settings;

