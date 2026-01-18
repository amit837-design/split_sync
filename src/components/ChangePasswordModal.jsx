import React, { useState } from "react";
import { changePasswordApi } from "../api/auth.api";
import "./GlobalPoolModal.css"; // We reuse styles but will add specific overrides below

const ChangePasswordModal = ({ onClose }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword) {
      setStatusMsg({ type: "error", text: "Please fill all fields" });
      return;
    }
    
    setLoading(true);
    setStatusMsg({ type: "", text: "" });

    try {
      await changePasswordApi({ oldPassword, newPassword });
      setStatusMsg({ type: "success", text: "Password changed successfully!" });
      setTimeout(() => onClose(), 1500); // Close after success
    } catch (error) {
      setStatusMsg({ 
        type: "error", 
        text: error.response?.data?.message || "Failed to change password" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="global-pool-overlay">
      <div className="global-pool-content">
        <div className="pool-header">
          <h3>Change Password</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="step-container">
          
          {/* Current Password */}
          <div className="input-group">
            <label style={{color: '#9ca3af', fontSize: '12px', marginBottom: '8px', display:'block'}}>
              Current Password
            </label>
            <div className="password-wrapper">
              <input
                className="modal-search-input password-input"
                type={showOld ? "text" : "password"}
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <span className="eye-icon" onClick={() => setShowOld(!showOld)}>
                {showOld ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          {/* New Password */}
          <div className="input-group">
            <label style={{color: '#9ca3af', fontSize: '12px', marginBottom: '8px', display:'block'}}>
              New Password
            </label>
            <div className="password-wrapper">
              <input
                className="modal-search-input password-input"
                type={showNew ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <span className="eye-icon" onClick={() => setShowNew(!showNew)}>
                {showNew ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          {/* Feedback Message (Instead of Alert) */}
          {statusMsg.text && (
            <div className={`status-message ${statusMsg.type}`}>
              {statusMsg.text}
            </div>
          )}

          <div className="modal-actions">
            <button 
              className="create-btn" 
              onClick={handleSubmit} 
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;