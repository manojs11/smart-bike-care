
import React, {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useBikes } from "../../context/BikeContext";

import {
  getServiceById,
  updateService,
} from "../../services/serviceApi";

import "./EditService.css";

function EditService() {
  const navigate = useNavigate();

  const { serviceId } = useParams();

  const {
    selectedBike,
    selectedBikeId,
  } = useBikes();

  /*
   * The service GET/PUT APIs use only
   * the service ID.
   *
   * Bike ID is still used locally to
   * make sure a bike is selected.
   */
  const bikeId =
    selectedBike?.id || selectedBikeId;

  const [formData, setFormData] = useState({
    service: "",
    date: "",
    kilometers: "",
    amount: "",
    status: "Completed",
  });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    const loadService = async () => {
      if (!serviceId) {
        setError(
          "Service information is missing."
        );

        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        /*
         * CORRECT BACKEND REQUEST:
         *
         * GET /api/services/{serviceId}
         *
         * Only serviceId is passed.
         */
        const response =
          await getServiceById(
            serviceId
          );

        const service =
          response.data;

        setFormData({
          service:
            service.service || "",

          date:
            service.date || "",

          kilometers:
            service.kilometers ?? "",

          amount:
            service.amount ?? "",

          status:
            service.status ||
            "Completed",
        });
      } catch (error) {
        console.error(
          "Get service error:",
          error.response?.data ||
            error
        );

        setError(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Unable to load service details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [serviceId]);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!bikeId) {
      setError(
        "Bike information is missing."
      );

      return;
    }

    if (!serviceId) {
      setError(
        "Service information is missing."
      );

      return;
    }

    if (!formData.service.trim()) {
      setError(
        "Service name is required."
      );

      return;
    }

    if (!formData.date) {
      setError(
        "Service date is required."
      );

      return;
    }

    if (
      formData.kilometers === "" ||
      Number(formData.kilometers) < 0
    ) {
      setError(
        "Enter a valid kilometer value."
      );

      return;
    }

    if (
      formData.amount === "" ||
      Number(formData.amount) < 0
    ) {
      setError(
        "Enter a valid service amount."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const requestData = {
        service:
          formData.service.trim(),

        date:
          formData.date,

        kilometers:
          Number(
            formData.kilometers
          ),

        amount:
          Number(
            formData.amount
          ),

        status:
          formData.status,
      };

      /*
       * CORRECT BACKEND REQUEST:
       *
       * PUT /api/services/{serviceId}
       *
       * Do NOT pass bikeId.
       */
      await updateService(
        serviceId,
        requestData
      );

      setSuccess(
        "Service updated successfully."
      );

      setTimeout(() => {
        navigate(
          "/service-history"
        );
      }, 700);
    } catch (error) {
      console.error(
        "Update service error:",
        error.response?.data ||
          error
      );

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to update service."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(
      "/service-history"
    );
  };

  if (loading) {
    return (
      <div className="edit-service-page">
        <div className="edit-service-loading">
          <div className="edit-service-spinner"></div>

          <p>
            Loading service details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-service-page">
      <div className="edit-service-header">
        <div>
          <span className="edit-service-label">
            SERVICE MANAGEMENT
          </span>

          <h1>
            Edit Service
          </h1>

          <p>
            Update the maintenance
            details for this service
            record.
          </p>
        </div>

        <button
          type="button"
          className="edit-service-back-btn"
          onClick={handleBack}
        >
          ← Back to Service History
        </button>
      </div>

      <div className="edit-service-card">
        <div className="edit-service-card-header">
          <div className="edit-service-icon">
            🔧
          </div>

          <div>
            <h2>
              Service Details
            </h2>

            <p>
              Modify the information
              and save your changes.
            </p>
          </div>
        </div>

        {error && (
          <div className="edit-service-error">
            <strong>
              Error
            </strong>

            <span>
              {error}
            </span>
          </div>
        )}

        {success && (
          <div className="edit-service-success">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="edit-service-form"
        >
          <div className="edit-service-field">
            <label>
              Service Name
            </label>

            <input
              type="text"
              name="service"
              value={
                formData.service
              }
              onChange={
                handleChange
              }
              placeholder="Example: Engine Oil Change"
            />
          </div>

          <div className="edit-service-row">
            <div className="edit-service-field">
              <label>
                Service Date
              </label>

              <input
                type="date"
                name="date"
                value={
                  formData.date
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="edit-service-field">
              <label>
                Kilometers
              </label>

              <div className="edit-service-input-unit">
                <input
                  type="number"
                  name="kilometers"
                  value={
                    formData.kilometers
                  }
                  onChange={
                    handleChange
                  }
                  min="0"
                  placeholder="12500"
                />

                <span>
                  km
                </span>
              </div>
            </div>
          </div>

          <div className="edit-service-row">
            <div className="edit-service-field">
              <label>
                Service Amount
              </label>

              <div className="edit-service-input-unit">
                <span className="currency">
                  ₹
                </span>

                <input
                  type="number"
                  name="amount"
                  value={
                    formData.amount
                  }
                  onChange={
                    handleChange
                  }
                  min="0"
                  step="0.01"
                  placeholder="850"
                />
              </div>
            </div>

            <div className="edit-service-field">
              <label>
                Status
              </label>

              <select
                name="status"
                value={
                  formData.status
                }
                onChange={
                  handleChange
                }
              >
                <option value="Completed">
                  Completed
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="Cancelled">
                  Cancelled
                </option>
              </select>
            </div>
          </div>

          <div className="edit-service-actions">
            <button
              type="button"
              className="edit-service-cancel-btn"
              onClick={handleBack}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="edit-service-save-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditService;

