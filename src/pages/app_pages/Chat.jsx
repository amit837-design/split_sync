import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { searchUsersApi } from "../../api/user.api";
import { accessChatApi, fetchChatsApi } from "../../api/chat.api";
import { useChat } from "../../context/ChatContext";

// Components
import GroupChatModal from "../../components/GroupChatModal";
import GlobalPoolModal from "../../components/GlobalPoolModal";

import "./Chat.css";

const Chat = () => {
  const navigate = useNavigate();
  const { setSelectedChat, chats, setChats } = useChat();

  const [nameQuery, setNameQuery] = useState("");
  const [emailQuery, setEmailQuery] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showGlobalPoolModal, setShowGlobalPoolModal] = useState(false);

  // Get User ID
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const myId = userInfo?.user?._id || userInfo?._id || userInfo?.user?.id || userInfo?.id;

  // 1. Standalone Load Function (So we can reuse it!)
  const loadChats = useCallback(async () => {
    try {
      const { data } = await fetchChatsApi();
      // Sort by latest update
      const sortedChats = data.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB - dateA;
      });
      setChats(sortedChats);
    } catch (error) {
      console.error("Inbox load failed", error);
    }
  }, [setChats]);

  // 2. Initial Load
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // 3. Search Logic
  useEffect(() => {
    const timer = setTimeout(() => handleSearch(), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [nameQuery, emailQuery]);

  const handleSearch = async () => {
    if (!nameQuery && !emailQuery) {
      setSearchResult([]);
      return;
    }
    try {
      setLoading(true);
      const q = nameQuery || emailQuery;
      const type = nameQuery ? "name" : "email";
      const { data } = await searchUsersApi({ q, type, page: 1, limit: 20 });
      setSearchResult(data.users || data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 4. Open Chat
  const openChat = async (userId, existingChat = null) => {
    if (existingChat) {
      setSelectedChat(existingChat);
      navigate(`/app/chat/${existingChat._id}`);
      return;
    }
    try {
      const { data } = await accessChatApi(userId);
      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }
      setSelectedChat(data);
      navigate(`/app/chat/${data._id}`);
    } catch (error) {
      console.error("Access failed", error);
    }
  };

  // 5. Helper: Get Sender Name/Avatar
  const getSenderInfo = (users) => {
    if (!users || !users.length) return { name: "Unknown", avatar: null };
    const otherUser = users.find((u) => String(u._id) !== String(myId));
    if (otherUser) return { name: otherUser.name, avatar: otherUser.avatar };
    return { name: "Message yourself", avatar: users[0]?.avatar, isSelf: true };
  };

  // 6. Handle Pool Creation Success
  const handlePoolSuccess = () => {
    setShowGlobalPoolModal(false);
    loadChats(); // 🔥 REFRESH CHATS to show the new pool message and update sorting
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="header-top">
          <h2 className="header-title">Chats</h2>
          <button className="icon-btn" onClick={() => setShowGroupModal(true)}>
            <svg className="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>

        <div className="header-actions">
          <input
            className="search-input"
            placeholder="Search Name..."
            value={nameQuery}
            onChange={(e) => {
              setNameQuery(e.target.value);
              setEmailQuery("");
            }}
          />
          <input
            className="search-input"
            placeholder="Search Email..."
            value={emailQuery}
            onChange={(e) => {
              setEmailQuery(e.target.value);
              setNameQuery("");
            }}
          />
          {/* Open Global Pool Modal */}
          <button className="new-chat-btn" onClick={() => setShowGlobalPoolModal(true)}>
            <svg className="icon-add" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </button>
        </div>
      </div>

      <div className="user-list">
        {/* VIEW A: Search Results */}
        {nameQuery || emailQuery ? (
          <>
            {loading && <p className="status-text">Searching...</p>}
            {searchResult.map((user) => {
              const isMe = String(user._id) === String(myId);
              return (
                <div key={user._id} className="user-card" onClick={() => openChat(user._id)}>
                  <div className="avatar-placeholder">
                    {user.avatar ? <img src={user.avatar} alt="u" /> : user.name[0]}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user.name} {isMe && "(You)"}</span>
                    <span className="user-email">{isMe ? "Message yourself" : "Click to chat"}</span>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          /* VIEW B: Inbox List */
          chats.map((chat) => {
            let chatName = "Chat";
            let chatAvatar = null;
            let subText = "No messages yet";
            let subTextClass = ""; // For specific styling (e.g., green for pools)

            // --- 1. Determine Chat Name/Avatar ---
            if (chat.isGroupChat) {
              chatName = chat.chatName;
              chatAvatar = chat.groupPic || "#";
            } else {
              const info = getSenderInfo(chat.users);
              chatName = info.name;
              chatAvatar = info.avatar || info.name?.[0];
            }

            // --- 2. Determine Message Preview (Including Pools) ---
            if (chat.latestMessage) {
              const senderName = chat.latestMessage.sender?._id === myId 
                ? "You" 
                : chat.latestMessage.sender?.name?.split(" ")[0] || "User";

              // 🔥 Check Message Type
              if (chat.latestMessage.type === "pool") {
                subText = `💸 ${senderName}: ${chat.latestMessage.content}`;
                subTextClass = "pool-text"; // Optional: Add CSS for color
              } else {
                subText = `${senderName}: ${chat.latestMessage.content}`;
              }
            }

            // Truncate
            const displayMsg = subText.length > 35 ? subText.substring(0, 35) + "..." : subText;

            return (
              <div key={chat._id} className="user-card" onClick={() => openChat(null, chat)}>
                <div className="avatar-placeholder">
                  {chatAvatar && chatAvatar.length > 1 && chatAvatar !== "#" ? (
                    <img src={chatAvatar} alt="av" />
                  ) : (
                    <span>{chatAvatar === "#" ? "👥" : chatAvatar}</span>
                  )}
                </div>
                <div className="user-info">
                  <div className="chat-row-top">
                    <span className="user-name">{chatName}</span>
                    {/* Optional: Add Time here if available */}
                  </div>
                  <div className={`user-email ${subTextClass}`}>
                    {displayMsg}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showGroupModal && (
        <GroupChatModal closeModal={() => setShowGroupModal(false)} />
      )}

      {/* 🔥 Pass onSuccess to update the list when a pool is created */}
      <GlobalPoolModal
        isOpen={showGlobalPoolModal}
        onClose={() => setShowGlobalPoolModal(false)}
        onSuccess={handlePoolSuccess} 
      />
    </div>
  );
};

export default Chat;