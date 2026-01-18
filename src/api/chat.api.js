import api from "./axios";

// Access (Create/Get) 1-on-1 Chat
export const accessChatApi = (userId) => {
  return api.post("/chat/access", { userId });
};

// Fetch all chats (Main list)
export const fetchChatsApi = () => {
  return api.get("/chat/fetch");
};

// Create Group
export const createGroupChatApi = (data) => {
  return api.post("/chat/group", data);
};

// Exit Group (Remove Self)
export const exitGroupApi = (chatId, userId) => {
  return api.put("/chat/groupremove", { chatId, userId });
};
// Update Group (Name, Pic, etc.)
export const updateGroupDetailsApi = (formData) => {
  return api.put("/chat/groupupdate", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Search Users (Used in Group Creation)
// Matches route: router.get("/users/search", ...)
export const searchUsersApi = (queryParams) => {
  // If queryParams is an object { search: "..." }, axios handles it via params
  // Or if it's a raw string, we append it.
  // Assuming the backend searchMiddleware expects ?search=... or ?q=...

  // Case 1: If you pass an object { q: "john", type: "name" }
  if (typeof queryParams === "object") {
    return api.get("/chat/users/search", { params: queryParams });
  }

  // Case 2: Fallback for simple string
  return api.get(`/chat/users/search?search=${queryParams}`);
};
