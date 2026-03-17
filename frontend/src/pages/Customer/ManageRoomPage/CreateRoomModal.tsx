import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Upload,
  message,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import {
  AppstoreOutlined,
  DeleteOutlined,
  PlusOutlined,
  PictureOutlined,
  ReadOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import categoriesService from "../../../services/categories/categories";
import amenitiesService from "../../../services/amenities/amenities";
import roomsService from "../../../services/rooms/rooms";

type Props = {
  open: boolean;
  rentalAreaId: string;
  onClose: () => void;
  onCreated: () => void;
};

const sectionTitleClass = "text-sm font-semibold text-slate-800 mb-3";
const cardClass = "rounded-2xl border border-slate-100 bg-slate-50 p-4";

const CreateRoomModal: React.FC<Props> = ({
  open,
  rentalAreaId,
  onClose,
  onCreated,
}) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [amenityOptions, setAmenityOptions] = useState<
    { label: string; value: number }[]
  >([]);

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

  useEffect(() => {
    if (!open) return;
    fetchOptions();
    form.resetFields();
    setFileList([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onClose();
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();

      const images = fileList
        .filter((f) => f.status !== "removed")
        .map((f) => f.originFileObj)
        .filter(Boolean) as File[];

      if (images.length < 1 || images.length > 5) {
        message.error("Vui lòng upload từ 1 đến 5 ảnh");
        return;
      }

      setSaving(true);

      await roomsService.createRoom(rentalAreaId, {
        roomName: values.roomName,
        description: values.description,
        price: values.price,
        capacity: values.capacity,
        area: values.area,
        categoryId: values.categoryId,
        amenityIds: values.amenityIds,
        images,
        roomCodes: values.roomCodes,
      });

      message.success("Tạo phòng thành công");
      form.resetFields();
      setFileList([]);
      onCreated();
    } catch (e: any) {
      if (e?.errorFields) return;
      console.error(e);
      message.error(e?.response?.data?.message || "Tạo phòng thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={
        <div>
          <div className="text-lg font-semibold text-slate-800">
            Thêm phòng học
          </div>
          <div className="text-sm text-slate-500 font-normal">
            Tạo phòng mới và gán danh sách mã phòng nhanh chóng
          </div>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      onOk={onSubmit}
      okText="Tạo phòng"
      cancelText="Hủy"
      confirmLoading={saving}
      destroyOnClose
      width={1000}
      style={{ top: 12 }}
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
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          amenityIds: [],
          roomCodes: [""],
        }}
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
                placeholder="VD: Phòng học 20 người"
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
                rows={4}
                placeholder="Mô tả ngắn về phòng, thiết bị, không gian học..."
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

            <div className="rounded-xl bg-white border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
              <div className="flex items-center gap-2 font-medium text-slate-700 mb-1">
                <AppstoreOutlined className="text-[#1677ff]" />
                Gợi ý
              </div>
              <span>
                Bạn có thể thêm nhiều tiện ích để phòng hiển thị hấp dẫn hơn với
                người dùng.
              </span>
            </div>
          </div>
        </div>

        <div className={`${cardClass} mt-4`}>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <div className={sectionTitleClass + " mb-1"}>
                Danh sách mã phòng
              </div>
              <div className="text-sm text-slate-500">
                Thêm các mã phòng tương ứng trong cùng một loại phòng
              </div>
            </div>
          </div>

          <Form.List name="roomCodes">
            {(fields, { add, remove }) => (
              <>
                <div className="space-y-3">
                  {fields.map(({ key, name }) => (
                    <div
                      key={key}
                      className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-start"
                    >
                      <Form.Item
                        name={name}
                        rules={[{ required: true, message: "Nhập mã phòng" }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Input
                          size="large"
                          prefix={<TagsOutlined className="text-slate-400" />}
                          placeholder="VD: A101, B202, P301..."
                          className="rounded-xl"
                        />
                      </Form.Item>

                      <div className="flex items-center gap-2">
                        {fields.length > 1 && (
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                            className="rounded-xl h-10"
                          >
                            Xóa
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => add()}
                  className="mt-4 rounded-xl h-10"
                >
                  Thêm mã phòng
                </Button>
              </>
            )}
          </Form.List>
        </div>

        <div className={`${cardClass} mt-4`}>
          <div className={sectionTitleClass}>Ảnh phòng</div>

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
                <PictureOutlined />
                <div className="mt-2">Tải ảnh lên</div>
              </div>
            )}
          </Upload>

          <div className="text-xs text-slate-500 mt-2">
            Chọn từ <b>1 đến 5 ảnh</b> để hiển thị đẹp hơn trong danh sách
            phòng.
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateRoomModal;
