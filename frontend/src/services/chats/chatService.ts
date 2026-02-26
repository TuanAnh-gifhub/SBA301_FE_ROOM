import api from "../../config/axios";
import type { UserResponse } from "../usersService";

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export interface MessageResponse {
  messageId: string;
  conversationId: string;
  content: string;
  senderName: string;
  senderId: string;
  createdAt: string;
  status: "SENT" | "DELIVERED" | "READ";
  readAt?: string;
}

export interface ConversationResponse {
  conversationId: string;
  conversationTitle: string;
  lastMessage: string;
  lastSenderName: string;
  user1: UserResponse;
  user2: UserResponse;
  updatedAt: string;
}

const chatService = {
  getUserConversations: async (
    userId: string,
  ): Promise<ApiResponse<ConversationResponse[]>> => {
    const response = await api.get<ApiResponse<ConversationResponse[]>>(
      `/chat/conversations/${userId}`,
    );
    return response.data;
  },

  getMessages: async (
    conversationId: string,
  ): Promise<ApiResponse<MessageResponse[]>> => {
    const response = await api.get<ApiResponse<MessageResponse[]>>(
      `/chat/history/${conversationId}`,
    );
    return response.data;
  },

  getConversation: async (
    conversationId: string,
  ): Promise<ApiResponse<ConversationResponse>> => {
    const response = await api.get<ApiResponse<ConversationResponse>>(
      `/chat/conversation/${conversationId}`,
    );
    return response.data;
  },

  markMessageAsRead: async (
    conversationId: string,
    userId: string,
  ): Promise<ApiResponse<void>> => {
    const response = await api.patch<ApiResponse<void>>(
      `/chat/conversations/${conversationId}/read`,
      null,
      {
        params: { userId },
      },
    );
    return response.data;
  },
};

export default chatService;
