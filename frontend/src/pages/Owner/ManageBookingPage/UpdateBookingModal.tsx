import { Modal, Form, Select, Input, message } from "antd";
import { useState, useEffect } from "react";
import { updateBooking } from "../../../services/booking/bookingService";

interface UpdateBookingModalProps {
  open: boolean;
  booking: any;
  onClose: () => void;
  onSuccess: () => void;
}

const UpdateBookingModal = ({
  open,
  booking,
  onClose,
  onSuccess,
}: UpdateBookingModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (booking) {
      form.setFieldsValue({
        bookingStatus: booking.status,
        note: booking.note,
      });
    }
  }, [booking, form]);

  const currentStatus = booking?.bookingStatus || booking?.status;

  const isLocked =
    currentStatus === "COMPLETED" || currentStatus === "CANCELLED";

  const handleSubmit = async () => {
    if (isLocked) {
      message.warning(
        "Booking này đã hoàn thành hoặc đã hủy, không thể cập nhật thêm!",
      );
      return;
    }

    try {
      setLoading(true);
      const values = await form.validateFields();

      await updateBooking(booking.bookingId, values);

      message.success("Cập nhật trạng thái thành công");
      onSuccess();
      onClose();
    } catch (error: any) {
      let errorMsg = error.response?.data?.message || "Có lỗi xảy ra";
      if (errorMsg.includes("Api system have some problems")) {
        errorMsg = errorMsg.replace("Api system have some problems", "").trim();
      }
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Cập nhật đơn đặt lịch"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Cập nhật"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Trạng thái đơn hàng"
          name="bookingStatus"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
        >
          <Select>
            <Select.Option value="BOOKED">Đã đặt</Select.Option>
            <Select.Option value="COMPLETED">Hoàn thành</Select.Option>
            <Select.Option value="CANCELLED">Hủy đơn</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Ghi chú (Note)" name="note">
          <Input.TextArea
            rows={4}
            placeholder="Nhập ghi chú cho khách hàng hoặc nội bộ..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateBookingModal;
