import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/v1/rent-room/chat";

const getAuthConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
});

export const getUserConversations = async (userId: string) => {
  const response = await axios.get(
    `${API_BASE_URL}/conversations/${userId}`,
    getAuthConfig(),
  );
  return { success: true, data: response.data };
};

export const getMessages = async (conversationId: string) => {
  const response = await axios.get(
    `${API_BASE_URL}/history/${conversationId}`,
    getAuthConfig(),
  );
  return { success: true, data: response.data };
};

export const getConversation = async (conversationId: string) => {
  const response = await axios.get(
    `${API_BASE_URL}/conversation/${conversationId}`,
    getAuthConfig(),
  );
  return { success: true, data: response.data };
};

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  recipientId: string,
  content: string,
) => {
  try {
    const payload = { conversationId, senderId, recipientId, content };
    const response = await axios.post(
      `${API_BASE_URL}/send`,
      payload,
      getAuthConfig(),
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false };
  }
};

export const markMessageAsRead = async (
  conversationId: string,
  userId: string,
) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/conversations/${conversationId}/read?userId=${userId}`,
      {},
      getAuthConfig(),
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false };
  }
};
