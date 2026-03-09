import { Card, Button } from "antd";
import { useState } from "react";
import { toast } from "react-toastify";
import createPayment from "../../../services/payment/paymentService";
import type { CheckoutResponse } from "../../../services/payment/paymentService";
import { useNavigate } from "react-router-dom";
export default function PaymentSummary({ intent ,contact}: any) {
  const [paymentMethod, setPaymentMethod] = useState("BANK");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async () => {
    if (!contact.phone) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }

    try {
      setLoading(true);

      const res = await createPayment({
        bookingIntentId: intent.bookingIntentId,
        paymentMethod,
        phoneNumber: contact.phone,
        note: contact.note,
      });
      const result: CheckoutResponse | undefined = res?.data?.result;
      if (res.data.code === 201 && result) {
        if (result.mode === "BOOKED" && result.bookingId) {
          toast.success("Thanh toán thành công");
          navigate(`/payment/success/${result.bookingId}`);
          return;
        }
        if (result.mode === "REDIRECT" && result.paymentUrl) {
          window.location.href = result.paymentUrl;
          return;
        }
        if (result.mode === "PENDING") {
          toast.info(result.message || "Đang chờ xác nhận thanh toán");
          return;
        }
        toast.error(result.message || "Thanh toán chưa thành công");
        return;
      }
      if (res.data.code !== 201) {
        toast.error(res.data.message);
      }
    } catch (err: any) {
      if (!err.response) {
        toast.error("Không thể kết nối server. Vui lòng thử lại.");
        return;
      }

      const data = err.response.data;

      if (data.code === 2003) {
        const errorMessages = Object.values(data.result);
        errorMessages.forEach((msg: any) => toast.error(msg));
      }

      if (data.code === 500) {
        toast.error("Lỗi hệ thống");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Tổng hóa đơn">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Chi phí</span>
          <span>{intent.subTotal} VNĐ</span>
        </div>

        <div className="flex justify-between">
          <span>Thuế</span>
          <span>{intent.tax || 0} VNĐ</span>
        </div>

        <div className="flex justify-between">
          <span>Giảm giá</span>
          <span>-{intent.discount || 0} VNĐ</span>
        </div>
      </div>

      <hr className="my-4" />

      <div className="flex justify-between font-bold text-lg">
        <span>Tổng cộng</span>
        <span>{intent.totalAmount} VNĐ</span>
      </div>

      <div className="mt-6">
        <p className="font-semibold mb-3">Phương thức thanh toán</p>

        <div className="flex gap-3">
          <button
            onClick={() => setPaymentMethod("WALLET")}
            className={`p-3 border rounded-xl w-full ${
              paymentMethod === "WALLET"
                ? "border-teal-500 bg-teal-50"
                : ""
            }`}
          >
            Ví nội bộ
          </button>

          <button
            onClick={() => setPaymentMethod("VN_PAY")}
            className={`p-3 border rounded-xl w-full ${
              paymentMethod === "VN_PAY" ? "border-teal-500 bg-teal-50" : ""
            }`}
          >
            PayOS trực tiếp
          </button>
        </div>
      </div>

      <Button
        type="primary"
        block
        size="large"
        loading={loading}
        className="mt-6 h-12"
        onClick={handlePayment}
      >
        Thanh toán
      </Button>
    </Card>
  );
}
