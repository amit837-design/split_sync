import React, { useState } from "react";
import { verifyOTP, resendOTP } from "../api/auth.api";
// Removed useNavigate because navigation is now handled by the parent (Signup.jsx)
import "./OTPModal.css";

const OTPModal = ({ email, closeModal, onSuccess }) => {
  // <--- Added onSuccess prop
  const [otp, setOtp] = useState("");
  const [otpMessage, setOtpMessage] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [successData, setSuccessData] = useState(null); // Store data to pass later

  const triggerClose = () => {
    setIsClosing(true);
  };

  const handleVerify = async () => {
    setOtpMessage(null);

    try {
      const response = await verifyOTP({ email, otp });

      setOtpMessage({
        type: "success",
        text: "Verified!",
      });

      // Save the response data (token/user) to state
      setSuccessData(response.data);

      // Wait for UI success message, then start closing animation
      setTimeout(() => {
        setIsClosing(true);
      }, 800);
    } catch (err) {
      setOtpMessage({
        type: "error",
        text: err.response?.data?.message || "Invalid OTP",
      });
    }
  };

  const handleResend = async () => {
    setOtpMessage(null);
    try {
      await resendOTP(email);
      setOtpMessage({ type: "info", text: "Code resent" });
    } catch {
      setOtpMessage({ type: "error", text: "Failed to resend" });
    }
  };

  const onAnimationEnd = () => {
    if (isClosing) {
      // If we have success data, pass it to the parent before closing
      if (successData && onSuccess) {
        onSuccess(successData);
      }
      closeModal();
    }
  };

  return (
    <div className={`otp-backdrop ${isClosing ? "closing" : ""}`}>
      <div
        className={`otp-modal ${isClosing ? "closing" : ""}`}
        onAnimationEnd={onAnimationEnd}
      >
        <div className="modal-handle"></div>

        <h3>Email Verification</h3>
        <p className="modal-sub">Sent to {email}</p>

        <input
          className="otp-input"
          placeholder="000000"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
        />

        {otpMessage && (
          <p className={`otp-message ${otpMessage.type}`}>{otpMessage.text}</p>
        )}

        <div className="otp-actions">
          <button className="otp-btn primary" onClick={handleVerify}>
            Verify
          </button>

          <button className="otp-btn secondary" onClick={triggerClose}>
            Cancel
          </button>
        </div>

        <button className="resend-link" onClick={handleResend}>
          Resend Code
        </button>
      </div>
    </div>
  );
};

export default OTPModal;
