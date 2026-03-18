import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Drawer,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  Select,
  Skeleton,
  Tag,
  Upload,
  message,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import {
  AppstoreOutlined,
  PictureOutlined,
  ReadOutlined,
  SaveOutlined,
  TagOutlined,
} from "@ant-design/icons";

import roomsService, {
  type RoomResponse,
  type RoomStatus,
} from "../../../services/rooms/rooms";
import categoriesService from "../../../services/categories/categories";
import amenitiesService from "../../../services/amenities/amenities";

type Props = {
  open: boolean;
  roomId: string | null;
  mode: "view" | "edit";
  onClose: () => void;
  onUpdated: () => void;
};

const brandColor = "#1677ff";

const statusMeta = (s: RoomStatus) => {
  if (s === "ACTIVE") {
    return { color: "green", label: "Đang hoạt động" };
  }
  if (s === "HIDDEN") {
    return { color: "gold", label: "Đang ẩn" };
  }
  if (s === "INACTIVE") {
    return { color: "red", label: "Ngưng hoạt động" };
  }
  return { color: "blue", label: s };
};

const formatVND = (value?: number | string | null) => {
  if (value === null || value === undefined) return null;
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return null;

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(num);
};

const sectionTitleClass = "text-sm font-semibold text-slate-800 mb-3";
const cardClass = "rounded-2xl border border-slate-100 bg-slate-50 p-4";

const RoomDetailDrawer: React.FC<Props> = ({
  open,
  roomId,
  mode,
  onClose,
  onUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<RoomResponse | null>(null);
  const [form] = Form.useForm();

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [amenityOptions, setAmenityOptions] = useState<
    { label: string; value: number }[]
  >([]);

  const isEdit = mode === "edit";

  const fetchOptions = async () => {
    try {
      const [cRes, aRes] = await Promise.all([
        categoriesService.getAllCategories(),
        amenitiesService.getAllAmenities(),
      ]);

      setCategoryOptions(
        (cRes.result || [])
          .slice()
          .sort((a, b) => a.categoryName.localeCompare(b.categoryName))
          .map((c) => ({ label: c.categoryName, value: c.categoryId })),
      );

      setAmenityOptions(
        (aRes.result || [])
          .slice()
          .sort((a, b) => a.amenityName.localeCompare(b.amenityName))
          .map((a) => ({ label: a.amenityName, value: a.amenityId })),
      );
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDetail = async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      const res = await roomsService.getRoomDetail(roomId);
      const room = res.result;
      setData(room);

      form.setFieldsValue({
        roomName: room.roomName,
        description: room.description,
        price: room.price,
        capacity: room.capacity,
        area: room.area,
        categoryId: room.categoryId,
        amenityIds: (room.amenities || []).map((a) => a.amenityId),
      });

      setFileList([]);
    } catch (e: any) {
      console.error(e);
      message.error(
        e?.response?.data?.message || "Không tải được chi tiết phòng",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    fetchOptions();
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, roomId]);

  const status = useMemo(
    () => (data ? statusMeta(data.roomStatus) : null),
    [data],
  );

  const amenityNames = useMemo(
    () => data?.amenities?.map((a) => a.amenityName).filter(Boolean) || [],
    [data],
  );

  const sortedImages = useMemo(() => {
    return (data?.images || [])
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [data]);

  const onSave = async () => {
    if (!roomId) return;

    try {
      const values = await form.validateFields();
      const images = fileList
        .map((f) => f.originFileObj)
        .filter(Boolean) as File[];

      setSaving(true);

      const payload = {
        roomName: values.roomName,
        description: values.description,
        price: values.price,
        capacity: values.capacity,
        area: values.area,
        categoryId: values.categoryId,
        amenityIds: values.amenityIds,
        replaceImages: images.length > 0,
      };

      const updated = await roomsService.updateRoom(
        roomId,
        payload,
        images.length ? images : undefined,
      );

      setData(updated.result);
      message.success("Cập nhật phòng thành công");
      onUpdated();
      await fetchDetail();
    } catch (e: any) {
      if (e?.errorFields) return;
      console.error(e);
      message.error(e?.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      title={null}
      open={open}
      width={860}
      onClose={onClose}
      destroyOnClose
      styles={{
        body: {
          padding: 20,
          background: "#f8fafc",
        },
      }}
      extra={
        isEdit ? (
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={onSave}
            className="rounded-xl font-medium"
            style={{
              background: brandColor,
              borderColor: brandColor,
              boxShadow: "0 8px 20px rgba(22,119,255,0.16)",
            }}
          >
            Lưu thay đổi
          </Button>
        ) : null
      }
    >
      {loading ? (
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      ) : !data ? (
        <div className="rounded-3xl bg-white p-10 shadow-sm">
          <Empty description="Không có dữ liệu phòng" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-3xl overflow-hidden border border-slate-100 bg-white shadow-sm">
            <div className="px-6 py-6 bg-gradient-to-r from-[#eff6ff] via-white to-[#f8fafc] border-b border-slate-100">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#1677ff]/10 flex items-center justify-center shrink-0">
                      <ReadOutlined
                        style={{ color: "#1677ff", fontSize: 20 }}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="text-xl font-semibold text-slate-800 line-clamp-2">
                        {data.roomName}
                      </div>
                      <div className="text-sm text-slate-500">
                        {data.categoryName || "Chưa chọn loại phòng"}
                      </div>
                    </div>
                  </div>

                  {data.description ? (
                    <div className="mt-3 text-sm text-slate-600 line-clamp-3">
                      {data.description}
                    </div>
                  ) : (
                    <div className="mt-3 text-sm text-slate-400">
                      Chưa có mô tả cho phòng này
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  <Tag
                    color={status?.color as any}
                    className="px-3 py-1 text-sm"
                  >
                    {status?.label}
                  </Tag>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                  <div className="text-xs text-slate-500">Giá / giờ</div>
                  <div className="mt-1 font-semibold text-slate-800">
                    {formatVND(data.price) || "—"}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                  <div className="text-xs text-slate-500">Sức chứa</div>
                  <div className="mt-1 font-semibold text-slate-800">
                    {data.capacity != null ? `${data.capacity} người` : "—"}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                  <div className="text-xs text-slate-500">Diện tích</div>
                  <div className="mt-1 font-semibold text-slate-800">
                    {data.area != null ? `${data.area} m²` : "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className={sectionTitleClass}>Ảnh phòng</div>

              {sortedImages.length ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {sortedImages.map((img) => (
                    <div
                      key={img.roomImageId}
                      className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50"
                    >
                      <Image
                        src={img.imageUrl}
                        height={160}
                        className="!w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-slate-400">
                  <PictureOutlined className="mr-2" />
                  Chưa có ảnh phòng
                </div>
              )}
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            disabled={!isEdit}
            initialValues={{ amenityIds: [] }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className={cardClass}>
                <div className={sectionTitleClass}>Thông tin cơ bản</div>

                <Form.Item
                  name="roomName"
                  label="Tên phòng"
                  rules={[{ required: true, message: "Nhập tên phòng" }]}
                >
                  <Input
                    size="large"
                    prefix={<ReadOutlined className="text-slate-400" />}
                    placeholder="VD: Phòng A101"
                    className="rounded-xl"
                  />
                </Form.Item>

                <Form.Item name="categoryId" label="Loại phòng">
                  <Select
                    size="large"
                    placeholder="Chọn loại phòng"
                    options={categoryOptions}
                    allowClear
                    className="rounded-xl"
                  />
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                  <Input.TextArea
                    rows={5}
                    placeholder="Mô tả chi tiết..."
                    className="rounded-xl"
                  />
                </Form.Item>
              </div>

              <div className={cardClass}>
                <div className={sectionTitleClass}>Thông số phòng</div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Form.Item name="price" label="Giá / giờ">
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      size="large"
                      placeholder="0"
                    />
                  </Form.Item>

                  <Form.Item name="capacity" label="Sức chứa">
                    <InputNumber
                      style={{ width: "100%" }}
                      min={1}
                      size="large"
                      placeholder="0"
                    />
                  </Form.Item>

                  <Form.Item name="area" label="Diện tích (m²)">
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      size="large"
                      placeholder="0"
                    />
                  </Form.Item>
                </div>

                <Form.Item name="amenityIds" label="Tiện ích">
                  <Select
                    mode="multiple"
                    placeholder="Chọn tiện ích"
                    options={amenityOptions}
                    className="rounded-xl"
                  />
                </Form.Item>

                {!isEdit && (
                  <div className="rounded-xl bg-white border border-dashed border-slate-200 px-4 py-3">
                    <div className="flex items-center gap-2 text-slate-700 font-medium mb-2">
                      <AppstoreOutlined className="text-[#1677ff]" />
                      Danh sách tiện ích
                    </div>

                    {amenityNames.length ? (
                      <div className="flex flex-wrap gap-2">
                        {amenityNames.map((name) => (
                          <Tag
                            key={name}
                            className="px-3 py-1 rounded-full border-slate-200 text-slate-600 bg-slate-50"
                          >
                            <span className="inline-flex items-center gap-1">
                              <TagOutlined />
                              {name}
                            </span>
                          </Tag>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-400">
                        Chưa có tiện ích nào
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {isEdit && (
              <div className={`${cardClass} mt-4`}>
                <div className={sectionTitleClass}>Cập nhật ảnh phòng</div>

                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  beforeUpload={() => false}
                  onChange={({ fileList: next }) =>
                    setFileList(next.slice(0, 5))
                  }
                >
                  {fileList.length >= 5 ? null : (
                    <div className="flex flex-col items-center justify-center">
                      <PictureOutlined />
                      <div className="mt-2">Tải ảnh lên</div>
                    </div>
                  )}
                </Upload>

                <div className="text-xs text-slate-500 mt-2">
                  Upload ảnh mới sẽ <b>thay toàn bộ ảnh cũ</b>. Chọn tối đa 5
                  ảnh.
                </div>
              </div>
            )}
          </Form>
        </div>
      )}
    </Drawer>
  );
};

export default RoomDetailDrawer;
