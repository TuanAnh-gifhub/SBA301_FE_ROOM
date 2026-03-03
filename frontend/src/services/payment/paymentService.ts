import axios from "../../config/axios";

export default async function createPayment(data: {
  bookingIntentId: string;
  paymentMethod: string;
}) {
  const res = await axios.post("/payments/checkout", data);
  return res;
}
