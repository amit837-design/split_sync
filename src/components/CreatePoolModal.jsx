import React, { useState, useEffect } from "react";
import { createPoolApi } from "../api/pool.api";
import "./CreatePoolModal.css";

const CreatePoolModal = ({ isOpen, onClose, chat, currentUser, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [includeMe, setIncludeMe] = useState(true); // Default: Split equally including me
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setAmount("");
      setIncludeMe(true);
    }
  }, [isOpen]);

  if (!isOpen || !chat) return null;

  // --- LOGIC: WHO IS INVOLVED? ---
  // We filter OUT the current user to get the list of "Borrowers"
  const participantIds = chat.users
    .filter((u) => String(u._id || u.id) !== String(currentUser))
    .map((u) => u._id || u.id);

  // If includeMe is true, we divide by (Borrowers + Me). If false, just Borrowers.
  const groupSize = includeMe
    ? participantIds.length + 1
    : participantIds.length;

  // --- LOGIC: MATH PREVIEW ---
  const total = parseFloat(amount) || 0;
  
  // Prevent division by zero
  const perPerson = groupSize > 0 ? (total / groupSize).toFixed(2) : "0.00";
  
  // If I am included, I pay 'perPerson'. If not, I pay 0.
  const myShare = includeMe ? perPerson : "0.00";
  
  // Total - MyShare = What I am owed
  const othersOwe = (total - parseFloat(myShare)).toFixed(2);

  const handleSubmit = async () => {
    if (!title.trim() || !amount) return;

    setLoading(true);
    try {
      await createPoolApi({
        title,
        totalAmount: total,
        participantIds, // The backend needs the IDs of people who OWE money
        includeCreator: includeMe,
        chatId: chat._id,
        isGroupChat: chat.isGroupChat,
      });
      
      onSuccess(); // Callback to refresh messages
      onClose();
    } catch (error) {
      console.error("Failed to create pool", error);
      // Optional: Add toast notification here
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pool-modal-overlay">
      <div className="pool-modal-content">
        {/* Header */}
        <div className="pool-header">
          <h3>Create Expense</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Context Info */}
        <div className="pool-context">
          With:{" "}
          <span className="accent-text">
            {chat.isGroupChat 
              ? chat.chatName 
              : chat.users.find(u => String(u._id || u.id) !== String(currentUser))?.name}
          </span>
        </div>

        {/* Form Body */}
        <div className="pool-body">
          <div className="input-group">
            <label>Cause</label>
            <input
              type="text"
              placeholder="e.g. Dinner, Cab, Trip"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="input-group">
            <label>Amount ($)</label>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Split Toggle */}
          <div className="split-options">
            {/* Option 1: Split Equally (You pay part of it) */}
            <label className={`radio-label ${includeMe ? "active" : ""}`}>
              <input
                type="radio"
                checked={includeMe}
                onChange={() => setIncludeMe(true)}
              />
              <div className="radio-content">
                <span className="radio-title">Split Equally</span>
                <span className="radio-desc">You pay your share ({perPerson})</span>
              </div>
            </label>

            {/* Option 2: Full Amount (You paid for them) */}
            <label className={`radio-label ${!includeMe ? "active" : ""}`}>
              <input
                type="radio"
                checked={!includeMe}
                onChange={() => setIncludeMe(false)}
              />
              <div className="radio-content">
                <span className="radio-title">Full Amount</span>
                <span className="radio-desc">They owe everything</span>
              </div>
            </label>
          </div>

          {/* Math Summary */}
          {total > 0 && (
            <div className="pool-summary">
              <div className="summary-row">
                <span>Total Bill:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="summary-row highlight">
                <span>You Receive:</span>
                <span>${othersOwe}</span>
              </div>
              <div className="summary-sub">
                 From {participantIds.length} person(s)
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pool-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="create-btn" 
            onClick={handleSubmit}
            disabled={loading || !title || !amount}
          >
            {loading ? "Creating..." : "Request Payment →"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePoolModal;