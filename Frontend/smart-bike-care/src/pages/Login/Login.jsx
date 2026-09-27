import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { loginUser } from "../../services/authApi";
import { setToken } from "../../utils/auth";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

    setGeneralError("");
    setSuccessMessage("");
  };

  const validateForm = () => {
    const newErrors = {};

    const email = formData.email.trim();
    const password = formData.password;

    if (!email) {
      newErrors.email = "Email is required.";
    } else if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)
    ) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setGeneralError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const loginData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      const response = await loginUser(loginData);
      const data = response.data;

      console.log("Login response:", data);

      if (!data || !data.token) {
        setGeneralError(
          data?.message || "Login failed. JWT token was not received."
        );
        return;
      }

      setToken(data.token);

      if (data.user) {
        localStorage.setItem(
          "smartBikeCare_user",
          JSON.stringify(data.user)
        );
      }

      localStorage.setItem("smartBikeCare_loggedIn", "true");

      window.dispatchEvent(
        new Event("smartBikeCareAuthChange")
      );

      setSuccessMessage("Login successful. Redirecting...");

      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 700);
    } catch (error) {
      console.error("Login error:", error);
      console.error("Login status:", error.response?.status);
      console.error("Backend response:", error.response?.data);

      const status = error.response?.status;
      const backendData = error.response?.data;

      if (status === 400) {
        setGeneralError(
          backendData?.message ||
            backendData?.error ||
            "Invalid login request. Please check your email and password."
        );
      } else if (status === 401) {
        setGeneralError(
          backendData?.message ||
            "Invalid email or password."
        );
      } else if (status === 403) {
        setGeneralError(
          backendData?.message ||
            "Access denied. Please try again."
        );
      } else if (!error.response) {
        setGeneralError(
          "Unable to connect to the server. Make sure Spring Boot is running on port 8080."
        );
      } else {
        setGeneralError(
          backendData?.message ||
            "Login failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-background-shape auth-shape-one"></div>
      <div className="auth-background-shape auth-shape-two"></div>

      <div className="auth-container">

        <Link to="/" className="auth-home-button">
          ← Back to Home
        </Link>

        <div className="auth-header">

          <div className="auth-logo">
            🏍️
          </div>

          <span className="auth-label">
            SMART BIKE CARE
          </span>

          <h1>Welcome Back</h1>

          <p>
            Sign in to manage your bike and stay on top of maintenance.
          </p>

        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
          noValidate
        >

          {generalError && (
            <div className="auth-form-message auth-form-error">
              <span>!</span>
              <p>{generalError}</p>
            </div>
          )}

          {successMessage && (
            <div className="auth-form-message auth-form-success">
              <span>✓</span>
              <p>{successMessage}</p>
            </div>
          )}

          <div className="form-group">

            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading}
              className={errors.email ? "input-error" : ""}
            />

            {errors.email && (
              <span className="field-error">
                {errors.email}
              </span>
            )}

          </div>

          <div className="form-group">

            <div className="password-label">

              <label htmlFor="password">
                Password
              </label>

              <Link to="/forgot-password">
                Forgot password?
              </Link>

            </div>

            <div className="password-input">

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                className={errors.password ? "input-error" : ""}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                disabled={loading}
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

            {errors.password && (
              <span className="field-error">
                {errors.password}
              </span>
            )}

          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>

        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <div className="auth-register-box">

          <p>
            Don't have a Smart Bike Care account?
          </p>

          <Link
            to="/register"
            className="auth-register-button"
          >
            Create New Account
          </Link>

        </div>

        <div className="auth-security-note">
          <span>🔒</span>
          <p>
            Your account information is securely protected.
          </p>
        </div>

      </div>

    </div>
  );
}

export default Login;