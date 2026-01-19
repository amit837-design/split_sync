import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  requestPasswordReset,
  verifyResetOTP,
  resetPassword,
} from "../api/auth.api";
import "./OTPModal.css";

const ForgotPasswordModal = ({ closeModal }) => {
  const navigate = useNavigate();

  const [popup, setPopup] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // NEW: We need to store the token received from the backend in Step 2
  const [resetToken, setResetToken] = useState(null);

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const closeWithAnimation = (nextPopup = null) => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setMessage(null);
      if (nextPopup) setPopup(nextPopup);
      else closeModal();
    }, 300);
  };

  /* ---------------- STEP 1: REQUEST OTP ---------------- */
  const handleVerifyEmail = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setMessage({ type: "error", text: "Please enter your email" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await requestPasswordReset(cleanEmail);
      setIsLoading(false);
      closeWithAnimation("otp");
    } catch (err) {
      setIsLoading(false);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Email not found",
      });
    }
  };

  /* ---------------- STEP 2: VERIFY OTP ---------------- */
  const handleVerifyOTP = async () => {
    if (!otp) {
      setMessage({ type: "error", text: "Please enter the code" });
      return;
    }
    setIsLoading(true);
    setMessage(null);
    try {
      // 1. Call API
      const response = await verifyResetOTP({ email: email.trim(), otp });

      // 2. CRITICAL: Capture the resetToken sent by the backend
      const token = response.data.resetToken;
      setResetToken(token);

      setIsLoading(false);
      closeWithAnimation("reset");
    } catch (err) {
      setIsLoading(false);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Invalid Code",
      });
    }
  };

  /* ---------------- STEP 3: RESET PASSWORD ---------------- */
  const handleResetPassword = async () => {
    if (!password) {
      setMessage({ type: "error", text: "Please enter a new password" });
      return;
    }
    
    // Check if we actually have the token from Step 2
    if (!resetToken) {
        setMessage({ type: "error", text: "Session expired. Please start over." });
        return;
    }

    setIsLoading(true);
    setMessage(null);
    try {
      await resetPassword({ 
          resetToken: resetToken, 
          newPassword: password 
      });
      
      setIsLoading(false);
      navigate("/");
      closeModal();
    } catch (err) {
      setIsLoading(false);
      console.error("Reset Error:", err.response);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Reset failed",
      });
    }
  };

  return (
    <div className={`otp-backdrop ${isClosing ? "closing" : ""}`}>
      <div className={`otp-modal ${isClosing ? "closing" : ""}`}>
        <div className="modal-handle" />

        {/*POPUP 1: EMAIL*/}
        {popup === "email" && (
          <>
            <h3>Forgot Password</h3>
            <p className="modal-sub">Enter your email to verify account</p>
            <input
              className="otp-input"
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {message && <p className={`otp-message ${message.type}`}>{message.text}</p>}
            <div className="otp-actions">
              <button className="otp-btn primary" onClick={handleVerifyEmail} disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Code"}
              </button>
              <button className="otp-btn secondary" onClick={() => closeWithAnimation()}>Cancel</button>
            </div>
          </>
        )}

        {/*POPUP 2: OTP*/}
        {popup === "otp" && (
          <>
            <h3>Enter Code</h3>
            <p className="modal-sub">Code sent to {email}</p>
            <input
              className="otp-input"
              placeholder="000000"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            {message && <p className={`otp-message ${message.type}`}>{message.text}</p>}
            <div className="otp-actions">
              <button className="otp-btn primary" onClick={handleVerifyOTP} disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify Code"}
              </button>
              <button className="otp-btn secondary" onClick={() => closeWithAnimation()}>Cancel</button>
            </div>
          </>
        )}

        {/*POPUP 3: RESET*/}
        {popup === "reset" && (
          <>
            <h3>Reset Password</h3>
            <p className="modal-sub">Create your new password</p>
            <div className="password-wrapper">
              <input
                className="auth-input"
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
            {message && <p className={`otp-message ${message.type}`}>{message.text}</p>}
            <div className="otp-actions">
              <button className="otp-btn primary" onClick={handleResetPassword} disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
              <button className="otp-btn secondary" onClick={() => closeWithAnimation()}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;