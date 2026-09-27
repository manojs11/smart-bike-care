import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ isOpen, closeSidebar }) {
  const navigate = useNavigate();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLinkClick = () => {
    closeSidebar();
  };

  const handleLogoClick = () => {
    closeSidebar();
    navigate("/");
  };

  const handleHomeClick = () => {
    closeSidebar();
    navigate("/");
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("smartBikeCare_loggedIn");

    setShowLogoutConfirm(false);
    closeSidebar();

    window.dispatchEvent(
      new Event("smartBikeCareAuthChange")
    );

    navigate("/login", { replace: true });
  };

  return (
    <>
      <aside
        className={`sidebar ${
          isOpen ? "sidebar-open" : ""
        }`}
      >
        <button
          type="button"
          className="sidebar-logo"
          onClick={handleLogoClick}
          aria-label="Go to Smart Bike Care home page"
        >
          <span className="sidebar-logo-icon">
            🏍️
          </span>

          <span className="sidebar-logo-content">
            <strong>Smart Bike Care</strong>
          </span>
        </button>

        <nav className="sidebar-navigation">
          <div className="sidebar-group">
            <p className="sidebar-section-title">
              MAIN
            </p>

            <button
              type="button"
              className="sidebar-link home-button"
              onClick={handleHomeClick}
            >
              <span className="sidebar-link-icon">
                ⌂
              </span>

              <span>Home</span>
            </button>

            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
              onClick={handleLinkClick}
            >
              <span className="sidebar-link-icon">
                ▦
              </span>

              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/bikes"
              className={({ isActive }) =>
                isActive
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
              onClick={handleLinkClick}
            >
              <span className="sidebar-link-icon">
                🏍️
              </span>

              <span>My Bikes</span>
            </NavLink>

            <NavLink
              to="/service"
              className={({ isActive }) =>
                isActive
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
              onClick={handleLinkClick}
            >
              <span className="sidebar-link-icon">
                🔧
              </span>

              <span>Service</span>
            </NavLink>

            <NavLink
              to="/reminders"
              className={({ isActive }) =>
                isActive
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
              onClick={handleLinkClick}
            >
              <span className="sidebar-link-icon">
                🔔
              </span>

              <span>Reminders</span>
            </NavLink>

            <NavLink
              to="/service-history"
              className={({ isActive }) =>
                isActive
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
              onClick={handleLinkClick}
            >
              <span className="sidebar-link-icon">
                🕘
              </span>

              <span>Service History</span>
            </NavLink>
          </div>

          <div className="sidebar-group">
            <p className="sidebar-section-title">
              BIKE CARE
            </p>

            <NavLink
              to="/health"
              className={({ isActive }) =>
                isActive
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
              onClick={handleLinkClick}
            >
              <span className="sidebar-link-icon">
                ❤️
              </span>

              <span>Bike Health</span>
            </NavLink>

            <NavLink
              to="/documents"
              className={({ isActive }) =>
                isActive
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
              onClick={handleLinkClick}
            >
              <span className="sidebar-link-icon">
                📄
              </span>

              <span>Documents</span>
            </NavLink>

            <NavLink
              to="/garage"
              className={({ isActive }) =>
                isActive
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
              onClick={handleLinkClick}
            >
              <span className="sidebar-link-icon">
                📍
              </span>

              <span>Garage</span>
            </NavLink>

            <NavLink
              to="/emergency"
              className={({ isActive }) =>
                isActive
                  ? "sidebar-link active emergency-link"
                  : "sidebar-link emergency-link"
              }
              onClick={handleLinkClick}
            >
              <span className="sidebar-link-icon">
                🚨
              </span>

              <span>Emergency</span>
            </NavLink>
          </div>

          <div className="sidebar-group">
            <p className="sidebar-section-title">
              ACCOUNT
            </p>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                isActive
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
              onClick={handleLinkClick}
            >
              <span className="sidebar-link-icon">
                👤
              </span>

              <span>Profile</span>
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                isActive
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
              onClick={handleLinkClick}
            >
              <span className="sidebar-link-icon">
                ⚙️
              </span>

              <span>Settings</span>
            </NavLink>
          </div>
        </nav>

        <div className="sidebar-bottom">
          <button
            type="button"
            className="sidebar-link logout-button"
            onClick={handleLogoutClick}
          >
            <span className="sidebar-link-icon">
              ↪
            </span>

            <span>Logout</span>
          </button>
        </div>
      </aside>

      {showLogoutConfirm && (
        <div className="logout-modal-overlay">
          <div
            className="logout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
          >
            <div className="logout-modal-icon">
              ↪
            </div>

            <h2 id="logout-modal-title">
              Logout?
            </h2>

            <p>
              Are you sure you want to logout from
              Smart Bike Care?
            </p>

            <div className="logout-modal-actions">
              <button
                type="button"
                className="logout-cancel-button"
                onClick={handleCancelLogout}
              >
                Cancel
              </button>

              <button
                type="button"
                className="logout-confirm-button"
                onClick={handleConfirmLogout}
              >
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;