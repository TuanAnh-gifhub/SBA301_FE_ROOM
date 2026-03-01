import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber } from "antd";
import type { PackageResponse, PackageRequest } from "../../../services/package/packageService";

// =====================================================
// GIẢI THÍCH:
// Modal này dùng chung cho 2 trường hợp:
//   mode="create" → form rỗng → gọi API tạo mới
//   mode="edit"   → form điền sẵn data → gọi API cập nhật
// =====================================================

interface PackageFormModalProps {
  open: boolean;                          // hiển thị modal hay không
  mode: "create" | "edit";               // chế độ tạo hay sửa
  initialData: PackageResponse | null;   // data điền sẵn khi edit (null khi create)
  loading: boolean;                       // đang gọi API → disable nút Submit
  onCancel: () => void;                  // đóng modal
  onSubmit: (values: PackageRequest) => void; // gửi form lên trang cha xử lý
}

const PackageFormModal: React.FC<PackageFormModalProps> = ({
  open,
  mode,
  initialData,
  loading,
  onCancel,
  onSubmit,
}) => {
  // Form instance của Ant Design — dùng để set/reset giá trị
  const [form] = Form.useForm();

  // Mỗi khi modal mở:
  // - Nếu edit → điền data cũ vào form
  // - Nếu create → xóa trắng form
  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        form.setFieldsValue({
          rentPackageName: initialData.rentPackageName,
          price: initialData.price,
          durationDays: initialData.durationDays,
          description: initialData.description,
        });
      } else {
        form.resetFields(); // xóa trắng khi tạo mới
      }
    }
  }, [open, mode, initialData, form]);

  // Khi user bấm OK → validate form → nếu hợp lệ → gọi onSubmit
  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit(values as PackageRequest);
  };

  return (
    <Modal
      title={mode === "create" ? "Thêm gói mới" : "Chỉnh sửa gói"}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText={mode === "create" ? "Tạo mới" : "Cập nhật"}
      cancelText="Hủy"
      confirmLoading={loading} // nút OK hiện loading khi đang gọi API
      destroyOnClose                // unmount form khi đóng để reset hoàn toàn
    >
      {/*
        Form.Item = 1 trường nhập liệu
        name      = tên field (khớp với PackageRequest)
        rules     = validation (bắt buộc nhập, min/max...)
      */}
      <Form form={form} layout="vertical" className="mt-4">

        <Form.Item
          name="rentPackageName"
          label="Tên gói"
          rules={[{ required: true, message: "Vui lòng nhập tên gói" }]}
        >
          <Input placeholder="VD: Trial 1 Day, Weekly Pass..." />
        </Form.Item>

        <Form.Item
          name="price"
          label="Giá (VND)"
          rules={[
            { required: true, message: "Vui lòng nhập giá" },
            { type: "number", min: 0, message: "Giá không được âm" },
          ]}
        >
          {/*
            InputNumber = ô nhập số (không cho nhập chữ)
            formatter   = hiển thị dấu phân cách hàng nghìn (15,000)
            parser      = bỏ dấu phân cách khi lưu về số thực
          */}
          <InputNumber
            className="w-full"
            placeholder="VD: 15000"
            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={(v) => v?.replace(/,/g, "") as unknown as number}
          />
        </Form.Item>

        <Form.Item
          name="durationDays"
          label="Thời hạn (ngày)"
          rules={[
            { required: true, message: "Vui lòng nhập số ngày" },
            { type: "number", min: 1, message: "Tối thiểu 1 ngày" },
          ]}
        >
          <InputNumber className="w-full" placeholder="VD: 7" min={1} />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="VD: Phù hợp cho nhu cầu ngắn hạn..."
          />
        </Form.Item>

      </Form>
    </Modal>
  );
};

export default PackageFormModal;