import { Card, Button } from "antd";
import { useState } from "react";
import { toast } from "react-toastify";
import createPayment from "../../../services/payment/paymentService";
import type { CheckoutResponse } from "../../../services/payment/paymentService";
import { useNavigate } from "react-router-dom";
export default function PaymentSummary({ intent }: any) {
  const [paymentMethod, setPaymentMethod] = useState("WALLET");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async () => {
    try {
      setLoading(true);

      const res = await createPayment({
        bookingIntentId: intent.bookingIntentId,
        paymentMethod,
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
    } catch (err) {
      toast.error("Thanh toán thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Order Summary">
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
