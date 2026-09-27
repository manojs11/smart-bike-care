import React, { useEffect, useRef, useState } from "react";
import "./Profile.css";

import {
  getMyProfile,
  updateMyProfile,
} from "../../services/profileApi";

const defaultProfile = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

function Profile() {
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(defaultProfile);
  const [savedProfile, setSavedProfile] = useState(defaultProfile);

  const [profilePhoto, setProfilePhoto] = useState("");
  const [savedPhoto, setSavedPhoto] = useState("");

  const [editMode, setEditMode] = useState(false);

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /*
   * Load profile from backend
   */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setErrors({});

        const response = await getMyProfile();

        const data = response.data || {};

        const loadedProfile = {
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
        };

        const photo = data.photoData || "";

        setProfile(loadedProfile);
        setSavedProfile(loadedProfile);

        setProfilePhoto(photo);
        setSavedPhoto(photo);
      } catch (error) {
        console.error("Unable to load profile:", error);

        setErrors({
          load:
            error.response?.data?.message ||
            "Unable to load your profile. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setSuccessMessage("");
  };

  const validateProfile = () => {
    const newErrors = {};

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const phonePattern =
      /^[0-9]{10}$/;

    const pincodePattern =
      /^[0-9]{6}$/;

    if (!profile.name.trim()) {
      newErrors.name = "Please enter your full name.";
    }

    if (!profile.email.trim()) {
      newErrors.email =
        "Please enter your email address.";
    } else if (
      !emailPattern.test(profile.email.trim())
    ) {
      newErrors.email =
        "Please enter a valid email address.";
    }

    if (!profile.phone.trim()) {
      newErrors.phone =
        "Please enter your phone number.";
    } else if (
      !phonePattern.test(profile.phone.trim())
    ) {
      newErrors.phone =
        "Phone number must contain exactly 10 digits.";
    }

    if (!profile.address.trim()) {
      newErrors.address =
        "Please enter your address.";
    }

    if (!profile.city.trim()) {
      newErrors.city =
        "Please enter your city.";
    }

    if (!profile.state.trim()) {
      newErrors.state =
        "Please enter your state.";
    }

    if (!profile.pincode.trim()) {
      newErrors.pincode =
        "Please enter your pincode.";
    } else if (
      !pincodePattern.test(profile.pincode.trim())
    ) {
      newErrors.pincode =
        "Pincode must contain exactly 6 digits.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => {
    setSavedProfile(profile);
    setSavedPhoto(profilePhoto);

    setErrors({});
    setSuccessMessage("");

    setEditMode(true);
  };

  const handleCancel = () => {
    setProfile(savedProfile);
    setProfilePhoto(savedPhoto);

    setErrors({});
    setSuccessMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setEditMode(false);
  };

  const handlePhotoClick = () => {
    if (!editMode) {
      setSavedProfile(profile);
      setSavedPhoto(profilePhoto);
      setEditMode(true);
    }

    setErrors((previous) => ({
      ...previous,
      photo: "",
    }));

    setSuccessMessage("");

    setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrors((previous) => ({
        ...previous,
        photo:
          "Please select a JPG, JPEG, or PNG image.",
      }));

      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors((previous) => ({
        ...previous,
        photo:
          "Profile photo must be less than 2 MB.",
      }));

      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setProfilePhoto(reader.result);

      setErrors((previous) => ({
        ...previous,
        photo: "",
      }));

      setSuccessMessage("");
    };

    reader.onerror = () => {
      setErrors((previous) => ({
        ...previous,
        photo:
          "Unable to read the selected image.",
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfilePhoto("");

    setErrors((previous) => ({
      ...previous,
      photo: "",
    }));

    setSuccessMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /*
   * Save profile to backend
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccessMessage("");

    if (!validateProfile()) {
      return;
    }

    try {
      setSaving(true);

      setErrors({});

      const payload = {
        name: profile.name.trim(),
        email: profile.email.trim().toLowerCase(),
        phone: profile.phone.trim(),
        address: profile.address.trim(),
        city: profile.city.trim(),
        state: profile.state.trim(),
        pincode: profile.pincode.trim(),
        photoData: profilePhoto || null,
      };

      const response = await updateMyProfile(payload);

      const data = response.data || {};

      const updatedProfile = {
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
      };

      const updatedPhoto = data.photoData || "";

      setProfile(updatedProfile);
      setSavedProfile(updatedProfile);

      setProfilePhoto(updatedPhoto);
      setSavedPhoto(updatedPhoto);

      setEditMode(false);

      setErrors({});

      setSuccessMessage(
        "Profile information saved successfully."
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Unable to save profile:", error);

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to save profile information.";

      setErrors({
        save: message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-card profile-information-card">
          <div className="profile-card-header">
            <h2>Loading Profile...</h2>
            <p>
              Please wait while your profile information is
              loaded.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div>
          <span className="profile-label">
            ACCOUNT
          </span>

          <h1>My Profile</h1>

          <p>
            Manage your personal information and account
            details.
          </p>
        </div>

        {!editMode && (
          <button
            type="button"
            className="profile-edit-btn"
            onClick={handleEdit}
          >
            Edit Profile
          </button>
        )}
      </div>

      {successMessage && (
        <div className="profile-success">
          <span>✓</span>
          <span>{successMessage}</span>
        </div>
      )}

      {errors.load && (
        <div className="profile-error">
          {errors.load}
        </div>
      )}

      {errors.save && (
        <div className="profile-error">
          {errors.save}
        </div>
      )}

      {errors.photo && (
        <div className="profile-error">
          {errors.photo}
        </div>
      )}

      <div className="profile-grid">
        <div className="profile-card profile-user-card">
          <div className="profile-avatar">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                className="profile-avatar-image"
              />
            ) : (
              "👤"
            )}
          </div>

          <h2>
            {profile.name || "Your Name"}
          </h2>

          <p>
            {profile.email ||
              "Add your email address"}
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            onChange={handlePhotoChange}
            className="profile-file-input"
          />

          <div className="profile-photo-actions">
            <button
              type="button"
              className="profile-photo-btn"
              onClick={handlePhotoClick}
              disabled={saving}
            >
              {profilePhoto
                ? "Change Photo"
                : "Upload Photo"}
            </button>

            {profilePhoto && (
              <button
                type="button"
                className="profile-remove-photo-btn"
                onClick={handleRemovePhoto}
                disabled={saving}
              >
                Remove
              </button>
            )}
          </div>

          <span className="profile-photo-info">
            JPG, JPEG or PNG · Max 2 MB
          </span>
        </div>

        <div className="profile-card profile-information-card">
          <div className="profile-card-header">
            <div>
              <h2>Contact Information</h2>

              <p>
                {editMode
                  ? "Update your personal and contact details."
                  : "Your personal and contact information."}
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="profile-form"
          >
            <div className="profile-form-row">
              <div className="profile-form-group">
                <label>
                  Full Name
                  <span className="profile-required">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  disabled={!editMode || saving}
                />

                {errors.name && (
                  <span className="profile-field-error">
                    {errors.name}
                  </span>
                )}
              </div>

              <div className="profile-form-group">
                <label>
                  Email
                  <span className="profile-required">
                    *
                  </span>
                </label>

                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  disabled={!editMode || saving}
                />

                {errors.email && (
                  <span className="profile-field-error">
                    {errors.email}
                  </span>
                )}
              </div>
            </div>

            <div className="profile-form-row">
              <div className="profile-form-group">
                <label>
                  Phone Number
                  <span className="profile-required">
                    *
                  </span>
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);

                    setProfile((previous) => ({
                      ...previous,
                      phone: value,
                    }));

                    setErrors((previous) => ({
                      ...previous,
                      phone: "",
                    }));

                    setSuccessMessage("");
                  }}
                  placeholder="Enter 10 digit phone number"
                  maxLength="10"
                  disabled={!editMode || saving}
                />

                {errors.phone && (
                  <span className="profile-field-error">
                    {errors.phone}
                  </span>
                )}
              </div>

              <div className="profile-form-group">
                <label>
                  Pincode
                  <span className="profile-required">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  name="pincode"
                  value={profile.pincode}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6);

                    setProfile((previous) => ({
                      ...previous,
                      pincode: value,
                    }));

                    setErrors((previous) => ({
                      ...previous,
                      pincode: "",
                    }));

                    setSuccessMessage("");
                  }}
                  placeholder="Enter 6 digit pincode"
                  maxLength="6"
                  disabled={!editMode || saving}
                />

                {errors.pincode && (
                  <span className="profile-field-error">
                    {errors.pincode}
                  </span>
                )}
              </div>
            </div>

            <div className="profile-form-group profile-full-width">
              <label>
                Address
                <span className="profile-required">
                  *
                </span>
              </label>

              <textarea
                name="address"
                value={profile.address}
                onChange={handleChange}
                placeholder="Enter your complete address"
                rows="3"
                disabled={!editMode || saving}
              />

              {errors.address && (
                <span className="profile-field-error">
                  {errors.address}
                </span>
              )}
            </div>

            <div className="profile-form-row">
              <div className="profile-form-group">
                <label>
                  City
                  <span className="profile-required">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  name="city"
                  value={profile.city}
                  onChange={handleChange}
                  placeholder="Enter your city"
                  disabled={!editMode || saving}
                />

                {errors.city && (
                  <span className="profile-field-error">
                    {errors.city}
                  </span>
                )}
              </div>

              <div className="profile-form-group">
                <label>
                  State
                  <span className="profile-required">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  name="state"
                  value={profile.state}
                  onChange={handleChange}
                  placeholder="Enter your state"
                  disabled={!editMode || saving}
                />

                {errors.state && (
                  <span className="profile-field-error">
                    {errors.state}
                  </span>
                )}
              </div>
            </div>

            {editMode && (
              <div className="profile-form-actions">
                <button
                  type="button"
                  className="profile-cancel-btn"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="profile-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="profile-card profile-account-card">
        <div className="profile-card-header">
          <div>
            <h2>Account Information</h2>

            <p>
              Basic information about your Smart Bike Care
              account.
            </p>
          </div>
        </div>

        <div className="profile-account-grid">
          <div className="profile-account-item">
            <span>Member Since</span>

            <strong>September 2026</strong>
          </div>

          <div className="profile-account-item">
            <span>Account Status</span>

            <strong className="profile-status-active">
              Active
            </strong>
          </div>

          <div className="profile-account-item">
            <span>Account Type</span>

            <strong>Bike Owner</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;