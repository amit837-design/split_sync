import React, { useEffect, useState } from "react";
import { getDashboardDataApi } from "../../api/pool.api";
import "./Dashboard.css";

const Dashboard = () => {
  const [data, setData] = useState({
    totalOwed: 0,
    totalDue: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const myId =
    userInfo?.user?._id || userInfo?._id || userInfo?.user?.id || userInfo?.id;

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data } = await getDashboardDataApi();
        setData(data);
      } catch (error) {
        console.error("Dashboard load failed", error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  return (
    <div className="dashboard-container">
      {/* HEADER (Matches Settings.jsx style) */}
      <div className="dash-header">
        <h1>Dashboard</h1>
      </div>

      {/* SCROLLABLE CONTENT WRAPPER */}
      <div className="dashboard-content">
        {/* STATS CARD */}
        <div className="stats-card-main">
          <div className="stat-gauge">
            <div className="gauge-circle green-gauge">
              <div className="gauge-content">
                <span className="currency">$</span>
                <span className="amount">{data.totalOwed.toFixed(2)}</span>
              </div>
            </div>
            <span className="stat-label">Total Owed</span>
          </div>

          <div className="stat-gauge">
            <div className="gauge-circle orange-gauge">
              <div className="gauge-content">
                <span className="currency">$</span>
                <span className="amount">{data.totalDue.toFixed(2)}</span>
              </div>
            </div>
            <span className="stat-label">Total Due</span>
          </div>
        </div>

        {/* ACTIVITY SECTION */}
        <div className="activity-section">
          <h3>Recent pool activities</h3>

          <div className="activity-list">
            {loading && <p className="loading-text">Loading activity...</p>}

            {!loading && data.recentActivity.length === 0 && (
              <p className="loading-text">No recent transactions.</p>
            )}

            {!loading &&
              data.recentActivity.map((pool) => {
                const isCreator =
                  String(pool.creator._id || pool.creator) === String(myId);

                let icon = "💸";
                let title = "Expense Pool";
                let subtitle = "";
                let amountColor = "";
                let displayAmount = pool.amountOwed;

                if (isCreator) {
                  title = pool.title;
                  if (pool.status === "settled") {
                    icon = "✅";
                    subtitle = "Payment Received";
                    amountColor = "text-green";
                  } else if (pool.status === "cancelled") {
                    icon = "🚫";
                    subtitle = "Cancelled";
                    amountColor = "text-muted";
                  } else {
                    icon = "⏳";
                    subtitle = "You are owed";
                    amountColor = "text-orange";
                  }
                } else {
                  title = pool.title;
                  if (pool.status === "settled") {
                    icon = "✅";
                    subtitle = "You Paid";
                    amountColor = "text-muted";
                  } else {
                    icon = "💸";
                    subtitle = "Payment Due";
                    amountColor = "text-red";
                  }
                }

                return (
                  <div key={pool._id} className="activity-item">
                    <div className="activity-icon-box">{icon}</div>
                    <div className="activity-info">
                      <span className="act-title">{title}</span>
                      <span className="act-sub">{subtitle}</span>
                    </div>
                    <div className={`activity-amount ${amountColor}`}>
                      ${displayAmount.toFixed(2)}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
      {/* End of dashboard-content */}
    </div>
  );
};

export default Dashboard;
