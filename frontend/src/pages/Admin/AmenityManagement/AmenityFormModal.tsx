import React, { useEffect, useMemo, useState } from "react";
import { Empty, Form, Input, Modal } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type {
  AmenityResponse,
  CreateAmenityRequest,
  UpdateAmenityRequest,
} from "../../../services/amenities/amenities";
import {
  AMENITY_ICON_OPTIONS,
  DEFAULT_AMENITY_ICON,
  getAmenityIcon,
  searchAmenityIcons,
  type AmenityIconKey,
} from "./amenityIcons";

interface AmenityFormModalProps {
  open: boolean;
  loading?: boolean;
  mode: "create" | "edit";
  initialData?: AmenityResponse | null;
  onCancel: () => void;
  onSubmit: (payload: CreateAmenityRequest | UpdateAmenityRequest) => void;
}

const AmenityFormModal: React.FC<AmenityFormModalProps> = ({
  open,
  loading = false,
  mode,
  initialData,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [iconKeyword, setIconKeyword] = useState("");

  const selectedIconKey = Form.useWatch("iconKey", form) as
    | AmenityIconKey
    | undefined;

  useEffect(() => {
    if (!open) return;

    setIconKeyword("");

    if (mode === "edit" && initialData) {
      form.setFieldsValue({
        amenityName: initialData.amenityName,
        iconKey: (initialData.iconKey ||
          DEFAULT_AMENITY_ICON) as AmenityIconKey,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        amenityName: "",
        iconKey: DEFAULT_AMENITY_ICON,
      });
    }
  }, [open, mode, initialData, form]);

  const handleOk = async () => {
    const values = await form.validateFields();

    onSubmit({
      amenityName: values.amenityName.trim(),
      iconKey: values.iconKey,
    });
  };

  const filteredIcons = useMemo(
    () => searchAmenityIcons(iconKeyword),
    [iconKeyword],
  );

  const SelectedIcon = getAmenityIcon(selectedIconKey);
  const selectedMeta =
    AMENITY_ICON_OPTIONS.find((item) => item.value === selectedIconKey) ||
    AMENITY_ICON_OPTIONS.find((item) => item.value === DEFAULT_AMENITY_ICON);

  return (
    <Modal
      open={open}
      centered
      title={
        mode === "create"
          ? "Tạo thiết bị & tiện ích"
          : "Cập nhật thiết bị & tiện ích"
      }
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      okText={mode === "create" ? "Tạo" : "Cập nhật"}
      cancelText="Hủy"
      destroyOnClose
      width="90%"
      styles={{
        body: {
          maxHeight: "80vh",
          overflowY: "auto",
        },
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên thiết bị & tiện ích"
          name="amenityName"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập tên thiết bị & tiện ích",
            },
            { max: 100, message: "Tối đa 100 ký tự" },
          ]}
        >
          <Input placeholder="Ví dụ: WiFi, Máy chiếu..." />
        </Form.Item>

        <Form.Item
          name="iconKey"
          hidden
          rules={[{ required: true, message: "Vui lòng chọn biểu tượng" }]}
        >
          <Input />
        </Form.Item>

        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-medium text-slate-700">
              Biểu tượng
            </label>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200">
                    <SelectedIcon className="text-3xl text-[#1677ff]" />
                  </div>

                  <div>
                    <div className="text-sm text-slate-500">Đang chọn</div>
                    <div className="font-semibold text-slate-800">
                      {selectedMeta?.label || "Unknown"}
                    </div>
                    <div className="text-xs text-slate-400">
                      {selectedIconKey || DEFAULT_AMENITY_ICON}
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-[340px]">
                  <Input
                    allowClear
                    size="large"
                    prefix={<SearchOutlined />}
                    placeholder="Tìm theo tên icon, ví dụ: wifi, user, tv..."
                    value={iconKeyword}
                    onChange={(e) => setIconKeyword(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                <span>
                  Hiển thị <strong>{filteredIcons.length}</strong> icon
                </span>
                <span>Có thể tìm bằng tên như: FaWifi, FaTv, FaUser...</span>
              </div>

              <div className="mt-4 max-h-[420px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3">
                {filteredIcons.length === 0 ? (
                  <Empty description="Không tìm thấy icon phù hợp" />
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {filteredIcons.map((item) => {
                      const Icon = getAmenityIcon(item.value);
                      const isActive = selectedIconKey === item.value;

                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() =>
                            form.setFieldValue("iconKey", item.value)
                          }
                          className={[
                            "group rounded-2xl border p-3 text-left transition-all",
                            "hover:-translate-y-0.5 hover:shadow-md",
                            isActive
                              ? "border-[#1677ff] bg-[#eff6ff] shadow-sm"
                              : "border-slate-200 bg-white hover:border-[#91caff]",
                          ].join(" ")}
                        >
                          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-blue-50">
                            <Icon
                              className={
                                isActive
                                  ? "text-xl text-[#1677ff]"
                                  : "text-xl text-slate-600"
                              }
                            />
                          </div>

                          <div className="line-clamp-2 text-sm font-medium text-slate-800">
                            {item.label}
                          </div>
                          <div className="mt-1 text-xs text-slate-400 break-all">
                            {item.value}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default AmenityFormModal;
