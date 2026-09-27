import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const checkLoginStatus = () => {
    const loggedIn =
      localStorage.getItem("smartBikeCare_loggedIn") === "true";

    const savedUser =
      localStorage.getItem("smartBikeCare_user");

    setIsLoggedIn(loggedIn);

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error(
          "Unable to read user information:",
          error
        );
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, [location.pathname]);

  useEffect(() => {
    const handleAuthChange = () => {
      checkLoginStatus();
    };

    window.addEventListener(
      "storage",
      handleAuthChange
    );

    window.addEventListener(
      "smartBikeCareAuthChange",
      handleAuthChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleAuthChange
      );

      window.removeEventListener(
        "smartBikeCareAuthChange",
        handleAuthChange
      );
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(
      "smartBikeCare_loggedIn"
    );

    localStorage.removeItem(
      "smartBikeCare_token"
    );

    localStorage.removeItem(
      "smartBikeCare_user"
    );

    localStorage.removeItem(
      "smartBikeCare_selectedBike"
    );

    setIsLoggedIn(false);
    setUser(null);
    setMenuOpen(false);
    setProfileOpen(false);

    window.dispatchEvent(
      new Event("smartBikeCareAuthChange")
    );

    navigate("/");
  };

  const handleHomeSection = (sectionId) => {
    setMenuOpen(false);
    setProfileOpen(false);

    if (location.pathname === "/") {
      const section =
        document.getElementById(sectionId);

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      return;
    }

    navigate(`/#${sectionId}`);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const closeProfile = () => {
    setProfileOpen(false);
  };

  const navigateTo = (path) => {
    setProfileOpen(false);
    setMenuOpen(false);
    navigate(path);
  };

  const displayName =
    user?.name?.trim()
      ? user.name.trim().split(" ")[0]
      : "Account";

  const profileInitial =
    displayName.charAt(0).toUpperCase();

  return (
    <header className="navbar">

      <div className="navbar-container">

        {/* =========================
            LOGO
        ========================= */}

        <Link
          to="/"
          className="navbar-logo"
          onClick={() => {
            closeMenu();
            closeProfile();
          }}
        >
          <div className="navbar-logo-icon">
            🛡️
          </div>

          <div className="navbar-logo-text">
            <strong>
              SMART
            </strong>

            <span>
              BIKE CARE
            </span>
          </div>
        </Link>


        {/* =========================
            DESKTOP NAVIGATION
        ========================= */}

        <nav className="navbar-menu">

          <Link
            to="/"
            onClick={closeProfile}
          >
            Home
          </Link>

          <button
            type="button"
            onClick={() =>
              handleHomeSection("services")
            }
          >
            Services
          </button>

          <button
            type="button"
            onClick={() =>
              handleHomeSection("how-it-works")
            }
          >
            How It Works
          </button>

          <button
            type="button"
            onClick={() =>
              handleHomeSection("bike-care")
            }
          >
            Bike Care
          </button>

          <button
            type="button"
            onClick={() =>
              navigateTo("/garage")
            }
          >
            Garage Near Me
          </button>

        </nav>


        {/* =========================
            DESKTOP ACTIONS
        ========================= */}

        <div className="navbar-actions">

          {isLoggedIn ? (
            <>
              <Link
                to="/dashboard"
                className="navbar-dashboard"
                onClick={closeProfile}
              >
                Dashboard
              </Link>


              {/* PROFILE */}

              <div className="navbar-profile-wrapper">

                <button
                  type="button"
                  className="navbar-profile"
                  onClick={() =>
                    setProfileOpen(!profileOpen)
                  }
                  aria-expanded={profileOpen}
                >

                  <div className="navbar-profile-icon">
                    {profileInitial}
                  </div>

                  <span>
                    {displayName}
                  </span>

                  <span className="profile-arrow">
                    {profileOpen ? "▲" : "▼"}
                  </span>

                </button>


                {/* PROFILE DROPDOWN */}

                {profileOpen && (
                  <div className="navbar-profile-dropdown">

                    <div className="profile-dropdown-header">

                      <div className="profile-dropdown-icon">
                        {profileInitial}
                      </div>

                      <div>
                        <strong>
                          {displayName}
                        </strong>

                        <span>
                          My Account
                        </span>
                      </div>

                    </div>


                    <div className="profile-dropdown-divider" />


                    <button
                      type="button"
                      onClick={() =>
                        navigateTo("/dashboard")
                      }
                    >
                      📊 Dashboard
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigateTo("/bikes")
                      }
                    >
                      🏍️ My Bikes
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigateTo("/service-history")
                      }
                    >
                      🔧 Service History
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigateTo("/reminders")
                      }
                    >
                      🔔 Reminders
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigateTo("/health")
                      }
                    >
                      ❤️ Bike Health
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigateTo("/documents")
                      }
                    >
                      📄 Documents
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigateTo("/emergency")
                      }
                    >
                      🚨 Emergency
                    </button>


                    <div className="profile-dropdown-divider" />


                    <button
                      type="button"
                      onClick={() =>
                        navigateTo("/profile")
                      }
                    >
                      👤 Profile
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigateTo("/settings")
                      }
                    >
                      ⚙️ Settings
                    </button>


                    <div className="profile-dropdown-divider" />


                    <button
                      type="button"
                      className="dropdown-logout"
                      onClick={handleLogout}
                    >
                      🚪 Logout
                    </button>

                  </div>
                )}

              </div>

            </>
          ) : (
            <>
              <Link
                to="/login"
                className="navbar-login"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="navbar-start"
              >
                Get Started
              </Link>
            </>
          )}

        </div>


        {/* =========================
            MOBILE MENU BUTTON
        ========================= */}

        <button
          type="button"
          className="menu-button"
          onClick={() => {
            setMenuOpen(!menuOpen);
            setProfileOpen(false);
          }}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

      </div>


      {/* =========================
          MOBILE MENU
      ========================= */}

      {menuOpen && (
        <div className="mobile-menu">

          <Link
            to="/"
            onClick={closeMenu}
          >
            Home
          </Link>

          <button
            type="button"
            onClick={() =>
              handleHomeSection("services")
            }
          >
            Services
          </button>

          <button
            type="button"
            onClick={() =>
              handleHomeSection("how-it-works")
            }
          >
            How It Works
          </button>

          <button
            type="button"
            onClick={() =>
              handleHomeSection("bike-care")
            }
          >
            Bike Care
          </button>

          <button
            type="button"
            onClick={() =>
              navigateTo("/garage")
            }
          >
            Garage Near Me
          </button>


          <div className="mobile-menu-actions">

            {isLoggedIn ? (
              <>

                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                >
                  📊 Dashboard
                </Link>

                <Link
                  to="/bikes"
                  onClick={closeMenu}
                >
                  🏍️ My Bikes
                </Link>

                <Link
                  to="/service"
                  onClick={closeMenu}
                >
                  🔧 Service
                </Link>

                <Link
                  to="/service-history"
                  onClick={closeMenu}
                >
                  📋 Service History
                </Link>

                <Link
                  to="/reminders"
                  onClick={closeMenu}
                >
                  🔔 Reminders
                </Link>

                <Link
                  to="/health"
                  onClick={closeMenu}
                >
                  ❤️ Bike Health
                </Link>

                <Link
                  to="/documents"
                  onClick={closeMenu}
                >
                  📄 Documents
                </Link>

                <Link
                  to="/emergency"
                  onClick={closeMenu}
                >
                  🚨 Emergency
                </Link>

                <Link
                  to="/profile"
                  onClick={closeMenu}
                >
                  👤 Profile
                </Link>

                <Link
                  to="/settings"
                  onClick={closeMenu}
                >
                  ⚙️ Settings
                </Link>


                <div className="mobile-user">
                  Signed in as{" "}
                  <strong>
                    {displayName}
                  </strong>
                </div>

                <button
                  type="button"
                  className="mobile-logout"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>

              </>
            ) : (
              <>

                <Link
                  to="/login"
                  onClick={closeMenu}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="mobile-start"
                  onClick={closeMenu}
                >
                  Get Started
                </Link>

              </>
            )}

          </div>

        </div>
      )}

    </header>
  );
}

export default Navbar;