import axios from "axios";

const api = axios.create({
  baseURL: "https://split-sync-backend-1.onrender.com",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const userInfoString = localStorage.getItem("userInfo");

    if (userInfoString) {
      const userInfo = JSON.parse(userInfoString);

      const token = userInfo.token || userInfo.user?.token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Session expired or unauthorized. Logging out...");

      localStorage.removeItem("userInfo");

      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default api;
