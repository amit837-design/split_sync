import axios from "axios";

// 1. Create the Axios Instance
// We use 'import.meta.env.VITE_API_URL' to automatically switch
// between localhost (dev) and your live server URL (production).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true, // This allows cookies to be sent/received (essential for sessions)
});

// 2. REQUEST INTERCEPTOR (The "Gatekeeper")
// This code runs *before* every single API request leaves your app.
api.interceptors.request.use(
  (config) => {
    // Attempt to read user data from LocalStorage
    const userInfoString = localStorage.getItem("userInfo");

    if (userInfoString) {
      const userInfo = JSON.parse(userInfoString);

      // We look for the token in two common places:
      // directly on the object, or nested inside a 'user' object.
      const token = userInfo.token || userInfo.user?.token;

      // If a token exists, attach it to the headers.
      // This verifies your identity to the backend.
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 3. RESPONSE INTERCEPTOR (The "Security Guard")
// This code runs *after* every response comes back from the backend.
api.interceptors.response.use(
  (response) => response, // If response is good (200 OK), just return it.
  (error) => {
    // If the backend returns "401 Unauthorized", it means your token
    // is expired, fake, or missing.
    if (error.response?.status === 401) {
      console.warn("Session expired or unauthorized. Logging out...");

      // 1. Wipe the invalid data so the app doesn't think we are logged in.
      localStorage.removeItem("userInfo");

      // 2. Force the browser to go back to the Login page.
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default api;
