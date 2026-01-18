import React, { useState } from "react";
import { updatePoolStatusApi } from "../api/pool.api";
import "./PoolBubble.css";

const PoolBubble = ({ message, isMe, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  
  // 1. Safety Check: Ensure pool data is populated
  const pool = message.poolId;
  if (!pool || typeof pool !== 'object') {
      return <div className="message-bubble">{message.content}</div>;
  }

  const status = pool.status; // pending, verification_pending, settled, cancelled
  
  // 2. Identity Check (Safe Helper)
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  
  // Helper to handle both populated objects or string IDs
  const getEntityId = (entity) => {
    if (!entity) return null;
    return typeof entity === 'object' ? (entity._id || entity.id) : entity;
  };

  const myId = getEntityId(userInfo?.user || userInfo);
  const creatorId = getEntityId(pool.creator);
  const borrowerId = getEntityId(pool.borrower);

  const isCreator = String(creatorId) === String(myId);
  const isBorrower = String(borrowerId) === String(myId);

  // 3. Handler
  const handleAction = async (action) => {
    if (loading) return;
    setLoading(true);
    try {
      await updatePoolStatusApi({
        poolId: pool._id,
        action: action 
      });
      if (onUpdate) onUpdate(); 
    } catch (error) {
      console.error("Action failed", error);
      alert("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  // 4. Visual Helpers
  const getStatusInfo = () => {
    switch(status) {
      case "settled": return { icon: "✅", text: "Paid & Settled", class: "settled" };
      case "verification_pending": return { icon: "⏳", text: "Payment Verifying...", class: "verifying" };
      case "cancelled": return { icon: "🚫", text: "Cancelled", class: "cancelled" };
      default: return { icon: "💸", text: "Payment Pending", class: "pending" };
    }
  };

  const { icon, text, class: statusClass } = getStatusInfo();

  // 5. Split Logic Text
  // If creatorIncluded is true -> "Split Equally", else -> "Full Amount"
  const splitText = pool.creatorIncluded ? "Split Equally" : "Full Amount";

  return (
    <div className={`pool-card ${statusClass}`}>
      {/* HEADER */}
      <div className="pool-card-header">
        <div className="pool-icon-box">{icon}</div>
        <div className="pool-info">
          <span className="pool-title">{pool.title}</span>
          <div className="pool-sub-info">
             <span className="pool-amount">${pool.amountOwed}</span>
             {/* 🔥 The Split Badge */}
             <span className="pool-split-type">{splitText}</span>
          </div>
        </div>
      </div>

      {/* STATUS TEXT */}
      <div className="pool-status-text">{text}</div>

      {/* ACTIONS FOOTER */}
      <div className="pool-actions">
        
        {/* --- STATE: PENDING --- */}
        {status === "pending" && (
          <>
            {/* If I am Creator: I can Cancel */}
            {isCreator && (
              <button 
                className="action-btn cancel-btn" 
                onClick={() => handleAction("cancel")}
                disabled={loading}
              >
                Cancel
              </button>
            )}

            {/* If I am Borrower: I can Mark as Paid */}
            {isBorrower && (
              <button 
                className="action-btn pay-btn" 
                onClick={() => handleAction("mark_paid")}
                disabled={loading}
              >
                {loading ? "..." : "Mark as Paid"}
              </button>
            )}
          </>
        )}

        {/* --- STATE: VERIFICATION PENDING --- */}
        {status === "verification_pending" && (
          <>
            {/* If I am Creator: I can Reject or Confirm */}
            {isCreator ? (
              <>
                 <button 
                  className="action-btn reject-btn" 
                  onClick={() => handleAction("reject")}
                  disabled={loading}
                  title="Reject Claim"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <button 
                  className="action-btn confirm-btn" 
                  onClick={() => handleAction("confirm")}
                  disabled={loading}
                >
                  Confirm
                </button>
              </>
            ) : (
              // If I am Borrower: Just wait
              <div className="waiting-text">Waiting for confirmation...</div>
            )}
          </>
        )}
        
        {/* --- STATE: SETTLED / CANCELLED --- */}
        {(status === "settled" || status === "cancelled") && (
            <div className="settled-badge">
                {status === "settled" ? "Transaction Complete" : "Request Cancelled"}
            </div>
        )}

      </div>
    </div>
  );
};

export default PoolBubble;