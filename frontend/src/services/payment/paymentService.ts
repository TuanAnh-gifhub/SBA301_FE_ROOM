import axios from "../../config/axios";

export default async function createPayment(data: {
  bookingIntentId: string;
  paymentMethod: string;
  phoneNumber: string;
  note?: string;
}) {
  const res = await axios.post("/payments/checkout", data);
  return res;
}
