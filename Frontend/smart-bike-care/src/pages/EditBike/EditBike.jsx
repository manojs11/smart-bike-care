import React, { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useBikes } from "../../context/BikeContext";
import "./EditBike.css";

function EditBike() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    bikes,
    getBikeById,
    updateBike,
    selectedBikeId,
    setSelectedBike,
  } = useBikes();

  const bike = getBikeById(id);

  const bikeData = {
    Honda: [
      "Activa 6G",
      "Activa 125",
      "Shine 100",
      "Shine 125",
      "SP 125",
      "Unicorn 160",
      "Hornet 2.0",
      "CB200X",
    ],

    Yamaha: [
      "FZ-FI",
      "FZ-S FI",
      "MT-15",
      "R15 V4",
      "Fascino 125",
      "RayZR 125",
    ],

    TVS: [
      "Apache RTR 160",
      "Apache RTR 200",
      "Apache RR 310",
      "Raider 125",
      "Jupiter",
      "Ntorq 125",
    ],

    Bajaj: [
      "Pulsar 125",
      "Pulsar 150",
      "Pulsar NS160",
      "Pulsar NS200",
      "Pulsar RS200",
      "Dominar 250",
      "Dominar 400",
    ],

    RoyalEnfield: [
      "Classic 350",
      "Hunter 350",
      "Meteor 350",
      "Bullet 350",
      "Himalayan 450",
      "Interceptor 650",
      "Continental GT 650",
    ],

    Suzuki: [
      "Access 125",
      "Burgman Street",
      "Gixxer",
      "Gixxer SF",
    ],

    Hero: [
      "Splendor Plus",
      "HF Deluxe",
      "Glamour",
      "Xtreme 125R",
      "Xtreme 160R",
      "Karizma XMR",
    ],
  };

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    registrationNumber: "",
    year: "",
    purchaseDate: "",
    odometer: "",
    imageData: null,
  });

  const [bikeImage, setBikeImage] = useState(null);

  const [errors, setErrors] = useState({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!bike) {
      return;
    }

    setFormData({
      brand: bike.brand || "",
      model: bike.model || "",
      registrationNumber:
        bike.registrationNumber || "",

      year:
        bike.year !== undefined &&
        bike.year !== null
          ? String(bike.year)
          : "",

      purchaseDate:
        bike.purchaseDate || "",

      odometer:
        bike.odometer !== undefined &&
        bike.odometer !== null
          ? String(bike.odometer)
          : "",

      imageData:
        bike.imageData ||
        bike.image ||
        null,
    });

    setBikeImage(null);
    setErrors({});
    setSuccess("");
  }, [bike]);

  useEffect(() => {
    if (
      bike &&
      selectedBikeId !== bike.id
    ) {
      setSelectedBike(bike.id);
    }
  }, [
    bike,
    selectedBikeId,
    setSelectedBike,
  ]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,

      [name]: value,

      ...(name === "brand"
        ? {
            model: "",
          }
        : {}),
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      submit: "",
    }));

    setSuccess("");
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrors((previous) => ({
        ...previous,
        image:
          "Only PNG, JPG or JPEG images are allowed.",
      }));

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((previous) => ({
        ...previous,
        image:
          "Image size must be less than 5 MB.",
      }));

      event.target.value = "";
      return;
    }

    setBikeImage(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData((previous) => ({
        ...previous,
        imageData: reader.result,
      }));

      setErrors((previous) => ({
        ...previous,
        image: "",
      }));
    };

    reader.onerror = () => {
      setErrors((previous) => ({
        ...previous,
        image:
          "Unable to read the image. Please try again.",
      }));

      setBikeImage(null);
    };

    reader.readAsDataURL(file);
  };

  const normalizeRegistrationNumber = (
    value
  ) => {
    return value
      .trim()
      .replace(/\s+/g, " ")
      .toUpperCase();
  };

  const validateRegistrationNumber = (
    registrationNumber
  ) => {
    const value =
      normalizeRegistrationNumber(
        registrationNumber
      );

    if (!value) {
      return "Registration number is required.";
    }

    if (value.length < 6) {
      return "Please enter a valid registration number.";
    }

    if (value.length > 15) {
      return "Registration number must not exceed 15 characters.";
    }

    const registrationPattern =
      /^[A-Z]{2}\s?[0-9]{1,2}\s?[A-Z]{1,3}\s?[0-9]{1,4}$/;

    if (!registrationPattern.test(value)) {
      return "Enter a valid registration number, for example TN 01 AB 1234.";
    }

    const duplicateBike = bikes.some(
      (item) =>
        String(item.id) !== String(bike.id) &&
        normalizeRegistrationNumber(
          item.registrationNumber || ""
        ) === value
    );

    if (duplicateBike) {
      return "This registration number is already registered.";
    }

    return "";
  };

  const validateForm = () => {
    const newErrors = {};

    const currentYear =
      new Date().getFullYear();

    if (!formData.brand) {
      newErrors.brand =
        "Please select a bike brand.";
    }

    if (!formData.model) {
      newErrors.model =
        "Please select a bike model.";
    }

    if (
      formData.brand &&
      formData.model
    ) {
      const availableModels =
        bikeData[formData.brand] || [];

      if (
        !availableModels.includes(
          formData.model
        )
      ) {
        newErrors.model =
          "Please select a valid bike model.";
      }
    }

    const registrationError =
      validateRegistrationNumber(
        formData.registrationNumber
      );

    if (registrationError) {
      newErrors.registrationNumber =
        registrationError;
    }

    if (!formData.year) {
      newErrors.year =
        "Manufacturing year is required.";
    } else {
      const yearValue =
        Number(formData.year);

      if (!Number.isInteger(yearValue)) {
        newErrors.year =
          "Please enter a valid year.";
      } else if (
        yearValue < 1900 ||
        yearValue > currentYear
      ) {
        newErrors.year =
          `Year must be between 1900 and ${currentYear}.`;
      }
    }

    if (!formData.purchaseDate) {
      newErrors.purchaseDate =
        "Purchase date is required.";
    } else {
      const selectedDate =
        new Date(
          `${formData.purchaseDate}T00:00:00`
        );

      const today = new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      if (selectedDate > today) {
        newErrors.purchaseDate =
          "Purchase date cannot be in the future.";
      }
    }

    if (
      formData.odometer === "" ||
      formData.odometer === null
    ) {
      newErrors.odometer =
        "Current odometer reading is required.";
    } else {
      const odometerValue =
        Number(formData.odometer);

      if (
        !Number.isFinite(
          odometerValue
        )
      ) {
        newErrors.odometer =
          "Please enter a valid odometer reading.";
      } else if (
        odometerValue < 0
      ) {
        newErrors.odometer =
          "Odometer reading cannot be negative.";
      } else if (
        odometerValue > 1000000
      ) {
        newErrors.odometer =
          "Please enter a valid odometer reading.";
      } else if (
        bike &&
        odometerValue <
          Number(bike.odometer || 0)
      ) {
        newErrors.odometer =
          "Odometer reading cannot be lower than the current reading.";
      }
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!bike) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSuccess("");

    try {
      setSelectedBike(bike.id);

      const updatedBike = {
        brand:
          formData.brand.trim(),

        model:
          formData.model.trim(),

        registrationNumber:
          normalizeRegistrationNumber(
            formData.registrationNumber
          ),

        year:
          Number(formData.year),

        purchaseDate:
          formData.purchaseDate,

        odometer:
          Number(formData.odometer),

        imageData:
          formData.imageData || null,
      };

      await updateBike(
        bike.id,
        updatedBike
      );

      setSuccess(
        "Bike details updated successfully."
      );

      setTimeout(() => {
        navigate(
          `/bikes/${bike.id}`
        );
      }, 1000);
    } catch (error) {
      console.error(
        "Update bike error:",
        error
      );

      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to update bike details. Please try again.";

      setErrors((previous) => ({
        ...previous,
        submit: backendMessage,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (bike) {
      setSelectedBike(bike.id);

      navigate(
        `/bikes/${bike.id}`
      );
    } else {
      navigate("/bikes");
    }
  };

  if (!bike) {
    return (
      <div className="edit-bike-not-found">
        <div className="not-found-icon">
          🏍️
        </div>

        <h1>Bike Not Found</h1>

        <p>
          The bike you are trying to edit
          does not exist.
        </p>

        <Link
          to="/bikes"
          className="back-bikes-btn"
        >
          Back to My Bikes
        </Link>
      </div>
    );
  }

  return (
    <div className="edit-bike-page">
      <div className="edit-bike-header">
        <Link
          to={`/bikes/${bike.id}`}
          className="back-link"
          onClick={() =>
            setSelectedBike(bike.id)
          }
        >
          ← Back to Bike Details
        </Link>

        <span className="page-label">
          BIKE MANAGEMENT
        </span>

        <h1>Edit Bike</h1>

        <p>
          Update your {bike.brand}{" "}
          {bike.model} details and keep
          your bike information accurate.
        </p>
      </div>

      {success && (
        <div
          style={{
            marginBottom: "20px",
            padding: "13px 16px",
            borderRadius: "9px",
            background: "#dcfce7",
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
            marginBottom: "20px",
            padding: "13px 16px",
            borderRadius: "9px",
            background: "#fee2e2",
            color: "#dc2626",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          {errors.submit}
        </div>
      )}

      <div className="edit-bike-layout">
        <form
          className="edit-bike-form"
          onSubmit={handleSubmit}
        >
          <div className="edit-form-section">
            <div className="edit-section-heading">
              <div className="edit-section-number">
                01
              </div>

              <div>
                <h2>
                  Bike Information
                </h2>

                <p>
                  Update your bike's basic
                  information.
                </p>
              </div>
            </div>

            <div className="edit-form-row">
              <div className="edit-form-group">
                <label htmlFor="brand">
                  Bike Brand
                  <span>*</span>
                </label>

                <select
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className={
                    errors.brand
                      ? "input-error"
                      : ""
                  }
                >
                  <option value="">
                    Select brand
                  </option>

                  {Object.keys(
                    bikeData
                  ).map((brand) => (
                    <option
                      key={brand}
                      value={brand}
                    >
                      {brand ===
                      "RoyalEnfield"
                        ? "Royal Enfield"
                        : brand}
                    </option>
                  ))}
                </select>

                {errors.brand && (
                  <small className="error-message">
                    {errors.brand}
                  </small>
                )}
              </div>

              <div className="edit-form-group">
                <label htmlFor="model">
                  Bike Model
                  <span>*</span>
                </label>

                <select
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  disabled={
                    !formData.brand
                  }
                  className={
                    errors.model
                      ? "input-error"
                      : ""
                  }
                >
                  <option value="">
                    {formData.brand
                      ? "Select model"
                      : "Select brand first"}
                  </option>

                  {formData.brand &&
                    bikeData[
                      formData.brand
                    ].map((model) => (
                      <option
                        key={model}
                        value={model}
                      >
                        {model}
                      </option>
                    ))}
                </select>

                {errors.model && (
                  <small className="error-message">
                    {errors.model}
                  </small>
                )}
              </div>

              <div className="edit-form-group">
                <label
                  htmlFor="registrationNumber"
                >
                  Registration Number
                  <span>*</span>
                </label>

                <input
                  id="registrationNumber"
                  type="text"
                  name="registrationNumber"
                  value={
                    formData.registrationNumber
                  }
                  onChange={handleChange}
                  placeholder="Example: TN 01 AB 1234"
                  maxLength="15"
                  autoCapitalize="characters"
                  className={
                    errors.registrationNumber
                      ? "input-error"
                      : ""
                  }
                />

                {errors.registrationNumber && (
                  <small className="error-message">
                    {
                      errors.registrationNumber
                    }
                  </small>
                )}
              </div>

              <div className="edit-form-group">
                <label htmlFor="year">
                  Manufacturing Year
                  <span>*</span>
                </label>

                <input
                  id="year"
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  min="1900"
                  max={
                    new Date().getFullYear()
                  }
                  step="1"
                  placeholder="Example: 2024"
                  className={
                    errors.year
                      ? "input-error"
                      : ""
                  }
                />

                {errors.year && (
                  <small className="error-message">
                    {errors.year}
                  </small>
                )}
              </div>

              <div className="edit-form-group">
                <label
                  htmlFor="purchaseDate"
                >
                  Purchase Date
                  <span>*</span>
                </label>

                <input
                  id="purchaseDate"
                  type="date"
                  name="purchaseDate"
                  value={
                    formData.purchaseDate
                  }
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
                  <small className="error-message">
                    {errors.purchaseDate}
                  </small>
                )}
              </div>

              <div className="edit-form-group">
                <label htmlFor="odometer">
                  Current Odometer
                  <span>*</span>
                </label>

                <div className="edit-input-with-unit">
                  <input
                    id="odometer"
                    type="number"
                    name="odometer"
                    value={
                      formData.odometer
                    }
                    onChange={
                      handleChange
                    }
                    min="0"
                    max="1000000"
                    step="1"
                    placeholder="Enter kilometers"
                    className={
                      errors.odometer
                        ? "input-error"
                        : ""
                    }
                  />

                  <span>km</span>
                </div>

                {errors.odometer && (
                  <small className="error-message">
                    {errors.odometer}
                  </small>
                )}

                <small className="field-help">
                  Odometer cannot be lower
                  than the current reading.
                </small>
              </div>
            </div>
          </div>

          <div className="edit-form-section">
            <div className="edit-section-heading">
              <div className="edit-section-number">
                02
              </div>

              <div>
                <h2>Bike Image</h2>

                <p>
                  Upload a new image to
                  replace the current bike
                  photo.
                </p>
              </div>
            </div>

            <label
              htmlFor="bikeImage"
              className="edit-upload-box"
            >
              {bikeImage ? (
                <div className="selected-image">
                  <div className="uploaded-icon">
                    ✓
                  </div>

                  <strong>
                    {bikeImage.name}
                  </strong>

                  <span>
                    Click to change image
                  </span>
                </div>
              ) : (
                <div className="edit-upload-content">
                  <div className="edit-upload-icon">
                    📷
                  </div>

                  <strong>
                    Update Bike Image
                  </strong>

                  <span>
                    PNG, JPG or JPEG up to
                    5 MB
                  </span>
                </div>
              )}
            </label>

            <input
              id="bikeImage"
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={
                handleImageChange
              }
              hidden
            />

            {errors.image && (
              <small className="error-message">
                {errors.image}
              </small>
            )}
          </div>

          <div className="edit-form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="update-bike-btn"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Updating..."
                : "✓ Update Bike"}
            </button>
          </div>
        </form>

        <aside className="edit-bike-side-panel">
          <div className="side-bike-icon">
            🏍️
          </div>

          <span className="side-panel-label">
            CURRENT BIKE
          </span>

          <h2>
            {formData.brand ||
              bike.brand}
          </h2>

          <h3>
            {formData.model ||
              bike.model}
          </h3>

          <div className="side-registration">
            <span>
              REGISTRATION NUMBER
            </span>

            <strong>
              {formData.registrationNumber ||
                "Not available"}
            </strong>
          </div>

          <div className="side-odometer">
            <span>
              CURRENT ODOMETER
            </span>

            <strong>
              {formData.odometer
                ? `${Number(
                    formData.odometer
                  ).toLocaleString()} km`
                : "0 km"}
            </strong>
          </div>

          <div className="side-panel-note">
            <span>💡</span>

            <p>
              Keep your bike information
              accurate to receive better
              service reminders and
              maintenance recommendations.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default EditBike;