import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/v1/rent-room/chat";

const getAuthConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
});

const handleResponse = (response: any) => {
  return {
    success: response.data.code === 1000,
    data: response.data.result,
  };
};

export const getUserConversations = async (userId: string) => {
  const response = await axios.get(
    `${API_BASE_URL}/conversations/${userId}`,
    getAuthConfig(),
  );
  return handleResponse(response);
};

export const getMessages = async (conversationId: string) => {
  const response = await axios.get(
    `${API_BASE_URL}/history/${conversationId}`,
    getAuthConfig(),
  );
  return handleResponse(response);
};

export const getConversation = async (conversationId: string) => {
  const response = await axios.get(
    `${API_BASE_URL}/conversation/${conversationId}`,
    getAuthConfig(),
  );
  return handleResponse(response);
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
    return handleResponse(response);
  } catch (error) {
    return { success: false };
  }
};

// export const sendMessage = async (
//   senderId: string,
//   recipientId: string,
//   content: string,
//   conversationId?: string,
// ) => {
//   try {
//     const payload = { senderId, recipientId, content, conversationId };
//     const response = await axios.post(
//       `${API_BASE_URL}/send-test`,
//       payload,
//       getAuthConfig(),
//     );
//     return handleResponse(response);
//   } catch (error) {
//     console.error("Send message error:", error);
//     return { success: false };
//   }
// };
