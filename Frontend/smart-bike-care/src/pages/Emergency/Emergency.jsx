import React, { useEffect, useState } from "react";
import "./Emergency.css";

import {
  getEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
} from "../../services/emergencyApi";

function Emergency() {
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    phone: "",
  });

  const [loadingContacts, setLoadingContacts] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [deletingContactId, setDeletingContactId] = useState(null);

  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [locationSuccess, setLocationSuccess] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================================================
     LOAD EMERGENCY CONTACTS
  ========================================================= */

  const loadContacts = async () => {
    try {
      setLoadingContacts(true);
      setError("");

      const response = await getEmergencyContacts();

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setContacts(data);
    } catch (err) {
      console.error("Emergency contacts loading error:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to load emergency contacts.";

      setError(message);
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  /* =========================================================
     FORM
  ========================================================= */

  const resetForm = () => {
    setFormData({
      name: "",
      relationship: "",
      phone: "",
    });

    setError("");
  };

  const closeModal = () => {
    if (savingContact) {
      return;
    }

    setActiveContact(null);
    resetForm();
  };

  const handleAddContact = () => {
    resetForm();
    setActiveContact("new");
    setSuccess("");
  };

  const handleEditContact = (contact) => {
    setFormData({
      name: contact.name || "",
      relationship: contact.relationship || "",
      phone: contact.phone || "",
    });

    setActiveContact(contact.id);
    setError("");
    setSuccess("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    const name = formData.name.trim();
    const relationship = formData.relationship.trim();
    const phone = formData.phone.trim();

    if (!name) {
      setError("Please enter the contact name.");
      return false;
    }

    if (!relationship) {
      setError("Please enter the relationship.");
      return false;
    }

    if (!phone) {
      setError("Please enter the phone number.");
      return false;
    }

    const phoneNumber = phone.replace(/[\s-]/g, "");

    if (!/^\+?[0-9]{10,15}$/.test(phoneNumber)) {
      setError("Please enter a valid phone number.");
      return false;
    }

    return true;
  };

  /* =========================================================
     ADD / UPDATE CONTACT
  ========================================================= */

  const handleSaveContact = async () => {
    if (!validateForm()) {
      return;
    }

    const contactData = {
      name: formData.name.trim(),
      relationship: formData.relationship.trim(),
      phone: formData.phone.trim(),
    };

    try {
      setSavingContact(true);
      setError("");

      if (activeContact === "new") {
        const response = await addEmergencyContact(contactData);

        const newContact = response.data;

        setContacts((previous) => [
          ...previous,
          newContact,
        ]);

        setSuccess("Emergency contact added successfully.");
      } else {
        const response = await updateEmergencyContact(
          activeContact,
          contactData
        );

        const updatedContact = response.data;

        setContacts((previous) =>
          previous.map((contact) =>
            contact.id === activeContact
              ? updatedContact
              : contact
          )
        );

        setSuccess("Emergency contact updated successfully.");
      }

      setActiveContact(null);
      resetForm();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Emergency contact save error:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to save emergency contact.";

      setError(message);
    } finally {
      setSavingContact(false);
    }
  };

  /* =========================================================
     DELETE CONTACT
  ========================================================= */

  const handleDeleteContact = async (contact) => {
    const confirmed = window.confirm(
      `Delete ${contact.name} from emergency contacts?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingContactId(contact.id);
      setError("");

      await deleteEmergencyContact(contact.id);

      setContacts((previous) =>
        previous.filter(
          (item) => item.id !== contact.id
        )
      );

      setSuccess(
        "Emergency contact deleted successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Emergency contact delete error:",
        err
      );

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to delete emergency contact.";

      setError(message);
    } finally {
      setDeletingContactId(null);
    }
  };

  /* =========================================================
     CALL CONTACT
  ========================================================= */

  const handleCallContact = (phone) => {
    if (!phone) {
      return;
    }

    window.location.href = `tel:${phone}`;
  };

  /* =========================================================
     GET CURRENT LOCATION
  ========================================================= */

  const handleGetLocation = () => {
    setLocationError("");
    setLocationSuccess("");
    setLocationLoading(true);

    if (!navigator.geolocation) {
      setLocationLoading(false);

      setLocationError(
        "Geolocation is not supported by your browser."
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setLocation({
          latitude,
          longitude,
          accuracy: position.coords.accuracy,
        });

        setLocationLoading(false);

        setLocationSuccess(
          "Your current location was detected successfully."
        );
      },
      (locationError) => {
        setLocationLoading(false);

        if (locationError.code === 1) {
          setLocationError(
            "Location permission was denied. Please allow location access in your browser."
          );
        } else if (locationError.code === 2) {
          setLocationError(
            "Your location could not be detected. Please try again."
          );
        } else if (locationError.code === 3) {
          setLocationError(
            "Location request timed out. Please try again."
          );
        } else {
          setLocationError(
            "Unable to get your current location."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  /* =========================================================
     LOCATION LINK
  ========================================================= */

  const getLocationLink = () => {
    if (!location) {
      return "";
    }

    return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
  };

  /* =========================================================
     COPY LOCATION
  ========================================================= */

  const handleCopyLocation = async () => {
    const locationLink = getLocationLink();

    if (!locationLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        locationLink
      );

      setLocationSuccess(
        "Location link copied successfully."
      );

      setTimeout(() => {
        setLocationSuccess("");
      }, 3000);
    } catch (copyError) {
      console.error(
        "Copy location error:",
        copyError
      );

      setLocationError(
        "Unable to copy the location link."
      );
    }
  };

  /* =========================================================
     SHARE LOCATION
  ========================================================= */

  const handleShareLocation = async () => {
    const locationLink = getLocationLink();

    if (!locationLink) {
      return;
    }

    const shareText =
      `My current location: ${locationLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Emergency Location",
          text: shareText,
        });

        setLocationSuccess(
          "Location shared successfully."
        );

        setTimeout(() => {
          setLocationSuccess("");
        }, 3000);
      } catch (shareError) {
        if (shareError.name !== "AbortError") {
          setLocationError(
            "Unable to share the location."
          );
        }
      }

      return;
    }

    try {
      await navigator.clipboard.writeText(
        shareText
      );

      setLocationSuccess(
        "Location link copied. You can paste it into WhatsApp or Messages."
      );

      setTimeout(() => {
        setLocationSuccess("");
      }, 4000);
    } catch (copyError) {
      console.error(
        "Share location error:",
        copyError
      );

      setLocationError(
        "Your browser does not support location sharing."
      );
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="emergency-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="emergency-header">
        <div>
          <div className="emergency-label">
            EMERGENCY
          </div>

          <h1>Emergency</h1>

          <p>
            Quickly access your emergency contacts and
            share your current location.
          </p>
        </div>
      </div>

      {/* =====================================================
          SUCCESS MESSAGE
      ===================================================== */}

      {success && (
        <div className="emergency-message emergency-success">
          <span>✓</span>
          {success}
        </div>
      )}

      {/* =====================================================
          ERROR MESSAGE
      ===================================================== */}

      {error && !activeContact && (
        <div className="emergency-message emergency-error">
          <span>!</span>
          {error}
        </div>
      )}

      <div className="emergency-content">

        {/* ===================================================
            EMERGENCY CONTACTS
        =================================================== */}

        <section className="emergency-section">

          <div className="emergency-section-header">

            <div>
              <h2>Emergency Contacts</h2>

              <p>
                Add people you can contact quickly
                during an emergency.
              </p>
            </div>

            <button
              type="button"
              className="emergency-primary-button"
              onClick={handleAddContact}
              disabled={loadingContacts}
            >
              + Add Contact
            </button>

          </div>

          {/* LOADING */}

          {loadingContacts ? (
            <div className="emergency-empty-contact">

              <div className="emergency-empty-icon">
                ⏳
              </div>

              <h3>
                Loading Emergency Contacts
              </h3>

              <p>
                Please wait while your contacts are
                being loaded.
              </p>

            </div>
          ) : contacts.length === 0 ? (

            /* EMPTY */

            <div className="emergency-empty-contact">

              <div className="emergency-empty-icon">
                👤
              </div>

              <h3>
                No Emergency Contacts
              </h3>

              <p>
                Add a trusted person such as a family
                member or friend.
              </p>

              <button
                type="button"
                className="emergency-secondary-button"
                onClick={handleAddContact}
              >
                + Add Emergency Contact
              </button>

            </div>

          ) : (

            /* CONTACT LIST */

            <div className="emergency-contact-list">

              {contacts.map((contact) => (

                <div
                  className="emergency-contact-card"
                  key={contact.id}
                >

                  <div className="emergency-contact-left">

                    <div className="emergency-contact-avatar">
                      👤
                    </div>

                    <div className="emergency-contact-info">

                      <h3>
                        {contact.name}
                      </h3>

                      <p>
                        {contact.relationship}
                      </p>

                      <span>
                        {contact.phone}
                      </span>

                    </div>

                  </div>

                  <div className="emergency-contact-actions">

                    <button
                      type="button"
                      className="contact-action call"
                      onClick={() =>
                        handleCallContact(
                          contact.phone
                        )
                      }
                    >
                      📞 Call
                    </button>

                    <button
                      type="button"
                      className="contact-action edit"
                      onClick={() =>
                        handleEditContact(contact)
                      }
                      disabled={
                        deletingContactId ===
                        contact.id
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="contact-action delete"
                      onClick={() =>
                        handleDeleteContact(contact)
                      }
                      disabled={
                        deletingContactId ===
                        contact.id
                      }
                    >
                      {deletingContactId ===
                      contact.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* ===================================================
            CURRENT LOCATION
        =================================================== */}

        <section className="emergency-section location-section">

          <div className="emergency-section-header">

            <div>
              <h2>
                Share Current Location
              </h2>

              <p>
                Get your current location and share it
                with your emergency contact.
              </p>
            </div>

          </div>

          <div className="location-card">

            <div className="location-icon">
              📍
            </div>

            <div className="location-content">

              <h3>
                Your Current Location
              </h3>

              {!location &&
                !locationLoading && (
                  <p>
                    Your GPS location will be detected
                    when you click the button.
                  </p>
                )}

              {locationLoading && (
                <p className="location-loading">
                  Detecting your current location...
                </p>
              )}

              {location && (
                <div className="location-details">

                  <div>
                    <span>
                      Latitude
                    </span>

                    <strong>
                      {location.latitude.toFixed(
                        6
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Longitude
                    </span>

                    <strong>
                      {location.longitude.toFixed(
                        6
                      )}
                    </strong>
                  </div>

                  {location.accuracy && (
                    <div>
                      <span>
                        Accuracy
                      </span>

                      <strong>
                        ±
                        {Math.round(
                          location.accuracy
                        )}{" "}
                        m
                      </strong>
                    </div>
                  )}

                </div>
              )}

            </div>

            {!location && (
              <button
                type="button"
                className="location-button"
                onClick={handleGetLocation}
                disabled={locationLoading}
              >
                {locationLoading
                  ? "Getting Location..."
                  : "📍 Get Current Location"}
              </button>
            )}

          </div>

          {locationError && (
            <div className="location-message location-error">
              <span>!</span>
              {locationError}
            </div>
          )}

          {locationSuccess && (
            <div className="location-message location-success">
              <span>✓</span>
              {locationSuccess}
            </div>
          )}

          {location && (
            <div className="location-share-area">

              <div className="location-link-box">

                <span>
                  Google Maps
                </span>

                <a
                  href={getLocationLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Location
                </a>

              </div>

              <div className="location-actions">

                <button
                  type="button"
                  className="location-action-button copy"
                  onClick={handleCopyLocation}
                >
                  Copy Location
                </button>

                <button
                  type="button"
                  className="location-action-button share"
                  onClick={handleShareLocation}
                >
                  📤 Share Location
                </button>

                <button
                  type="button"
                  className="location-action-button refresh"
                  onClick={handleGetLocation}
                  disabled={locationLoading}
                >
                  🔄 Update Location
                </button>

              </div>

            </div>
          )}

        </section>

      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {activeContact && (

        <div
          className="emergency-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !savingContact
            ) {
              closeModal();
            }
          }}
        >

          <div className="emergency-modal">

            {/* MODAL HEADER */}

            <div className="emergency-modal-header">

              <div>

                <span className="emergency-modal-label">
                  {activeContact === "new"
                    ? "ADD CONTACT"
                    : "EDIT CONTACT"}
                </span>

                <h2>
                  {activeContact === "new"
                    ? "Emergency Contact"
                    : "Edit Emergency Contact"}
                </h2>

              </div>

              <button
                type="button"
                className="emergency-modal-close"
                onClick={closeModal}
                disabled={savingContact}
              >
                ×
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="emergency-modal-body">

              {error && (
                <div className="emergency-message emergency-error">
                  <span>!</span>
                  {error}
                </div>
              )}

              <div className="emergency-form">

                <div className="emergency-form-field">

                  <label>
                    Contact Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Example: Manoj"
                    disabled={savingContact}
                  />

                </div>

                <div className="emergency-form-field">

                  <label>
                    Relationship *
                  </label>

                  <input
                    type="text"
                    name="relationship"
                    value={
                      formData.relationship
                    }
                    onChange={handleInputChange}
                    placeholder="Example: Father"
                    disabled={savingContact}
                  />

                </div>

                <div className="emergency-form-field">

                  <label>
                    Phone Number *
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Example: +91 9876543210"
                    disabled={savingContact}
                  />

                </div>

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="emergency-modal-footer">

              <button
                type="button"
                className="emergency-cancel-button"
                onClick={closeModal}
                disabled={savingContact}
              >
                Cancel
              </button>

              <button
                type="button"
                className="emergency-save-button"
                onClick={handleSaveContact}
                disabled={savingContact}
              >
                {savingContact
                  ? "Saving..."
                  : activeContact === "new"
                  ? "Add Contact"
                  : "Save Changes"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Emergency;

