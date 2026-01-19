import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ChatProvider } from "./context/ChatContext";
import { ThemeProvider } from "./context/ThemeContext"; // 🔥 1. Import ThemeProvider

// Pages
import Signup from "./pages/Signup";
import Chat from "./pages/app_pages/Chat";
import ChatWindow from "./pages/app_pages/ChatWindow";
import UserProfile from "./pages/app_pages/UserProfile";
import Dashboard from "./pages/app_pages/Dashboard";
import Settings from "./pages/app_pages/Settings";
import EditProfile from "./pages/app_pages/EditProfile";
import GroupInfo from "./pages/app_pages/GroupInfo";

// Components
import BottomNav from "./components/BottomNav";

const App = () => {
  const location = useLocation();

  // Logic: Show BottomNav only on main tab pages
  const showNav =
    location.pathname === "/app" ||
    location.pathname === "/app/dashboard" ||
    location.pathname === "/app/settings";

  return (
    // 🔥 2. Wrap the entire app in ThemeProvider
    <ThemeProvider>
      <div className="App">
        <ChatProvider>
          <Routes>
            {/* Auth Route */}
            <Route path="/" element={<Signup />} />

            {/* Main App Routes (With BottomNav) */}
            <Route path="/app" element={<Chat />} />
            <Route path="/app/dashboard" element={<Dashboard />} />
            <Route path="/app/settings" element={<Settings />} />

            {/* Detailed Routes (No BottomNav) */}
            <Route path="/app/chat/:chatId" element={<ChatWindow />} />
            <Route path="/app/user-info" element={<UserProfile />} />
            <Route path="/app/settings/account" element={<EditProfile />} />
            <Route path="/app/group-info" element={<GroupInfo />} />
          </Routes>

          {/* Conditional Navigation */}
          {showNav && <BottomNav />}
        </ChatProvider>
      </div>
    </ThemeProvider>
  );
};

export default App;
