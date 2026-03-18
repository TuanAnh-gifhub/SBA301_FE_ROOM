import React, { useEffect, useMemo, useState } from "react";
import { Form, Input, Modal, Select, message } from "antd";
import {
  FileTextOutlined,
  HomeOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import rentalAreasService, {
  type RentalAreaResponse,
} from "../../../services/rental-areas/rentalAreas";
import roomsService, {
  type RoomCardResponse,
} from "../../../services/rooms/rooms";
import postsService, {
  type PostSummaryResponse,
} from "../../../services/posts/posts";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

type RoomOption = { label: string; value: string };

const CreatePostModal: React.FC<Props> = ({ open, onClose, onCreated }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomOptions, setRoomOptions] = useState<RoomOption[]>([]);

  const fetchSelectableRooms = async () => {
    setLoadingRooms(true);
    try {
      const [raRes, postRes] = await Promise.all([
        rentalAreasService.getMyRentalAreas(),
        postsService.getMyPosts(),
      ]);

      const rentalAreas: RentalAreaResponse[] = raRes.result || [];
      const myPosts: PostSummaryResponse[] = postRes.result || [];
      const postedRoomIds = new Set(myPosts.map((p) => p.roomId));

      const roomLists = await Promise.all(
        rentalAreas.map((ra) =>
          roomsService.getRoomsByRentalArea(String(ra.rentalAreaId)),
        ),
      );

      const rooms: RoomCardResponse[] = roomLists.flatMap(
        (x) => x.result || [],
      );

      const selectable = rooms
        .filter((r) => !postedRoomIds.has(r.roomId))
        .sort((a, b) => a.roomName.localeCompare(b.roomName))
        .map((r) => ({
          value: r.roomId,
          label: `${r.roomName} (${r.capacity ?? "-"} người • ${r.price ?? "-"} / giờ)`,
        }));

      setRoomOptions(selectable);
    } catch (e) {
      console.error(e);
      message.error("Không tải được danh sách phòng để tạo bài");
      setRoomOptions([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    fetchSelectableRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const canCreate = useMemo(() => roomOptions.length > 0, [roomOptions]);

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!values.roomId) {
        message.error("Vui lòng chọn phòng");
        return;
      }

      setSaving(true);

      await postsService.createPost({
        roomId: values.roomId,
        title: values.title,
        content: values.content,
      });

      message.success("Tạo tin đăng thành công (chờ duyệt)");
      onCreated();
    } catch (e: any) {
      if (e?.errorFields) return;
      console.error(e);
      message.error(e?.response?.data?.message || "Tạo tin đăng thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      onOk={onSubmit}
      okText="Tạo tin đăng"
      cancelText="Hủy"
      confirmLoading={saving}
      destroyOnClose
      width={720}
      className="[&_.ant-modal-content]:!rounded-3xl [&_.ant-modal-content]:!p-0 [&_.ant-modal-header]:!hidden"
      okButtonProps={{ className: "!rounded-xl !h-10 !font-semibold" }}
      cancelButtonProps={{ className: "!rounded-xl !h-10" }}
    >
      <div className="overflow-hidden rounded-3xl">
        <div className="bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 px-6 py-5 md:px-7">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <FileTextOutlined className="text-xl text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Tạo tin đăng mới</h2>
              <p className="mt-1 text-sm text-white/85">
                Chọn phòng phù hợp và thêm nội dung mô tả để gửi duyệt tin đăng
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 md:px-7">
          <div className="mb-5 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <InfoCircleOutlined className="mt-0.5 text-sky-500" />
              <div>
                Chỉ hiển thị những phòng <b>chưa có tin đăng</b>. Sau khi tạo,
                bài viết sẽ ở trạng thái <b>chờ duyệt</b>.
              </div>
            </div>
          </div>

          <Form form={form} layout="vertical" requiredMark={false}>
            <Form.Item
              name="roomId"
              label={
                <span className="font-medium text-slate-700">
                  Chọn phòng đăng bài
                </span>
              }
              rules={[{ required: true, message: "Chọn phòng" }]}
            >
              <Select
                placeholder={
                  canCreate ? "Chọn phòng phù hợp" : "Không còn phòng khả dụng"
                }
                options={roomOptions}
                loading={loadingRooms}
                disabled={!canCreate}
                showSearch
                size="large"
                suffixIcon={<HomeOutlined className="text-slate-400" />}
                className="[&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!h-11 [&_.ant-select-selection-item]:!leading-[42px] [&_.ant-select-selection-placeholder]:!leading-[42px]"
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>

            <Form.Item
              name="title"
              label={
                <span className="font-medium text-slate-700">Tiêu đề</span>
              }
              rules={[
                { required: true, message: "Nhập tiêu đề" },
                { max: 150, message: "Tối đa 150 ký tự" },
              ]}
            >
              <Input
                placeholder="VD: Phòng học rộng rãi, đầy đủ máy chiếu và điều hòa..."
                className="!h-11 !rounded-xl"
                maxLength={150}
                showCount
              />
            </Form.Item>

            <Form.Item
              name="content"
              label={
                <span className="font-medium text-slate-700">Nội dung</span>
              }
              rules={[{ required: true, message: "Nhập nội dung" }]}
            >
              <Input.TextArea
                rows={6}
                placeholder="Mô tả chi tiết về không gian, tiện ích, vị trí, đối tượng phù hợp..."
                className="!rounded-xl"
                maxLength={2000}
                showCount
              />
            </Form.Item>
          </Form>
        </div>
      </div>
    </Modal>
  );
};

export default CreatePostModal;
