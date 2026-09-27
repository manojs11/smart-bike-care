import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBikes } from "../../context/BikeContext";
import "./AddBike.css";

const bikeData = {
  Honda: [
    "Activa 5G",
    "Activa 6G",
    "Activa 125",
    "Shine",
    "Shine 100",
    "SP 125",
    "SP 160",
    "Unicorn",
    "Hornet 2.0",
    "CB200X",
    "CB300F",
    "CB300R",
    "H'ness CB350",
    "CB350",
    "CB350RS",
    "CBR650R",
    "Africa Twin",
  ],
  Yamaha: [
    "FZ-FI",
    "FZ-S FI",
    "FZ-X",
    "MT-15",
    "R15 V4",
    "R15S",
    "R3",
    "R7",
    "Fascino 125",
    "RayZR 125",
    "Aerox 155",
  ],
  TVS: [
    "Apache RTR 160",
    "Apache RTR 160 4V",
    "Apache RTR 180",
    "Apache RTR 200 4V",
    "Apache RR 310",
    "Raider",
    "Ronin",
    "Ntorq 125",
    "Jupiter",
    "Jupiter 125",
    "Sport",
    "Radeon",
    "XL100",
  ],
  Bajaj: [
    "Pulsar 125",
    "Pulsar 150",
    "Pulsar NS160",
    "Pulsar NS200",
    "Pulsar N160",
    "Pulsar N250",
    "Pulsar RS200",
    "Dominar 250",
    "Dominar 400",
    "Platina 100",
    "Platina 110",
    "CT 110",
    "Avenger 160",
    "Avenger 220",
  ],
  RoyalEnfield: [
    "Classic 350",
    "Bullet 350",
    "Hunter 350",
    "Meteor 350",
    "Himalayan",
    "Himalayan 450",
    "Scram 411",
    "Interceptor 650",
    "Continental GT 650",
    "Super Meteor 650",
    "Shotgun 650",
  ],
  Suzuki: [
    "Access 125",
    "Burgman Street",
    "Avenis",
    "Gixxer",
    "Gixxer SF",
    "V-Strom SX",
    "Hayabusa",
  ],
  Hero: [
    "Splendor Plus",
    "Splendor Plus XTEC",
    "HF Deluxe",
    "Passion XTEC",
    "Glamour",
    "Glamour Xtec",
    "Xtreme 125R",
    "Xtreme 160R",
    "Xpulse 200",
    "Xpulse 200 4V",
    "Xpulse 210",
  ],
};

const currentYear = new Date().getFullYear();

function AddBike() {
  const navigate = useNavigate();
  const { bikes, addBike } = useBikes();

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    registrationNumber: "",
    year: "",
    purchaseDate: "",
    odometer: "",
    image: "",
  });

  const [bikeImage, setBikeImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const normalizeRegistrationNumber = (value) => {
    return value.trim().replace(/\s+/g, " ").toUpperCase();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      submit: "",
    }));

    setSuccess("");
  };

  const handleBrandChange = (event) => {
    const brand = event.target.value;

    setFormData((previous) => ({
      ...previous,
      brand,
      model: "",
    }));

    setErrors((previous) => ({
      ...previous,
      brand: "",
      model: "",
      submit: "",
    }));

    setSuccess("");
  };

  const validateForm = () => {
    const newErrors = {};

    const brand = formData.brand.trim();
    const model = formData.model.trim();

    const registrationNumber = normalizeRegistrationNumber(
      formData.registrationNumber
    );

    if (!brand) {
      newErrors.brand = "Please select a bike brand.";
    }

    if (!model) {
      newErrors.model = "Please select a bike model.";
    } else if (
      brand &&
      bikeData[brand] &&
      !bikeData[brand].includes(model)
    ) {
      newErrors.model = "Please select a valid bike model.";
    }

    if (!registrationNumber) {
      newErrors.registrationNumber =
        "Please enter the registration number.";
    } else {
      const registrationRegex =
        /^[A-Z]{2}\s?[0-9]{1,2}\s?[A-Z]{1,3}\s?[0-9]{1,4}$/;

      if (!registrationRegex.test(registrationNumber)) {
        newErrors.registrationNumber =
          "Enter a valid registration number, for example TN 57 AB 1234.";
      } else {
        const duplicateBike = bikes.some(
          (bike) =>
            normalizeRegistrationNumber(
              bike.registrationNumber || ""
            ) === registrationNumber
        );

        if (duplicateBike) {
          newErrors.registrationNumber =
            "This registration number is already registered.";
        }
      }
    }

    if (!formData.year) {
      newErrors.year =
        "Please enter the manufacturing year.";
    } else {
      const year = Number(formData.year);

      if (!Number.isInteger(year)) {
        newErrors.year = "Year must be a valid number.";
      } else if (year < 1900 || year > currentYear) {
        newErrors.year =
          `Year must be between 1900 and ${currentYear}.`;
      }
    }

    if (!formData.purchaseDate) {
      newErrors.purchaseDate =
        "Please select the purchase date.";
    } else {
      const selectedDate = new Date(formData.purchaseDate);
      const today = new Date();

      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        newErrors.purchaseDate =
          "Purchase date cannot be in the future.";
      }
    }

    if (formData.odometer === "") {
      newErrors.odometer =
        "Please enter the current odometer reading.";
    } else {
      const odometer = Number(formData.odometer);

      if (!Number.isFinite(odometer)) {
        newErrors.odometer =
          "Odometer must be a valid number.";
      } else if (odometer < 0) {
        newErrors.odometer =
          "Odometer cannot be less than 0.";
      } else if (odometer > 1000000) {
        newErrors.odometer =
          "Odometer cannot exceed 1,000,000 KM.";
      }
    }

    if (bikeImage) {
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
      ];

      if (!allowedTypes.includes(bikeImage.type)) {
        newErrors.image =
          "Only PNG, JPG and JPEG images are allowed.";
      } else if (bikeImage.size > 5 * 1024 * 1024) {
        newErrors.image =
          "Image size must be less than 5 MB.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setBikeImage(null);

      setFormData((previous) => ({
        ...previous,
        image: "",
      }));

      setErrors((previous) => ({
        ...previous,
        image: "",
      }));

      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];

    if (!allowedTypes.includes(file.type)) {
      setBikeImage(null);

      setFormData((previous) => ({
        ...previous,
        image: "",
      }));

      setErrors((previous) => ({
        ...previous,
        image: "Only PNG, JPG and JPEG images are allowed.",
      }));

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setBikeImage(null);

      setFormData((previous) => ({
        ...previous,
        image: "",
      }));

      setErrors((previous) => ({
        ...previous,
        image: "Image size must be less than 5 MB.",
      }));

      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setBikeImage(file);

      setFormData((previous) => ({
        ...previous,
        image: reader.result,
      }));

      setErrors((previous) => ({
        ...previous,
        image: "",
      }));

      setSuccess("");
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSuccess("");

    setErrors((previous) => ({
      ...previous,
      submit: "",
    }));

    const registrationNumber = normalizeRegistrationNumber(
      formData.registrationNumber
    );

    try {
      const bikeRequest = {
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        registrationNumber,
        year: Number(formData.year),
        purchaseDate: formData.purchaseDate,
        odometer: Number(formData.odometer),
        imageData: formData.image || null,
      };

      console.log("Create Bike Request:", bikeRequest);

      await addBike(bikeRequest);

      setSuccess("Bike added successfully.");

      setTimeout(() => {
        navigate("/bikes");
      }, 1000);
    } catch (error) {
      console.error("Add bike error:", error);

      let message =
        error.response?.data?.message ||
        error.response?.data?.error;

      if (!message && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;

        if (typeof validationErrors === "object") {
          message = Object.values(validationErrors).join(" ");
        }
      }

      if (!message) {
        if (error.response?.status === 401) {
          message =
            "Your session has expired. Please login again.";
        } else if (error.response?.status === 403) {
          message =
            "You are not authorized to add a bike.";
        } else if (error.response?.status === 400) {
          message =
            "Invalid bike details. Please check all the entered information.";
        } else if (error.response?.status === 409) {
          message =
            "This registration number is already registered.";
        } else {
          message =
            "Unable to add bike. Please try again.";
        }
      }

      setErrors((previous) => ({
        ...previous,
        submit: message,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-bike-page">

      <div className="add-bike-header">

        <Link to="/bikes" className="back-link">
          ← Back to My Bikes
        </Link>

        <span className="page-label">
          BIKE MANAGEMENT
        </span>

        <h1>Add New Bike</h1>

        <p>
          Add your bike details to start managing its
          maintenance and service history.
        </p>

      </div>

      <div className="add-bike-layout">

        <form
          className="add-bike-form"
          onSubmit={handleSubmit}
        >

          {success && (
            <div
              style={{
                margin: "20px 26px 0",
                padding: "12px 15px",
                border: "1px solid #bbf7d0",
                borderRadius: "9px",
                background: "#f0fdf4",
                color: "#15803d",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              ✓ {success}
            </div>
          )}

          {errors.submit && (
            <div
              style={{
                margin: "20px 26px 0",
                padding: "12px 15px",
                border: "1px solid #fecaca",
                borderRadius: "9px",
                background: "#fef2f2",
                color: "#dc2626",
                fontSize: "13px",
              }}
            >
              {errors.submit}
            </div>
          )}

          <div className="form-section">

            <div className="form-section-heading">

              <div className="section-number">
                01
              </div>

              <div>
                <h2>Bike Information</h2>

                <p>
                  Enter your bike's basic information.
                </p>
              </div>

            </div>

            <div className="form-row">

              <div className="form-group">

                <label htmlFor="brand">
                  Brand <span>*</span>
                </label>

                <select
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleBrandChange}
                  className={
                    errors.brand ? "input-error" : ""
                  }
                >
                  <option value="">
                    Select Brand
                  </option>

                  {Object.keys(bikeData).map((brand) => (
                    <option
                      key={brand}
                      value={brand}
                    >
                      {brand === "RoyalEnfield"
                        ? "Royal Enfield"
                        : brand}
                    </option>
                  ))}
                </select>

                {errors.brand && (
                  <span className="error-message">
                    {errors.brand}
                  </span>
                )}

              </div>

              <div className="form-group">

                <label htmlFor="model">
                  Model <span>*</span>
                </label>

                <select
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  disabled={!formData.brand}
                  className={
                    errors.model ? "input-error" : ""
                  }
                >
                  <option value="">
                    {formData.brand
                      ? "Select Model"
                      : "Select Brand First"}
                  </option>

                  {formData.brand &&
                    bikeData[formData.brand]?.map(
                      (model) => (
                        <option
                          key={model}
                          value={model}
                        >
                          {model}
                        </option>
                      )
                    )}
                </select>

                {errors.model && (
                  <span className="error-message">
                    {errors.model}
                  </span>
                )}

              </div>

            </div>

            <div className="form-row">

              <div className="form-group">

                <label htmlFor="registrationNumber">
                  Registration Number <span>*</span>
                </label>

                <input
                  type="text"
                  id="registrationNumber"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="TN 57 AB 1234"
                  maxLength={15}
                  className={
                    errors.registrationNumber
                      ? "input-error"
                      : ""
                  }
                />

                {errors.registrationNumber && (
                  <span className="error-message">
                    {errors.registrationNumber}
                  </span>
                )}

                <div className="input-help">
                  Example: TN 57 AB 1234
                </div>

              </div>

              <div className="form-group">

                <label htmlFor="year">
                  Manufacturing Year <span>*</span>
                </label>

                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="2024"
                  min="1900"
                  max={currentYear}
                  className={
                    errors.year ? "input-error" : ""
                  }
                />

                {errors.year && (
                  <span className="error-message">
                    {errors.year}
                  </span>
                )}

                <div className="input-help">
                  Enter the year shown in your vehicle documents.
                </div>

              </div>

            </div>

            <div className="form-row">

              <div className="form-group">

                <label htmlFor="purchaseDate">
                  Purchase Date <span>*</span>
                </label>

                <input
                  type="date"
                  id="purchaseDate"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  max={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  className={
                    errors.purchaseDate
                      ? "input-error"
                      : ""
                  }
                />

                {errors.purchaseDate && (
                  <span className="error-message">
                    {errors.purchaseDate}
                  </span>
                )}

              </div>

              <div className="form-group">

                <label htmlFor="odometer">
                  Current Odometer <span>*</span>
                </label>

                <div className="input-with-unit">

                  <input
                    type="number"
                    id="odometer"
                    name="odometer"
                    value={formData.odometer}
                    onChange={handleChange}
                    placeholder="10000"
                    min="0"
                    max="1000000"
                    className={
                      errors.odometer
                        ? "input-error"
                        : ""
                    }
                  />

                  <span>KM</span>

                </div>

                {errors.odometer && (
                  <span className="error-message">
                    {errors.odometer}
                  </span>
                )}

                <div className="input-help">
                  Enter the current reading on your bike.
                </div>

              </div>

            </div>

          </div>

          <div className="form-section">

            <div className="form-section-heading">

              <div className="section-number">
                02
              </div>

              <div>
                <h2>Bike Image</h2>

                <p>
                  Add an image of your bike. This is optional.
                </p>
              </div>

            </div>

            <div className="image-upload">

              <label
                htmlFor="bikeImage"
                className="upload-box"
              >

                {formData.image ? (
                  <div className="selected-image">

                    <img
                      src={formData.image}
                      alt="Bike preview"
                      style={{
                        width: "180px",
                        height: "110px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        marginBottom: "10px",
                      }}
                    />

                    <strong>
                      {bikeImage?.name || "Bike image selected"}
                    </strong>

                    <span>
                      Click to change image
                    </span>

                  </div>
                ) : (
                  <div className="upload-content">

                    <div className="upload-icon">
                      📷
                    </div>

                    <strong>
                      Click to upload bike image
                    </strong>

                    <span>
                      PNG, JPG or JPEG • Maximum 5 MB
                    </span>

                  </div>
                )}

              </label>

              <input
                type="file"
                id="bikeImage"
                name="bikeImage"
                accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                onChange={handleImageChange}
                hidden
              />

              {errors.image && (
                <span className="error-message">
                  {errors.image}
                </span>
              )}

            </div>

          </div>

          <div className="form-actions">

            <Link
              to="/bikes"
              className="cancel-btn"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="save-bike-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Saving..."
              ) : (
                <>
                  <span>✓</span>
                  Save Bike
                </>
              )}
            </button>

          </div>

        </form>

        <aside className="bike-info-panel">

          <div className="info-bike-icon">
            🏍️
          </div>

          <h2>
            Smart Bike Care
          </h2>

          <p>
            Keep your bike information updated to
            get accurate maintenance reminders,
            service tracking and health insights.
          </p>

          <div className="info-list">

            <div className="info-item">

              <span>✓</span>

              <div>
                <strong>
                  Service Tracking
                </strong>

                <small>
                  Keep track of every service and
                  maintenance activity.
                </small>
              </div>

            </div>

            <div className="info-item">

              <span>✓</span>

              <div>
                <strong>
                  Maintenance Reminders
                </strong>

                <small>
                  Get reminders when your next
                  service is due.
                </small>
              </div>

            </div>

            <div className="info-item">

              <span>✓</span>

              <div>
                <strong>
                  Bike Health
                </strong>

                <small>
                  Monitor the overall health of
                  your bike.
                </small>
              </div>

            </div>

            <div className="info-item">

              <span>✓</span>

              <div>
                <strong>
                  Service History
                </strong>

                <small>
                  Access your complete service
                  history whenever you need it.
                </small>
              </div>

            </div>

          </div>

        </aside>

      </div>

    </div>
  );
}

export default AddBike;