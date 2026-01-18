import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfileApi } from "../../api/auth.api";
import "./EditProfile.css";

const EditProfile = () => {
  const navigate = useNavigate();

  // Load current user
  const storedInfo = JSON.parse(localStorage.getItem("userInfo") || "null");
  const user = storedInfo?.user || storedInfo;

  const [name, setName] = useState(user?.name || "");
  const [preview, setPreview] = useState(user?.avatar || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  // Handle Image Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file)); // Show local preview immediately
    }
  };

  // Handle Save
  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (selectedFile) {
        formData.append("avatar", selectedFile);
      }

      const { data } = await updateProfileApi(formData);

      // Update Local Storage with new data
      const newInfo = { ...storedInfo, user: data.user };
      localStorage.setItem("userInfo", JSON.stringify(newInfo));

      alert("Profile Updated!");
      navigate("/app/settings"); // Go back
    } catch (error) {
      console.error(error);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-container">
      {/* Header */}
      <div className="edit-header">
        <button className="back-btn" onClick={() => navigate("/app/settings")}>
          ←
        </button>
        <h1>Edit Profile</h1>
        <div style={{ width: 24 }}></div> {/* Spacer for centering */}
      </div>

      <div className="edit-content">
        {/* Avatar Upload Section */}
        <div className="avatar-upload-wrapper">
          <div
            className="avatar-preview"
            onClick={() => fileInputRef.current.click()}
          >
            {preview ? (
              <img src={preview} alt="Profile" />
            ) : (
              <span>{name?.[0] || "U"}</span>
            )}
            <div className="camera-overlay">
              <span>📷</span>
            </div>
          </div>
          <p className="change-photo-text">Tap to change photo</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            hidden
            accept="image/*"
          />
        </div>

        {/* Form Fields */}
        <div className="form-group">
          <label>Full Name</label>
          <input
            className="edit-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
          />
        </div>

        <div className="form-group disabled">
          <label>Email</label>
          <input className="edit-input" value={user?.email || ""} disabled />
          <span className="info-text">Email cannot be changed</span>
        </div>
      </div>

      {/* Save Button */}
      <div className="edit-footer">
        <button className="save-btn" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
