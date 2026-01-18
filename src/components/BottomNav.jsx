import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./BottomNav.css";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to check if a route is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="bottom-nav">
      {/* 1. Dashboard Tab */}
      <div
        className={`nav-item ${isActive("/app/dashboard") ? "active" : ""}`}
        onClick={() => navigate("/app/dashboard")}
      >
        <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
          {/* 4-Square Grid Icon */}
          <rect x="3" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="14" width="7" height="7" rx="2" />
          <rect x="3" y="14" width="7" height="7" rx="2" />
        </svg>
        <span className="nav-label">Dashboard</span>
      </div>

      {/* 2. Chat Tab (Main) */}
      <div
        className={`nav-item ${isActive("/app") ? "active" : ""}`}
        onClick={() => navigate("/app")}
      >
        <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
          {/* Chat Bubble Icon */}
          <path d="M12 2C6.48 2 2 6.03 2 11C2 13.68 3.39 16.09 5.6 17.7C5.3 18.7 4.7 19.6 4 20.4C5.5 20.6 7.5 20.1 9 19C10 19.6 11 20 12 20C17.52 20 22 15.97 22 11C22 6.03 17.52 2 12 2Z" />
        </svg>
        <span className="nav-label">Chat</span>
      </div>

      {/* 3. Settings Tab */}
      <div
        className={`nav-item ${isActive("/app/settings") ? "active" : ""}`}
        onClick={() => navigate("/app/settings")}
      >
        <svg
          className="nav-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          {/* Gear/Settings Icon */}
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        <span className="nav-label">Settings</span>
      </div>
    </div>
  );
};

export default BottomNav;
