import { useEffect, useState } from "react";
import { Button, Card, Col, Row, Spin, message } from "antd";
import { useParams, useNavigate } from "react-router-dom";

import {
  getBookingIntent,
  confirmBooking,
} from "../../../services/booking/bookingService";
import BookingInfoList from "./BookingInfoList";
import PaymentSummary from "./PaymentSummary";
import BookingContactForm from "./BookingContactForm";
export default function BookingDetail() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState({
    name: "",
    phone: "",
    note: "",
  });
  const [intent, setIntent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      message.error("Booking không hợp lệ");
      navigate("/");
      return;
    }

    fetchIntent();
  }, [bookingId]);

  const fetchIntent = async () => {
    try {
      setLoading(true);

      const data = await getBookingIntent(bookingId!);

      console.log("BOOKING INTENT:", data);

      setIntent(data);
    } catch (err) {
      message.error("Không tải được thông tin booking");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !intent) {
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Row gutter={16}>
      <Col span={16}>
        <BookingContactForm formData={contact} setFormData={setContact} />
        <BookingInfoList intent={intent} />
      </Col>

      <Col span={8}>
        <PaymentSummary intent={intent} contact={contact} />
      </Col>
    </Row>
  );
}
