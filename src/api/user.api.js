import api from "./axios";

export const searchUsersApi = (params) => {
  return api.get("/chat/users/search", { params });
};

