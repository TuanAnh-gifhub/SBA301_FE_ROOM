import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Modal, Select, Upload, message } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { Row, Col, Divider } from "antd";
import categoriesService from "../../../services/categories/categories";
import amenitiesService from "../../../services/amenities/amenities";
import roomsService from "../../../services/rooms/rooms";
import { MdDeleteOutline } from "react-icons/md";

type Props = {
  open: boolean;
  rentalAreaId: string;
  onClose: () => void;
  onCreated: () => void;
};

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
      title="Thêm phòng"
      open={open}
      onCancel={onClose}
      onOk={onSubmit}
      okText="Tạo"
      cancelText="Hủy"
      confirmLoading={saving}
      destroyOnClose
      width={900}
      style={{ top: 10 }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          amenityIds: [],
          roomCodes: [""],
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="roomName"
              label="Tên phòng"
              rules={[{ required: true, message: "Nhập tên phòng" }]}
            >
              <Input placeholder="VD: Phòng học 20 người" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="categoryId" label="Loại phòng">
              <Select
                placeholder="Chọn loại phòng"
                options={categoryOptions}
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>
        <h3>Danh sách mã phòng</h3>
        <div
          style={{
            maxHeight: 200,
            overflowY: "auto",
            paddingRight: 6,
          }}
        >
          <Form.List name="roomCodes">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <Row
                    key={key}
                    gutter={8}
                    align="middle"
                    style={{ marginBottom: 8 }}
                  >
                    {/* INPUT */}
                    <Col span={14}>
                      <Form.Item
                        name={name}
                        rules={[{ required: true, message: "Nhập mã phòng" }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Input placeholder="VD: 301" />
                      </Form.Item>
                    </Col>

                    {/* ACTION */}
                    <Col span={5}>
                      <div className="flex items-center justify-between gap-4">
                        <a onClick={() => add()}>+ Thêm phòng</a>

                        {fields.length > 1 && (
                          <a
                            style={{ color: "red" }}
                            onClick={() => remove(name)}
                            className="flex items-center gap-1"
                          >
                            <MdDeleteOutline size={16} />
                            <span>Xóa</span>
                          </a>
                        )}
                      </div>
                    </Col>
                  </Row>
                ))}
              </>
            )}
          </Form.List>
        </div>
        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={2} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="price" label="Giá / giờ">
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name="capacity" label="Sức chứa">
              <InputNumber style={{ width: "100%" }} min={1} />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name="area" label="Diện tích (m²)">
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="amenityIds" label="Tiện ích">
          <Select
            mode="multiple"
            placeholder="Chọn tiện ích"
            options={amenityOptions}
          />
        </Form.Item>

        <h3>Ảnh phòng</h3>

        <Form.Item required>
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
            {fileList.length >= 5 ? null : "Upload"}
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateRoomModal;
