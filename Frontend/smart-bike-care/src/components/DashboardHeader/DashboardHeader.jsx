import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import LogoutConfirm from "../LogoutConfirm/LogoutConfirm";
import { removeToken } from "../../utils/auth";
import { getMyProfile } from "../../services/profileApi";

import "./DashboardHeader.css";

function DashboardHeader({ openSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [showProfile, setShowProfile] =
    useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] =
    useState(false);

  const [user, setUser] = useState(null);

  // ---------------------------------------------------------
  // Load latest user information from backend
  // ---------------------------------------------------------
  const loadUser = async () => {
    try {
      const response = await getMyProfile();

      const latestUser = response.data;

      if (latestUser) {
        setUser(latestUser);

        // Keep localStorage synchronized
        localStorage.setItem(
          "smartBikeCare_user",
          JSON.stringify(latestUser)
        );
      }
    } catch (error) {
      console.error(
        "Unable to load latest profile information:",
        error
      );

      // Fallback to saved local user
      const savedUser =
        localStorage.getItem(
          "smartBikeCare_user"
        );

      if (!savedUser) {
        setUser(null);
        return;
      }

      try {
        setUser(
          JSON.parse(savedUser)
        );
      } catch (parseError) {
        console.error(
          "Unable to read saved user information:",
          parseError
        );

        setUser(null);
      }
    }
  };

  // ---------------------------------------------------------
  // Load user when header starts
  // and when route changes
  // ---------------------------------------------------------
  useEffect(() => {
    loadUser();
  }, [location.pathname]);

  // ---------------------------------------------------------
  // Listen for login/logout/profile changes
  // ---------------------------------------------------------
  useEffect(() => {
    const handleAuthChange = () => {
      loadUser();
    };

    window.addEventListener(
      "smartBikeCareAuthChange",
      handleAuthChange
    );

    window.addEventListener(
      "storage",
      handleAuthChange
    );

    return () => {
      window.removeEventListener(
        "smartBikeCareAuthChange",
        handleAuthChange
      );

      window.removeEventListener(
        "storage",
        handleAuthChange
      );
    };
  }, []);

  // ---------------------------------------------------------
  // Display name
  // ---------------------------------------------------------
  const displayName =
    user?.name?.trim()
      ? user.name.trim()
      : "Account";

  // ---------------------------------------------------------
  // Avatar fallback letter
  // ---------------------------------------------------------
  const avatarLetter =
    displayName !== "Account"
      ? displayName
          .charAt(0)
          .toUpperCase()
      : "A";

  // ---------------------------------------------------------
  // Profile image
  // ---------------------------------------------------------
  const profileImage =
    user?.photoData?.trim()
      ? user.photoData.trim()
      : null;

  // ---------------------------------------------------------
  // Notification toggle
  // ---------------------------------------------------------
  const toggleNotifications = () => {
    setShowNotifications(
      (previous) => !previous
    );

    setShowProfile(false);
  };

  // ---------------------------------------------------------
  // Profile toggle
  // ---------------------------------------------------------
  const toggleProfile = () => {
    setShowProfile(
      (previous) => !previous
    );

    setShowNotifications(false);
  };

  // ---------------------------------------------------------
  // Logout
  // ---------------------------------------------------------
  const handleLogoutClick = () => {
    setShowProfile(false);
    setShowLogoutConfirm(true);
  };

  // ---------------------------------------------------------
  // Cancel logout
  // ---------------------------------------------------------
  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // ---------------------------------------------------------
  // Confirm logout
  // ---------------------------------------------------------
  const handleConfirmLogout = () => {
    removeToken();

    localStorage.removeItem(
      "smartBikeCare_loggedIn"
    );

    localStorage.removeItem(
      "smartBikeCare_user"
    );

    localStorage.removeItem(
      "smartBikeCare_selectedBike"
    );

    setUser(null);
    setShowLogoutConfirm(false);

    window.dispatchEvent(
      new Event(
        "smartBikeCareAuthChange"
      )
    );

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <>
      <header className="dashboard-header">

        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <div className="header-left">

          <button
            type="button"
            className="mobile-menu-button"
            onClick={openSidebar}
            aria-label="Open navigation menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className="header-title">
            <h2>Dashboard</h2>
          </div>

        </div>

        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <div className="header-actions">

          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <div className="notification-container">

            <button
              type="button"
              className="header-icon-button"
              onClick={toggleNotifications}
              aria-label="Notifications"
            >
              <span className="header-notification-icon">
                🔔
              </span>

              <span className="notification-badge">
                3
              </span>
            </button>

            {showNotifications && (
              <div className="notification-dropdown">

                <div className="dropdown-header">

                  <div>
                    <h3>
                      Notifications
                    </h3>

                    <p>
                      Recent maintenance alerts
                    </p>
                  </div>

                  <span className="notification-count">
                    3
                  </span>

                </div>

                <div className="notification-item">

                  <span className="notification-item-icon notification-danger">
                    🔴
                  </span>

                  <div className="notification-item-content">

                    <strong>
                      Engine Oil Service
                    </strong>

                    <p>
                      Service is due.
                    </p>

                  </div>

                </div>

                <div className="notification-item">

                  <span className="notification-item-icon notification-warning">
                    🟡
                  </span>

                  <div className="notification-item-content">

                    <strong>
                      General Service
                    </strong>

                    <p>
                      Service coming soon.
                    </p>

                  </div>

                </div>

                <div className="notification-item">

                  <span className="notification-item-icon notification-document">
                    📄
                  </span>

                  <div className="notification-item-content">

                    <strong>
                      Insurance
                    </strong>

                    <p>
                      Renewal approaching.
                    </p>

                  </div>

                </div>

                <Link
                  to="/notifications"
                  className="view-notifications"
                  onClick={() =>
                    setShowNotifications(false)
                  }
                >
                  View All Notifications
                </Link>

              </div>
            )}

          </div>

          {/* =================================================
              PROFILE
          ================================================= */}

          <div className="profile-container">

            <button
              type="button"
              className="profile-button"
              onClick={toggleProfile}
              aria-label="Open profile menu"
            >

              {/* Profile Image */}

              <div className="profile-avatar">

                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={`${displayName} profile`}
                  />
                ) : (
                  avatarLetter
                )}

              </div>

              {/* User Name */}

              <div className="profile-info">

                <strong>
                  {displayName}
                </strong>

                <span>
                  Bike Owner
                </span>

              </div>

              {/* Arrow */}

              <span
                className={`profile-arrow ${
                  showProfile
                    ? "profile-arrow-open"
                    : ""
                }`}
              >
                ⌄
              </span>

            </button>

            {/* =================================================
                PROFILE DROPDOWN
            ================================================= */}

            {showProfile && (
              <div className="profile-dropdown">

                <div className="profile-dropdown-header">

                  {/* Dropdown Profile Image */}

                  <div className="profile-dropdown-avatar">

                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={`${displayName} profile`}
                      />
                    ) : (
                      avatarLetter
                    )}

                  </div>

                  <div>

                    <strong>
                      {displayName}
                    </strong>

                    <span>
                      Bike Owner
                    </span>

                  </div>

                </div>

                <div className="profile-dropdown-divider"></div>

                <Link
                  to="/profile"
                  onClick={() =>
                    setShowProfile(false)
                  }
                >
                  <span>👤</span>
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() =>
                    setShowProfile(false)
                  }
                >
                  <span>⚙️</span>
                  <span>Settings</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogoutClick}
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>

              </div>
            )}

          </div>

        </div>

      </header>

      {/* =================================================
          LOGOUT CONFIRMATION
      ================================================= */}

      <LogoutConfirm
        isOpen={showLogoutConfirm}
        onCancel={handleCancelLogout}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}

export default DashboardHeader;