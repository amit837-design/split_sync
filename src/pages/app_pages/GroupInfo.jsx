import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { exitGroupApi, updateGroupDetailsApi } from "../../api/chat.api";
import { useChat } from "../../context/ChatContext";
import "./GroupInfo.css";

const GroupInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { chat: initialChat } = location.state || {};

  const [chat, setChat] = useState(initialChat);
  const { chats, setChats, setSelectedChat } = useChat();

  const [loading, setLoading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const fileInputRef = useRef(null);

  // --- 1. FIXED IDENTITY EXTRACTION ---
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");
  // Check all possible locations for the ID (backend sends .id, mongo uses ._id)
  const myId =
    userInfo?.user?._id || userInfo?.user?.id || userInfo?._id || userInfo?.id;

  useEffect(() => {
    if (!initialChat) navigate("/app");
    else {
      setChat(initialChat);
      setEditedName(initialChat.chatName);
    }
  }, [initialChat, navigate]);

  if (!chat) return null;

  const { chatName, users, groupAdmin, _id: chatId, groupPic } = chat;
  const isAdmin = groupAdmin?._id === myId || groupAdmin === myId;

  // --- 2. FIXED DUPLICATE KEY ISSUE ---
  // Ensure we only render unique users, even if DB has duplicates
  const uniqueUsers = users?.filter(
    (user, index, self) => index === self.findIndex((t) => t._id === user._id)
  );

  // --- EXIT LOGIC ---
  const handleExitGroup = async () => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;

    // Debugging: Ensure IDs exist before calling API
    if (!chatId || !myId) {
      alert("Error: Missing User ID or Chat ID");
      console.error("Missing IDs:", { chatId, myId });
      return;
    }

    setLoading(true);
    try {
      await exitGroupApi(chatId, myId);

      const updatedChats = chats.filter((c) => c._id !== chatId);
      setChats(updatedChats);
      setSelectedChat(null);
      navigate("/app");
    } catch (error) {
      console.error("Exit failed:", error.response?.data || error.message);
      alert("Error exiting group");
    } finally {
      setLoading(false);
    }
  };

  // --- IMAGE UPLOAD LOGIC ---
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setChat((prev) => ({ ...prev, groupPic: previewUrl }));

    const formData = new FormData();
    formData.append("chatId", chatId);
    formData.append("groupPic", file);

    try {
      const { data } = await updateGroupDetailsApi(formData);
      setChat(data);
      updateGlobalContext(data);
    } catch (error) {
      console.error("Image upload failed", error);
      alert("Failed to update image");
      setChat(initialChat);
    }
  };

  // --- RENAME LOGIC ---
  const handleRename = async () => {
    if (!editedName.trim() || editedName === chatName) {
      setIsEditingName(false);
      return;
    }

    const formData = new FormData();
    formData.append("chatId", chatId);
    formData.append("chatName", editedName);

    try {
      const { data } = await updateGroupDetailsApi(formData);
      setChat(data);
      updateGlobalContext(data);
    } catch (error) {
      console.error(error);
      alert("Rename failed");
    } finally {
      setIsEditingName(false);
    }
  };

  const updateGlobalContext = (updatedChat) => {
    const newChats = chats.map((c) =>
      c._id === updatedChat._id ? updatedChat : c
    );
    setChats(newChats);
    setSelectedChat(updatedChat);
  };

  return (
    <div className="group-info-container">
      <div className="info-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ←
        </button>
        <div className="header-title">Group Info</div>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="info-content">
        {/* Profile Card */}
        <div className="group-profile-card">
          <div
            className={`group-avatar-large ${isAdmin ? "editable" : ""}`}
            onClick={() => isAdmin && fileInputRef.current.click()}
          >
            {groupPic ? (
              <img src={groupPic} alt="Group" className="group-img-cover" />
            ) : (
              <span>{chatName?.[0]?.toUpperCase()}</span>
            )}

            {isAdmin && (
              <div className="avatar-overlay">
                <span>📷</span>
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            )}
          </div>

          <div className="name-container">
            {isEditingName ? (
              <input
                className="edit-group-input"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => e.key === "Enter" && handleRename()}
                autoFocus
              />
            ) : (
              <h2
                className="group-name-large"
                onClick={() => isAdmin && setIsEditingName(true)}
              >
                {chatName}
                {isAdmin && <span className="edit-pencil-icon">✎</span>}
              </h2>
            )}
          </div>

          <p className="group-meta">
            Group • {uniqueUsers?.length} participants
          </p>
        </div>

        {/* Participants List (Using uniqueUsers) */}
        <div className="section-label">Participants</div>
        <div className="participants-list">
          {uniqueUsers?.map((user) => {
            const isGroupAdmin =
              groupAdmin?._id === user._id || groupAdmin === user._id;

            // Safety check for user object
            if (!user || !user._id) return null;

            return (
              <div key={user._id} className="participant-item">
                <div className="participant-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt="u" />
                  ) : (
                    user.name?.[0] || "?"
                  )}
                </div>
                <div className="participant-details">
                  <div className="participant-name-row">
                    <span className="participant-name">
                      {user.name || "Unknown User"}
                    </span>
                    {isGroupAdmin && <span className="admin-badge">Admin</span>}
                  </div>
                  <span className="participant-email">{user.email}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="group-actions">
          <button
            className="exit-group-btn"
            onClick={handleExitGroup}
            disabled={loading}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            {loading ? "Leaving..." : "Exit Group"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupInfo;
