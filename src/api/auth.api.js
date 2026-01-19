import api from "./axios";

export const registerUser = (data) => api.post("/auth/register", data);

export const loginUser = (data) => api.post("/auth/login", data);

export const verifyOTP = (data) => api.post("/auth/verify-email-otp", data);

export const resendOTP = (email) => api.post("/auth/resend-otp", { email });

export const requestPasswordReset = (email) =>
  api.post("/auth/request-password-reset", { email });

export const verifyResetOTP = (data) => api.post("/auth/verify-reset-otp", data);

export const resetPassword = (data) => api.post("/auth/reset-password", data);

export const updateProfileApi = (formData) => {
  return api.put("/auth/update-profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const changePasswordApi = (data) => {
  return api.put("/auth/change-password", data);
};
