import api from "./../config/axios";

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface NotificationResponse {
  notificationId: string;
  notificationTitle: string;
  notificationBody: string;
  type: string;
  link: string;
  isRead: boolean;
  recipientId: string;
  createdAt: string;
}

export interface BroadcastRequest {
  title: string;
  message: string;
  link?: string;
}

const notificationService = {
  getMyNotifications: async (
    page: number = 0,
    size: number = 10,
  ): Promise<ApiResponse<PageResponse<NotificationResponse>>> => {
    const response = await api.get<
      ApiResponse<PageResponse<NotificationResponse>>
    >(`/notifications/my-notification`, {
      params: { page, size },
    });
    return response.data;
  },

  markAsRead: async (notificationId: string): Promise<ApiResponse<void>> => {
    const response = await api.patch<ApiResponse<void>>(
      `/notifications/${notificationId}/read`,
    );
    return response.data;
  },

  markAllAsRead: async (): Promise<ApiResponse<void>> => {
    const response = await api.patch<ApiResponse<void>>(
      `/notifications/read-all`,
    );
    return response.data;
  },

  deleteNotification: async (
    notificationId: string,
  ): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(
      `/notifications/${notificationId}`,
    );
    return response.data;
  },

  broadcastNotification: async (
    payload: BroadcastRequest,
  ): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>(
      `/notifications/broadcast`,
      payload,
    );
    return response.data;
  },
};

export default notificationService;
