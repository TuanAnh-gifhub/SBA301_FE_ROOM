import React, { useEffect } from "react";
import { Form, Input, Modal, Select } from "antd";
import {
  EnvironmentOutlined,
  HomeOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { CityResponse } from "../../../services/cities/cities";
import type { RentalAreaResponse } from "../../../services/rental-areas/rentalAreas";
import { TimePicker } from "antd";
import dayjs from "dayjs";
const { Option } = Select;

type FormValues = {
  rentalAreaName: string;
  address: string;
  contactName?: string;
  contactPhone?: string;
  cityId: number;
  openTime: Dayjs;
  closeTime: Dayjs;
};

type Props = {
  open: boolean;
  loading: boolean;
  cities: CityResponse[];
  initial?: RentalAreaResponse | null;
  onClose: () => void;
  onSubmit: (data: FormValues) => Promise<void>;
};

const sectionTitleClass = "text-sm font-semibold text-slate-800 mb-3";
const cardClass = "rounded-2xl border border-slate-100 bg-slate-50 p-4";

const UpdateRentalAreaModal: React.FC<Props> = ({
  open,
  loading,
  cities,
  initial,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm<FormValues>();

  useEffect(() => {
    if (open && initial) {
      form.setFieldsValue({
        rentalAreaName: initial.rentalAreaName,
        address: initial.address,
        contactName: initial.contactName,
        contactPhone: initial.contactPhone,
        cityId: initial.cityId,
        openTime: initial.openTime ? dayjs(initial.openTime, "HH:mm") : null,
        closeTime: initial.closeTime ? dayjs(initial.closeTime, "HH:mm") : null,
      });
    }

    if (open && !initial) {
      form.resetFields();
    }
  }, [open, initial, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        ...values,
        openTime: values.openTime?.format("HH:mm"),
        closeTime: values.closeTime?.format("HH:mm"),
      };

      await onSubmit(payload);
      form.resetFields();
    } catch {
      //
    }
  };
  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <div>
          <div className="text-lg font-semibold text-slate-800">
            Chỉnh sửa tòa nhà
          </div>
          <div className="text-sm text-slate-500 font-normal">
            Cập nhật lại thông tin tòa nhà để dữ liệu hiển thị đồng bộ hơn
          </div>
        </div>
      }
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Lưu thay đổi"
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
                Lưu ý khi cập nhật
              </div>
              <div className="flex items-start gap-2">
                <EnvironmentOutlined className="mt-1 text-[#1677ff]" />
                <span>
                  Hãy giữ địa chỉ và số điện thoại chính xác để việc quản lý
                  phòng học và hiển thị thông tin luôn nhất quán.
                </span>
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <div className={sectionTitleClass}>Giờ hoạt động</div>

            <Form.Item
              label="Giờ mở cửa"
              name="openTime"
              rules={[{ required: true, message: "Chọn giờ mở cửa" }]}
            >
              <TimePicker format="HH:mm" minuteStep={30} className="w-full" />
            </Form.Item>

            <Form.Item
              label="Giờ đóng cửa"
              name="closeTime"
              rules={[{ required: true, message: "Chọn giờ đóng cửa" }]}
            >
              <TimePicker format="HH:mm" minuteStep={30} className="w-full" />
            </Form.Item>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdateRentalAreaModal;
