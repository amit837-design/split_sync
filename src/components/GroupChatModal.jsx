import React, { useState, useEffect, useRef } from "react";
import { searchUsersApi } from "../api/user.api";
import { createGroupChatApi } from "../api/chat.api";
import { useChat } from "../context/ChatContext";
import "./GroupChatModal.css";

const GroupChatModal = ({ closeModal }) => {
  const [groupName, setGroupName] = useState("");
  const [groupImg, setGroupImg] = useState(null); // Store the actual File object
  const [previewImg, setPreviewImg] = useState(null); // Store the URL for preview

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { chats, setChats, setSelectedChat } = useChat();
  const fileInputRef = useRef(null); // Reference to hidden file input

  // --- 1. Debounced Search ---
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        executeSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [searchQuery]);

  const executeSearch = async () => {
    try {
      setLoading(true);
      const type = searchQuery.includes("@") ? "email" : "name";
      const payload = { q: searchQuery, type, page: 1, limit: 10 };
      const { data } = await searchUsersApi(payload);
      setSearchResults(data.users || data || []);
    } catch (error) {
      console.error("Group search failed", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Image Handling ---
  const handleImageClick = () => {
    fileInputRef.current.click(); // Trigger the hidden input
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupImg(file);
      // Create a temporary URL to show the image immediately
      setPreviewImg(URL.createObjectURL(file));
    }
  };

  // --- 3. Toggle User Logic ---
  const toggleUser = (user) => {
    const exists = selectedUsers.find((u) => u._id === user._id);
    if (exists) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // --- 4. Create Group Logic (Now with FormData) ---
  const handleSubmit = async () => {
    if (!groupName || selectedUsers.length < 2) {
      alert("Please enter a Group Name and add at least 2 friends.");
      return;
    }

    setSubmitting(true);

    try {
      // 🟢 CHANGE: Use FormData to send text + file together
      const formData = new FormData();
      formData.append("name", groupName);
      formData.append("users", JSON.stringify(selectedUsers.map((u) => u._id)));

      if (groupImg) {
        formData.append("groupPic", groupImg); // Make sure backend expects 'groupPic'
      }

      const { data } = await createGroupChatApi(formData);

      setChats([data, ...chats]);
      setSelectedChat(data);
      closeModal();
    } catch (error) {
      console.error("Create group failed", error);
      alert("Failed to create group. Check console.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <h3>New Group</h3>
          <button className="close-btn" onClick={closeModal}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* A. Group Name & Image Input */}
          <div className="group-name-section">
            {/* Clickable Image Placeholder */}
            <div
              className="group-icon-placeholder clickable"
              onClick={handleImageClick}
              title="Upload Group Icon"
            >
              {previewImg ? (
                <img
                  src={previewImg}
                  alt="Preview"
                  className="group-icon-preview"
                />
              ) : (
                <span>📷</span>
              )}
              {/* Hidden Input */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <input
              className="modal-input name-input"
              placeholder="Group Subject"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              autoFocus
            />
          </div>

          {/* B. Search Input */}
          <div className="search-section">
            <input
              className="modal-input search-bar"
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* C. Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="selected-chips-area">
              {selectedUsers.map((u) => (
                <div
                  key={u._id}
                  className="user-chip"
                  onClick={() => toggleUser(u)}
                >
                  <div className="chip-avatar">
                    {u.avatar ? <img src={u.avatar} alt="av" /> : u.name[0]}
                  </div>
                  <span className="chip-name">{u.name.split(" ")[0]}</span>
                  <div className="chip-remove">✕</div>
                </div>
              ))}
            </div>
          )}

          {/* D. Search Results */}
          <div className="results-list">
            {loading && <div className="status-text">Searching...</div>}

            {!loading &&
              searchResults.map((user) => {
                const isSelected = selectedUsers.some(
                  (u) => u._id === user._id
                );
                return (
                  <div
                    key={user._id}
                    className="result-item"
                    onClick={() => toggleUser(user)}
                  >
                    <div className="result-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt="u" />
                      ) : (
                        user.name[0]
                      )}
                    </div>
                    <div className="result-info">
                      <span className="result-name">{user.name}</span>
                      <span className="result-email">{user.email}</span>
                    </div>
                    <button
                      className={`add-user-btn ${isSelected ? "added" : ""}`}
                    >
                      {isSelected ? (
                        <span className="check-icon">✓</span>
                      ) : (
                        <span className="plus-icon">+</span>
                      )}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            className="create-btn"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? "Creating..."
              : `Create Group (${selectedUsers.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChatModal;
