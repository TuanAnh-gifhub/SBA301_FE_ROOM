import React, { useState } from "react";
import { Form, Input, Modal, Select, Upload, message } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import {
  EnvironmentOutlined,
  HomeOutlined,
  PhoneOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { CityResponse } from "../../../services/cities/cities";
import BlockingLoadingOverlay from "./BlockingLoadingOverlay";

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
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const images = fileList
        .map((f) => f.originFileObj)
        .filter(Boolean) as File[];

      if (images.length < 1 || images.length > 5) {
        message.error("Vui lòng chọn từ 1 đến 5 ảnh");
        return;
      }

      setSubmitting(true);
      await onSubmit({ ...values, images });
      form.resetFields();
      setFileList([]);
    } catch {
      //
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting || loading) return;
    form.resetFields();
    setFileList([]);
    onClose();
  };

  const isBusy = submitting || loading;

  return (
    <>
      <BlockingLoadingOverlay
        open={open && isBusy}
        title="Đang khởi tạo tòa nhà"
        description="Hệ thống đang tải ảnh và thiết lập thông tin tòa nhà. Quá trình này có thể mất vài giây, vui lòng đợi trong giây lát."
      />

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
        confirmLoading={false}
        destroyOnClose
        width={920}
        maskClosable={!isBusy}
        keyboard={!isBusy}
        closable={!isBusy}
        okButtonProps={{
          disabled: isBusy,
          style: {
            background: "#1677ff",
            borderColor: "#1677ff",
            borderRadius: 12,
            fontWeight: 600,
          },
        }}
        cancelButtonProps={{
          disabled: isBusy,
          style: {
            borderRadius: 12,
            fontWeight: 500,
          },
        }}
        styles={{
          body: {
            background: "#f8fafc",
            paddingTop: 12,
          },
        }}
      >
        <Form form={form} layout="vertical" disabled={isBusy}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className={cardClass}>
              <div className={sectionTitleClass}>Thông tin cơ bản</div>

              <Form.Item
                label="Tên tòa nhà"
                name="rentalAreaName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên tòa nhà" },
                ]}
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
                  {
                    required: true,
                    message: "Vui lòng nhập tên người liên hệ",
                  },
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
                    Nên nhập đầy đủ địa chỉ và thông tin liên hệ để người dùng
                    dễ tìm thấy tòa nhà hơn.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={`${cardClass} mt-4`}>
            <div className={sectionTitleClass}>Ảnh tòa nhà</div>

            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList: next }) => {
                const alive = next.filter((f) => f.status !== "removed");
                const uniq = new Map();
                alive.forEach((f) => uniq.set(f.uid, f));
                setFileList(Array.from(uniq.values()).slice(0, 5));
              }}
            >
              {fileList.length >= 5 ? null : (
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
    </>
  );
};

export default CreateRentalAreaModal;
