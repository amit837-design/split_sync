import React, { useMemo, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useChat } from "../../context/ChatContext";
import { getFriendBalanceApi } from "../../api/pool.api";
import "./UserProfile.css";

const UserProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { chats } = useChat();

  const user = location.state?.user;
  
  // State for Financial Balance
  const [balanceData, setBalanceData] = useState({ netBalance: 0, loading: true });

  // 1. Fetch Balance on Mount
  useEffect(() => {
    const fetchBalance = async () => {
      if (user?._id) {
        try {
          const { data } = await getFriendBalanceApi(user._id);
          setBalanceData({ ...data, loading: false });
        } catch (error) {
          console.error("Failed to fetch friend balance", error);
          setBalanceData({ netBalance: 0, loading: false });
        }
      }
    };
    fetchBalance();
  }, [user]);

  // 2. Mutual Groups Logic
  const mutualGroups = useMemo(() => {
    if (!user || !chats) return [];
    return chats.filter(
      (c) =>
        c.isGroupChat &&
        c.users.some((u) => u._id === user._id || u.id === user._id)
    );
  }, [chats, user]);

  if (!user) return null;

  const avatarUrl = user.avatar || null;
  const initial = user.name ? user.name[0].toUpperCase() : "?";

  // Logic to determine status text and color
  const isOwed = balanceData.netBalance > 0; // They owe me
  const isDue = balanceData.netBalance < 0;  // I owe them
  const isSettled = balanceData.netBalance === 0;

  const absAmount = Math.abs(balanceData.netBalance).toFixed(2);

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ←
        </button>
        <div className="header-title">Contact Info</div>
        <div style={{ width: 24 }} />
      </div>

      <div className="profile-content">
        
        {/* 1. Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar-large">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user.name} />
            ) : (
              <span>{initial}</span>
            )}
          </div>
          <h2 className="profile-name">{user.name}</h2>
          <p className="profile-email">{user.email}</p>
        </div>

        {/* 2. Financial Status Card (Updated Text) */}
        {!balanceData.loading && (
            <div className={`finance-card ${isOwed ? "owed" : isDue ? "due" : "settled"}`}>
                <div className="finance-label">
                    {/* 🔥 UPDATED SIMPLE TEXT HERE */}
                    {isOwed && "You will be receiving"}
                    {isDue && "You need to pay"}
                    {isSettled && "All settled up"}
                </div>
                <div className="finance-amount">
                    {!isSettled && "$"}
                    {isSettled ? "No payments pending" : absAmount}
                </div>
            </div>
        )}

        {/* 3. Mutual Groups */}
        <div className="section-label">
          {mutualGroups.length} Mutual Group{mutualGroups.length !== 1 && "s"}
        </div>

        <div className="mutual-groups-list">
          {mutualGroups.length > 0 ? (
            mutualGroups.map((group) => (
              <div
                key={group._id}
                className="mutual-group-item"
                onClick={() => navigate(`/app/chat/${group._id}`)}
              >
                <div className="group-avatar-small">
                  {group.groupPic ? (
                    <img src={group.groupPic} alt="G" />
                  ) : (
                    <span>{group.chatName?.[0]}</span>
                  )}
                </div>
                <div className="group-info">
                  <span className="group-name">{group.chatName}</span>
                </div>
                <div className="arrow-icon">›</div>
              </div>
            ))
          ) : (
            <div className="no-groups-text">No groups in common</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;