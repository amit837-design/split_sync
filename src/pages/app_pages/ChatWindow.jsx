import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChat } from "../../context/ChatContext";
import { fetchMessagesApi, sendMessageApi } from "../../api/message.api";
import { fetchChatsApi } from "../../api/chat.api";

// Make sure these paths match where you saved the files!
import CreatePoolModal from "../../components/CreatePoolModal";
import PoolBubble from "../../components/PoolBubble";

import "./ChatWindow.css";

const ChatWindow = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const {
    selectedChat,
    setSelectedChat,
    messages,
    setMessages,
    loadingMessages,
    setLoadingMessages,
  } = useChat();

  const [newMessage, setNewMessage] = useState("");
  const [activeMsgId, setActiveMsgId] = useState(null);
  const [showPoolModal, setShowPoolModal] = useState(false);

  const scrollRef = useRef();
  const isFirstLoad = useRef(true);

  // --- 1. IDENTITY & LOCAL STORAGE LOGIC ---
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");
  const myId =
    userInfo?.user?._id || userInfo?._id || userInfo?.user?.id || userInfo?.id;

  // 🔥 OWNERSHIP CHECK 🔥
  const isMyMessage = (msg) => {
    if (!msg || !msg.sender || !myId) return false;
    const senderId =
      typeof msg.sender === "object"
        ? msg.sender._id || msg.sender.id
        : msg.sender;
    return String(senderId) === String(myId);
  };

  // --- 2. HELPER: FIND CHAT PARTNER ---
  const getOtherUser = () => {
    if (!selectedChat || !selectedChat.users) return null;
    if (selectedChat.isGroupChat) return null;
    const other = selectedChat.users.find(
      (u) => String(u._id || u.id) !== String(myId)
    );
    return (
      other ||
      selectedChat.users.find((u) => String(u._id || u.id) === String(myId))
    );
  };

  // --- 3. LOAD CHAT DETAILS ---
  useEffect(() => {
    if (chatId && (!selectedChat || selectedChat._id !== chatId)) {
      (async () => {
        try {
          const { data } = await fetchChatsApi();
          const chat = data.find((c) => c._id === chatId);
          if (chat) {
            setSelectedChat(chat);
          } else {
            navigate("/app");
          }
        } catch (e) {
          console.error("Failed to load chat context", e);
        }
      })();
    }
  }, [chatId, selectedChat, setSelectedChat, navigate]);

  // --- 4. FETCH MESSAGES ---

  const refreshMessages = async () => {
    if (!chatId) return;
    try {
      const { data } = await fetchMessagesApi(chatId);
      setMessages(data);
    } catch (err) {
      console.error("Message refresh failed", err);
    }
  };

  useEffect(() => {
    if (!chatId) return;
    setMessages([]);
    setLoadingMessages(true);
    fetchMessagesApi(chatId)
      .then(({ data }) => setMessages(data))
      .catch((err) => console.error("Message fetch failed", err))
      .finally(() => setLoadingMessages(false));
  }, [chatId, setMessages, setLoadingMessages]);

  // --- 5. SCROLL ---
  useEffect(() => {
    if (messages.length > 0) {
      const behavior = isFirstLoad.current ? "auto" : "smooth";
      scrollRef.current?.scrollIntoView({ behavior });
      isFirstLoad.current = false;
    }
  }, [messages]);

  useEffect(() => {
    isFirstLoad.current = true;
  }, [chatId]);

  // --- HANDLERS ---
  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      const { data } = await sendMessageApi({ chatId, content: newMessage });
      setMessages((prev) => [...prev, data]);
      setNewMessage("");
    } catch (e) {
      console.error("Send failed", e);
    }
  };

  const handleInfoClick = () => {
    const userToDisplay = getOtherUser();
    if (selectedChat?.isGroupChat) {
      navigate("/app/group-info", { state: { chat: selectedChat } });
    } else if (userToDisplay) {
      navigate("/app/user-info", { state: { user: userToDisplay } });
    }
  };

  const handleMoneyClick = () => {
    setShowPoolModal(true);
  };

  const getChatName = () => {
    const other = getOtherUser();
    if (other) return other.name;
    return selectedChat?.chatName || "Chat";
  };

  const otherUser = getOtherUser();
  const isSelfChat = otherUser && String(otherUser._id) === String(myId);

  return (
    <div className="chat-window">
      {/* HEADER */}
      <div className="chat-window-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate("/app")}>
            ←
          </button>
          <div className="chat-title">{getChatName()}</div>
        </div>

        <button
          className="info-btn"
          onClick={handleInfoClick}
          title="View Info"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="icon-info"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </button>
      </div>

      {/* MESSAGES */}
      <div className="messages-container" onClick={() => setActiveMsgId(null)}>
        {loadingMessages && <div className="loading-spinner">Loading...</div>}
        {!loadingMessages &&
          messages.map((m) => {
            const isMe = isMyMessage(m);
            const isPool = m.type === "pool" && m.poolId;

            return (
              <div
                key={m._id}
                className={`message-wrapper ${isMe ? "sent" : "received"}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMsgId(activeMsgId === m._id ? null : m._id);
                }}
              >
                {selectedChat?.isGroupChat && !isMe && (
                  <span className="msg-sender-name">
                    {m.sender?.name || "Unknown"}
                  </span>
                )}

                {/* CONTENT */}
                {isPool ? (
                  <PoolBubble
                    message={m}
                    isMe={isMe}
                    onUpdate={refreshMessages}
                  />
                ) : (
                  <div className="message-bubble">{m.content}</div>
                )}

                {/* 🔥 TIMESTAMP (Updated to show Date + Time) 🔥 */}
                <div
                  className={`message-time ${
                    activeMsgId === m._id ? "show" : ""
                  }`}
                >
                  {new Date(m.createdAt).toLocaleString([], {
                    month: "short", // "Jan"
                    day: "numeric", // "14"
                    hour: "2-digit", // "10"
                    minute: "2-digit", // "30 PM"
                  })}
                </div>
              </div>
            );
          })}
        <div ref={scrollRef} />
      </div>

      {/* INPUT */}
      <div className="chat-input-area">
        {!isSelfChat && (
          <button className="attach-btn" onClick={handleMoneyClick}>
            <svg
              className="icon-add"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </button>
        )}
        <input
          className="msg-input"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
        />
        <button className="send-btn" onClick={handleSend}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="icon-send"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>

      {/* CREATE POOL MODAL */}
      <CreatePoolModal
        isOpen={showPoolModal}
        onClose={() => setShowPoolModal(false)}
        chat={selectedChat}
        currentUser={myId}
        onSuccess={refreshMessages}
      />
    </div>
  );
};

export default ChatWindow;
