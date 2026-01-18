import React, { useState, useEffect } from "react";
import { searchUsersApi } from "../api/user.api";
import { createPoolApi } from "../api/pool.api";
import "./GlobalPoolModal.css";

const GlobalPoolModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: Search, 2: Details
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Transaction Details
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [includeMe, setIncludeMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSearchQuery("");
      setSearchResults([]);
      setSelectedUsers([]);
      setTitle("");
      setAmount("");
      setIncludeMe(true);
    }
  }, [isOpen]);

  // --- STEP 1: SEARCH LOGIC ---
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) performSearch();
      else setSearchResults([]);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async () => {
    setLoadingSearch(true);
    try {
      const { data } = await searchUsersApi({
        q: searchQuery,
        page: 1,
        limit: 10,
      });
      const results = (data.users || data).filter(
        (u) => !selectedUsers.find((sel) => sel._id === u._id)
      );
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoadingSearch(false);
    }
  };

  const toggleUser = (user) => {
    setSelectedUsers([...selectedUsers, user]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userId));
  };

  // --- STEP 2: SUBMIT LOGIC ---
  const handleSubmit = async () => {
    if (!title || !amount || selectedUsers.length === 0) return;

    setSubmitting(true);
    try {
      await createPoolApi({
        title,
        totalAmount: parseFloat(amount),
        participantIds: selectedUsers.map((u) => u._id),
        includeCreator: includeMe,
        isGroupChat: false,
      });
      onClose();
    } catch (error) {
      console.error("Create pool failed", error);
      alert("Failed to create request.");
    } finally {
      setSubmitting(false);
    }
  };

  // Math Preview
  const total = parseFloat(amount) || 0;
  const groupSize = includeMe ? selectedUsers.length + 1 : selectedUsers.length;
  const perPerson = groupSize > 0 ? (total / groupSize).toFixed(2) : "0.00";
  const myShare = includeMe ? perPerson : "0.00";
  const othersOwe = (total - parseFloat(myShare)).toFixed(2);

  if (!isOpen) return null;

  return (
    <div className="global-pool-overlay">
      <div className="global-pool-content">
        <div className="pool-header">
          <h3>{step === 1 ? "Select Friends" : "Expense Details"}</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* --- STEP 1: SELECT USERS --- */}
        {step === 1 && (
          <div className="step-container">
            <input
              className="modal-search-input"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />

            <div className="selected-chips">
              {selectedUsers.map((u) => (
                <div key={u._id} className="user-chip">
                  <span>{u.name}</span>
                  <button onClick={() => removeUser(u._id)}>×</button>
                </div>
              ))}
            </div>

            <div className="modal-user-list">
              {loadingSearch && <p className="status-text">Searching...</p>}
              {!loadingSearch &&
                searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="modal-user-row"
                    onClick={() => toggleUser(user)}
                  >
                    <div className="row-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt="av" />
                      ) : (
                        user.name[0]
                      )}
                    </div>
                    <div className="row-info">
                      <span className="row-name">{user.name}</span>
                      <span className="row-email">{user.email}</span>
                    </div>
                    <div className="row-action">+</div>
                  </div>
                ))}
              {searchResults.length === 0 && searchQuery && !loadingSearch && (
                <p className="status-text">No users found</p>
              )}
            </div>

            <button
              className="next-btn"
              disabled={selectedUsers.length === 0}
              onClick={() => setStep(2)}
            >
              Next ({selectedUsers.length}) →
            </button>
          </div>
        )}

        {/* --- STEP 2: DETAILS & SUBMIT --- */}
        {step === 2 && (
          <div className="step-container">
            <div className="context-bar">
              Requesting from:{" "}
              <span className="highlight-text">
                {selectedUsers.length} people
              </span>
            </div>

            <div className="input-group">
              <label>Cause</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Weekend Trip, Pizza"
                autoFocus
              />
            </div>

            <div className="input-group">
              <label>Total Amount ($)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="split-options">
              <label className={`radio-label ${includeMe ? "active" : ""}`}>
                <input
                  type="radio"
                  checked={includeMe}
                  onChange={() => setIncludeMe(true)}
                />
                <div className="radio-content">
                  <span className="radio-title">Split Equally</span>
                  <span className="radio-desc">
                    Include me (Share: ${perPerson})
                  </span>
                </div>
              </label>
              <label className={`radio-label ${!includeMe ? "active" : ""}`}>
                <input
                  type="radio"
                  checked={!includeMe}
                  onChange={() => setIncludeMe(false)}
                />
                <div className="radio-content">
                  <span className="radio-title">Full Amount</span>
                  <span className="radio-desc">I paid for them only</span>
                </div>
              </label>
            </div>

            {/* Summary */}
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
              </div>
            )}

            {/* 🔥 THE MISSING BUTTONS 🔥 */}
            <div className="modal-actions">
              <button className="back-btn-step" onClick={() => setStep(1)}>
                ← Back
              </button>

              <button
                className="create-btn"
                disabled={submitting || !amount || !title}
                onClick={handleSubmit}
              >
                {submitting ? "Processing..." : "Request Payment"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalPoolModal;
