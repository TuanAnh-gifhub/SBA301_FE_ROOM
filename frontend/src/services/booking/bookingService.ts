import api from "../../config/axios";


export const createBookingIntent = async (payload: any) => {
  const res = await api.post(`/bookings/booking-intents`, payload);
  return res.data;
}

export const getBookingIntent = async(bookingIntentId: string) =>{
    const res = await api.get(`/bookings/booking-intents/${bookingIntentId}`);
    return res.data.result;
}

export const confirmBooking = async (bookingIntentId: any) => {
  const res = await api.post(`/bookings`, null, {
    params: { bookingIntentID: bookingIntentId },
  });
  return res.data;
};

export const updateBookingIntent = async (bookingIntentId: string, payload: any) => {
  const res = await api.put(`/bookings/booking-intents/${bookingIntentId}`, payload);
  return res.data.result;
}