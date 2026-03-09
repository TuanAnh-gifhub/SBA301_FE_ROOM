import axios from "../../config/axios";

export type CheckoutResponse = {
  mode: "BOOKED" | "REDIRECT" | "PENDING" | "FAILED";
  paymentStatus: string;
  bookingId?: string;
  paymentUrl?: string;
  orderCode?: string;
  message?: string;
};

export async function createPayment(data: {
  bookingIntentId: string;
  paymentMethod: string;
  phoneNumber: string;
  note?: string;
}) {
  const res = await axios.post("/payments/checkout", data);
  return res;
}

export async function handleBookingPaymentResult(data: {
  orderCode: string;
  status: string;
}) {
  const res = await axios.get("/payments/result", {
    params: data,
  });
  return res;
}

export default createPayment;
