import api from "../../config/axios";
const API_URL = import.meta.env.VITE_API_URL;
export const createBookingIntent = async (payload: any) => {
  const res = await api.post(`/bookings/booking-intents`, payload);
  return res.data;
};

export const getBookingIntent = async (bookingIntentId: string) => {
  const res = await api.get(`/bookings/booking-intents/${bookingIntentId}`);
  return res.data.result;
};

export const confirmBooking = async (bookingIntentId: any) => {
  const res = await api.post(`/bookings`, null, {
    params: { bookingIntentID: bookingIntentId },
  });
  return res.data;
};
export const updateBooking = async (
  bookingId: string,
  payload: { bookingStatus: string; note: string },
) => {
  const res = await api.put(`/bookings/${bookingId}`, payload);
  return res.data; 
};
export const updateBookingIntent = async (
  bookingIntentId: string,
  payload: any,
) => {
  const res = await api.put(
    `/bookings/booking-intents/${bookingIntentId}`,
    payload,
  );
  return res.data.result;
};

export const downloadInvoice = async (bookingId: string) => {
  const res = await api.get(`/bookings/${bookingId}/invoice`, {
    responseType: "blob",
  });

  return res.data;
};

export const getBookingsByRentalId = async (params) => {
  const response = await api.get(`/bookings/my-rentals`, {
    params: params,
  });
  return response.data;
};

export const getBookingsByUserId = async (params) => {
  const response = await api.get(`/bookings/my-bookings`, {
    params: params,
  });
  return response.data;
};

export const getBookingByBookingId = async (bookingId: string) => {
  const res = await api.get(`/bookings/${bookingId}`);
  return res.data;
};

export const cancelBooking = async (bookingId: string) => {
  const res = await api.put(`/bookings/${bookingId}/cancel`);
  return res.data;
};

export const getBookingQrUrl = (
  bookingId: string,
  type: "CHECK_IN" | "CHECK_OUT",
) => {
  return `${API_URL}/bookings/${bookingId}/qr?type=${type}`;
};

export const checkSlotConflict = async (params: {
  roomCodes: string[];
  startTime: string;
  endTime: string;
  excludeBookingId?: string;
}) => {
  const res = await api.get("/bookings/check-conflict", {
    params,
  });
  return res.data.result || [];
};

export const getAvailableSlots = async (params: {
  roomId: string;
  startTime: string;
  duration: number;
}) => {
  const res = await api.get("/bookings/available-slots", {
    params,
  });
  return res.data.result || [];
};

export const updateBookingSlot = async (payload: {
  slotId: string;
  bookingId: string;
  startTime: string;
  endTime: string;
}) => {
  const res = await api.put(`/bookings/${payload.bookingId}/slots`, payload);
  return res.data.result;
};

export const dashboardService = {
  getSummary: async (from, to) => {
    const res = await axiosClient.get("/dashboard/summary", {
      params: {
        from,
        to,
      },
    });
    return res.data.result;
  },
};

export const getAllBookings = async (params?: {
  bookingStatus?: string;
  keyword?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}) => {
  const response = await api.get(`/bookings`, {
    params: params,
  });
  return response.data;
};
