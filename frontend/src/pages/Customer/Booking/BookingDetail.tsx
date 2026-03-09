import { useEffect, useState } from "react";
import { Button, Card, Col, Row, Spin, message } from "antd";
import { useParams, useNavigate } from "react-router-dom";

import {
  getBookingIntent,
  confirmBooking,
} from "../../../services/booking/bookingService";
import BookingInfoList from "./BookingInfoList";
import PaymentSummary from "./PaymentSummary";

export default function BookingDetail() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

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

  const handleConfirm = async () => {
    if (!intent?.bookingIntentId) {
      message.error("Intent không hợp lệ");
      return;
    }

    try {
      setConfirming(true);

      const res = await confirmBooking(intent.bookingIntentId);
      if (res?.success) {
        message.success("Đặt phòng thành công!");

        navigate("/customer/my-bookings");
      } else {
        message.error("Đặt phòng thất bại " + (res?.message || ""));
      }
    } catch (e) {
      message.error("Booking thất bại");
    } finally {
      setConfirming(false);
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
    <div className="space-y-4">
      <Row gutter={24}>
        <Col span={16}>
          <BookingInfoList intent={intent} />
        </Col>

        <Col span={8}>
          <PaymentSummary
            intent={intent}
            onConfirm={handleConfirm}
            loading={confirming}
          />
        </Col>
      </Row>

      {bookingId && (
        <Card>
          <p className="text-sm text-gray-600 mb-3">
            Nếu bạn gặp vấn đề với booking này, có thể gửi khiếu nại trực tiếp để
            hệ thống tạm giữ escrow và admin xử lý.
          </p>
          <Button
            type="primary"
            danger
            onClick={() => navigate(`/report-form?bookingId=${bookingId}`)}
          >
            Khiếu nại booking này
          </Button>
        </Card>
      )}
    </div>
  );
}
