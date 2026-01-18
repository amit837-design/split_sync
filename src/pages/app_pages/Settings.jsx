import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import "./Settings.css";

const Settings = () => {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useTheme();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [activeSupportIndex, setActiveSupportIndex] = useState(null); // Tracks which dropdown is open
  const [copied, setCopied] = useState(false); // Feedback for copy action

  // Safely get user info
  const [userInfo] = useState(() => {
    const data = JSON.parse(localStorage.getItem("userInfo") || "{}");
    return data.user || data || {};
  });

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const toggleSupport = (index) => {
    setActiveSupportIndex(activeSupportIndex === index ? null : index);
    setCopied(false); // Reset copy status when switching
  };

  const copyEmail = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText("splitsync.noreply@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
      </div>

      <div className="settings-content">
        {/* 1. ACCOUNT */}
        <div className="settings-section">
          <h3 className="section-title">Account</h3>
          <div className="setting-profile-card">
            <div className="setting-profile-avatar">
              {userInfo.avatar ? (
                <img src={userInfo.avatar} alt="me" />
              ) : (
                userInfo.name?.[0]
              )}
            </div>
            <div className="setting-profile-info">
              <span className="setting-profile-name">{userInfo.name}</span>
              <span className="setting-profile-email">{userInfo.email}</span>
            </div>
            <button
              className="edit-btn-small"
              onClick={() => navigate("/app/settings/account")}
            >
              Edit
            </button>
          </div>
        </div>

        {/* 2. PREFERENCES */}
        <div className="settings-section">
          <h3 className="section-title">Preferences</h3>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Dark Mode</span>
              <span className="setting-desc">
                Use dark theme across the app
              </span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        {/* 3. SECURITY */}
        <div className="settings-section">
          <h3 className="section-title">Security</h3>
          <div
            className="setting-item clickable"
            onClick={() => setShowPasswordModal(true)}
          >
            <span className="setting-label">Change Password</span>
            <span className="arrow-icon">›</span>
          </div>
        </div>

        {/* 4. SUPPORT (Dropdowns) */}
        <div className="settings-section">
          <h3 className="section-title">Support</h3>

          {/* Help Center */}
          <div className="accordion-wrapper">
            <div
              className="setting-item clickable"
              onClick={() => toggleSupport(1)}
            >
              <span className="setting-label">Help Center</span>
              <span
                className={`arrow-icon ${activeSupportIndex === 1 ? "rotated" : ""}`}
              >
                ›
              </span>
            </div>
            {activeSupportIndex === 1 && (
              <div className="accordion-content">
                <p>
                  Need help navigating the app? Check our FAQ or contact our
                  support team directly.
                </p>
                <div className="email-box">
                  <span>support@yourapp.com</span>
                  <button
                    className="copy-btn"
                    onClick={copyEmail}
                    title="Copy Email"
                  >
                    {copied ? "✓" : "❐"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Report Bug */}
          <div className="accordion-wrapper">
            <div
              className="setting-item clickable"
              onClick={() => toggleSupport(2)}
            >
              <span className="setting-label">Report a Bug</span>
              <span
                className={`arrow-icon ${activeSupportIndex === 2 ? "rotated" : ""}`}
              >
                ›
              </span>
            </div>
            {activeSupportIndex === 2 && (
              <div className="accordion-content">
                <p>
                  Found something weird? Let us know! Please include screenshots
                  if possible.
                </p>
                <div className="email-box">
                  <span>bugs@yourapp.com</span>
                  <button
                    className="copy-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText("bugs@yourapp.com");
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? "✓" : "❐"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5. LOGOUT */}
        <div className="logout-section">
          <button className="logout-btn" onClick={handleLogout}>
            Log Out
          </button>
          <div className="app-version">Version 1.0.0</div>
        </div>
      </div>

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
};

export default Settings;
