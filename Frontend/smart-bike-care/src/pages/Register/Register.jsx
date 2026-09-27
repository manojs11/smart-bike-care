import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";
import { registerUser } from "../../services/authApi";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!name) {
      setError("Please enter your full name.");
      return false;
    }

    if (name.length < 3) {
      setError("Full name must contain at least 3 characters.");
      return false;
    }

    if (!/^[A-Za-z ]+$/.test(name)) {
      setError("Full name can contain only letters and spaces.");
      return false;
    }

    if (!email) {
      setError("Please enter your email address.");
      return false;
    }

    if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)
    ) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (!phone) {
      setError("Please enter your phone number.");
      return false;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      setError("Phone number must contain exactly 10 digits.");
      return false;
    }

    if (!password) {
      setError("Please create a password.");
      return false;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return false;
    }

    if (!/[A-Z]/.test(password)) {
      setError(
        "Password must contain at least one uppercase letter."
      );
      return false;
    }

    if (!/[a-z]/.test(password)) {
      setError(
        "Password must contain at least one lowercase letter."
      );
      return false;
    }

    if (!/[0-9]/.test(password)) {
      setError(
        "Password must contain at least one number."
      );
      return false;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      setError(
        "Password must contain at least one special character."
      );
      return false;
    }

    if (!confirmPassword) {
      setError("Please confirm your password.");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const registerData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
      };

      console.log("Register request:", {
        name: registerData.name,
        email: registerData.email,
        phone: registerData.phone,
        password: "********",
      });

      const response = await registerUser(registerData);

      console.log("Register response:", response.data);

      setSuccess(
        "Account created successfully. Redirecting to login..."
      );

      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1200);
    } catch (error) {
      console.error("Registration error:", error);

      console.error(
        "Registration status:",
        error.response?.status
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      const status = error.response?.status;
      const backendData = error.response?.data;

      if (status === 400) {
        setError(
          backendData?.message ||
            backendData?.error ||
            "Invalid registration data."
        );
      } else if (status === 409) {
        setError(
          backendData?.message ||
            "An account with this email already exists."
        );
      } else if (!error.response) {
        setError(
          "Unable to connect to the server. Make sure Spring Boot is running on port 8080."
        );
      } else {
        setError(
          backendData?.message ||
            "Registration failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      <div className="register-background-shape register-shape-one"></div>

      <div className="register-background-shape register-shape-two"></div>

      <div className="register-container">

        <Link
          to="/"
          className="register-home-button"
        >
          ← Back to Home
        </Link>

        <div className="register-header">

          <div className="register-logo">
            🛡️
          </div>

          <span className="register-label">
            SMART BIKE CARE
          </span>

          <h1>
            Create Account
          </h1>

          <p>
            Create your account to manage your bike and maintenance.
          </p>

        </div>

        <form
          className="register-form"
          onSubmit={handleSubmit}
          noValidate
        >

          {error && (
            <div className="register-message register-error">
              <span>!</span>

              <p>
                {error}
              </p>
            </div>
          )}

          {success && (
            <div className="register-message register-success">
              <span>✓</span>

              <p>
                {success}
              </p>
            </div>
          )}

          <div className="register-form-group">

            <label htmlFor="name">
              Full Name
            </label>

            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              disabled={loading}
            />

          </div>

          <div className="register-form-group">

            <label htmlFor="email">
              Email Address
            </label>

            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              disabled={loading}
            />

          </div>

          <div className="register-form-group">

            <label htmlFor="phone">
              Phone Number
            </label>

            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
              maxLength={10}
              inputMode="numeric"
              disabled={loading}
            />

          </div>

          <div className="register-form-group">

            <label htmlFor="password">
              Password
            </label>

            <div className="register-password-input">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                id="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
              />

              <button
                type="button"
                className="register-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
                disabled={loading}
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

          </div>

          <div className="register-form-group">

            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <div className="register-password-input">

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
              />

              <button
                type="button"
                className="register-password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    (previous) => !previous
                  )
                }
                disabled={loading}
              >
                {showConfirmPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

          </div>

          <button
            type="submit"
            className="register-submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        <div className="register-divider">
          <span>OR</span>
        </div>

        <div className="register-footer">

          <p>
            Already have an account?
          </p>

          <Link
            to="/login"
            className="register-login-button"
          >
            Login
          </Link>

        </div>

        <div className="register-security-note">

          <span>🔒</span>

          <p>
            Your account information is securely protected.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;