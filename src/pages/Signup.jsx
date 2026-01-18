import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser } from "../api/auth.api";
import OTPModal from "../components/OTPModal";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import "./Signup.css";

const Signup = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("signup");

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState(null);

  const [showOTP, setShowOTP] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- NEW: Handle successful OTP Verification ---
  const handleOTPSuccess = (userData) => {
    // 1. Close Modal
    setShowOTP(false);

    // 2. Save Token & User Info (Just like Login)
    if (userData && userData.token) {
      localStorage.setItem("userInfo", JSON.stringify(userData));
      console.log("Signup + Verify Successful. Redirecting...");
      navigate("/app");
    } else {
      // If backend didn't send token on verify, force login
      setMode("login");
      setAuthMessage({ type: "success", text: "Verified! Please login now." });
    }
  };

  const handleAuth = async () => {
    if (loading) return;
    setAuthMessage(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        await registerUser({
          name: form.name,
          email: form.email.trim().toLowerCase(),
          password: form.password,
        });

        setShowOTP(true);
        setAuthMessage({ type: "success", text: "OTP sent to email" });
      } else {
        const response = await loginUser({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        });

        if (response.data.token) {
          localStorage.setItem("userInfo", JSON.stringify(response.data));
          navigate("/app");
        }
      }
    } catch (err) {
      console.error("Auth Error:", err);
      setAuthMessage({
        type: "error",
        text: err.response?.data?.message || "Authentication failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={showOTP ? "auth-container blur" : "auth-container"}>
      <div className="auth-card">
        <h1 className="auth-title">{mode === "signup" ? "Signup" : "Login"}</h1>

        {mode === "signup" && (
          <input
            id="name"
            name="name"
            className="auth-input"
            placeholder="Name"
            onChange={handleChange}
            disabled={loading}
          />
        )}

        <input
          id="email"
          name="email"
          className="auth-input"
          placeholder="Email"
          onChange={handleChange}
          disabled={loading}
        />

        <div className="password-wrapper">
          <input
            id="password"
            name="password"
            className="auth-input"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            onChange={handleChange}
            disabled={loading}
          />
          <span
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        {authMessage && (
          <p className={`auth-message ${authMessage.type}`}>
            {authMessage.text}
          </p>
        )}

        <button className="auth-btn" onClick={handleAuth} disabled={loading}>
          {loading ? "Processing..." : mode === "signup" ? "Signup" : "Login"}
        </button>

        <button
          className="auth-btn secondary"
          onClick={() => {
            setMode(mode === "signup" ? "login" : "signup");
            setForm({ name: "", email: "", password: "" });
            setAuthMessage(null);
          }}
          disabled={loading}
        >
          Switch to {mode === "signup" ? "Login" : "Signup"}
        </button>

        <button
          className="forgot-btn"
          onClick={() => setShowForgot(true)}
          disabled={loading}
        >
          Forgot your password?
        </button>
      </div>

      {showOTP && (
        <OTPModal
          email={form.email}
          closeModal={() => setShowOTP(false)}
          onSuccess={handleOTPSuccess} /* <--- PASSING THE HANDLER HERE */
        />
      )}

      {showForgot && (
        <ForgotPasswordModal closeModal={() => setShowForgot(false)} />
      )}
    </div>
  );
};

export default Signup;
