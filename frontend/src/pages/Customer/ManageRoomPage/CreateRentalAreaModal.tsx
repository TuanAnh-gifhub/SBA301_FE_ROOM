import React, { useMemo, useState } from "react";
import { Button, Form, Input, Modal, Select, Upload, message } from "antd";
import {
  EnvironmentOutlined,
  HomeOutlined,
  PhoneOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { CityResponse } from "../../../services/cities/cities";

const { Option } = Select;

type FormValues = {
  rentalAreaName: string;
  address: string;
  contactName?: string;
  contactPhone?: string;
  cityId: number;
};

type Props = {
  open: boolean;
  loading: boolean;
  cities: CityResponse[];
  onClose: () => void;
  onSubmit: (data: FormValues & { images: File[] }) => Promise<void>;
};

const sectionTitleClass = "text-sm font-semibold text-slate-800 mb-3";
const cardClass = "rounded-2xl border border-slate-100 bg-slate-50 p-4";

const CreateRentalAreaModal: React.FC<Props> = ({
  open,
  loading,
  cities,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm<FormValues>();
  const [files, setFiles] = useState<File[]>([]);

  const uploadProps = useMemo(
    () => ({
      multiple: true,
      beforeUpload: (file: File) => {
        setFiles((prev) => [...prev, file].slice(0, 5));
        return false;
      },
      onRemove: (file: any) => {
        setFiles((prev) => prev.filter((f) => f.name !== file.name));
      },
      fileList: files.map((f) => ({
        uid: `${f.name}-${f.size}-${f.lastModified}`,
        name: f.name,
      })),
      listType: "picture-card" as const,
    }),
    [files],
  );

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (files.length < 1 || files.length > 5) {
        message.error("Vui lòng chọn từ 1 đến 5 ảnh");
        return;
      }
      await onSubmit({ ...values, images: files });
      form.resetFields();
      setFiles([]);
    } catch {
      //
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFiles([]);
    onClose();
  };

  return (
    <Modal
      title={
        <div>
          <div className="text-lg font-semibold text-slate-800">
            Thêm tòa nhà
          </div>
          <div className="text-sm text-slate-500 font-normal">
            Tạo tòa nhà mới để quản lý phòng học chuyên nghiệp hơn
          </div>
        </div>
      }
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Tạo tòa nhà"
      cancelText="Hủy"
      confirmLoading={loading}
      destroyOnClose
      width={920}
      styles={{
        body: {
          background: "#f8fafc",
          paddingTop: 12,
        },
      }}
      okButtonProps={{
        style: {
          background: "#1677ff",
          borderColor: "#1677ff",
          borderRadius: 12,
          fontWeight: 600,
        },
      }}
      cancelButtonProps={{
        style: {
          borderRadius: 12,
          fontWeight: 500,
        },
      }}
    >
      <Form form={form} layout="vertical">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={cardClass}>
            <div className={sectionTitleClass}>Thông tin cơ bản</div>

            <Form.Item
              label="Tên tòa nhà"
              name="rentalAreaName"
              rules={[{ required: true, message: "Vui lòng nhập tên tòa nhà" }]}
            >
              <Input
                size="large"
                prefix={<HomeOutlined className="text-slate-400" />}
                placeholder="Ví dụ: EduRoom Building A"
                className="rounded-xl"
              />
            </Form.Item>

            <Form.Item
              label="Thành phố"
              name="cityId"
              rules={[{ required: true, message: "Vui lòng chọn thành phố" }]}
            >
              <Select
                size="large"
                placeholder="Chọn thành phố"
                className="rounded-xl"
              >
                {cities.map((c) => (
                  <Option key={c.cityId} value={c.cityId}>
                    {c.cityName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Địa chỉ"
              name="address"
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Ví dụ: 123 Đường ABC, Quận 1, TP.HCM"
                className="rounded-xl"
              />
            </Form.Item>
          </div>

          <div className={cardClass}>
            <div className={sectionTitleClass}>Thông tin liên hệ</div>

            <Form.Item
              label="Người liên hệ"
              name="contactName"
              rules={[
                { required: true, message: "Vui lòng nhập tên người liên hệ" },
                {
                  whitespace: true,
                  message: "Tên liên hệ không được để trống",
                },
              ]}
            >
              <Input
                size="large"
                prefix={<UserOutlined className="text-slate-400" />}
                placeholder="Nhập tên người liên hệ"
                className="rounded-xl"
              />
            </Form.Item>

            <Form.Item
              label="SĐT liên hệ"
              name="contactPhone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                {
                  pattern: /^(0|\+84)[0-9]{8,10}$/,
                  message: "Số điện thoại không hợp lệ",
                },
              ]}
            >
              <Input
                size="large"
                prefix={<PhoneOutlined className="text-slate-400" />}
                placeholder="Nhập số điện thoại"
                className="rounded-xl"
              />
            </Form.Item>

            <div className="rounded-xl bg-white border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
              <div className="font-medium text-slate-700 mb-1">
                Gợi ý thông tin
              </div>
              <div className="flex items-start gap-2">
                <EnvironmentOutlined className="mt-1 text-[#1677ff]" />
                <span>
                  Nên nhập đầy đủ địa chỉ và thông tin liên hệ để người dùng dễ
                  tìm thấy tòa nhà hơn.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={`${cardClass} mt-4`}>
          <div className={sectionTitleClass}>Ảnh tòa nhà</div>

          <Upload {...(uploadProps as any)}>
            {files.length >= 5 ? null : (
              <div className="flex flex-col items-center justify-center">
                <UploadOutlined />
                <div className="mt-2">Tải ảnh lên</div>
              </div>
            )}
          </Upload>

          <div className="text-xs text-slate-500 mt-2">
            Chọn từ <b>1 đến 5 ảnh</b>. Ảnh đầu tiên sẽ được dùng làm ảnh đại
            diện.
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateRentalAreaModal;
