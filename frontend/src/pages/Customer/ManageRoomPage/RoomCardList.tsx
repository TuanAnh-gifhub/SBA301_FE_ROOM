import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Empty,
  Image,
  Modal,
  Skeleton,
  Tag,
  message,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import roomsService, {
  type RoomCardResponse,
  type RoomStatus,
} from "../../../services/rooms/rooms";
import RoomDetailDrawer from "./RoomDetailDrawer";

type Props = {
  rentalAreaId: string;
  onChanged?: () => void;
};

const brandColor = "#1677ff";
const hideColor = "#d97706";
const showColor = "#059669";
const editColor = "#7c3aed";
const deleteColor = "#dc2626";

const statusTagColor = (s: RoomStatus) => {
  if (s === "ACTIVE") return "green";
  if (s === "HIDDEN") return "gold";
  if (s === "INACTIVE") return "red";
  return "blue";
};

const filledButtonStyle = (bg: string) => ({
  background: bg,
  borderColor: bg,
  color: "#fff",
  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
});

const softButtonStyle = (color: string) => ({
  color,
  borderColor: color,
  background: "#fff",
});

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

const RoomCardList: React.FC<Props> = ({ rentalAreaId, onChanged }) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<RoomCardResponse[]>([]);

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("view");

  const fetchList = async () => {
    if (!rentalAreaId) return;
    setLoading(true);
    try {
      const res = await roomsService.getRoomsByRentalArea(rentalAreaId);
      setItems(res.result || []);
    } catch (e: any) {
      console.error(e);
      message.error(
        e?.response?.data?.message || "Không tải được danh sách phòng",
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [rentalAreaId]);

  const openDrawer = (roomId: string, mode: "view" | "edit") => {
    setSelectedRoomId(roomId);
    setDrawerMode(mode);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedRoomId(null);
  };

  const confirmToggleStatus = (room: RoomCardResponse) => {
    const next = room.roomStatus === "ACTIVE" ? "HIDDEN" : "ACTIVE";
    const isHide = next === "HIDDEN";
    const actionColor = isHide ? hideColor : showColor;

    Modal.confirm({
      centered: true,
      title: isHide ? "Ẩn phòng học" : "Hiện phòng học",
      icon: <ExclamationCircleOutlined style={{ color: actionColor }} />,
      content: (
        <div className="text-gray-600">
          Bạn chắc chắn muốn <b>{isHide ? "ẩn" : "hiện"}</b> phòng:
          <div className="mt-1 font-semibold text-gray-800 line-clamp-2">
            {room.roomName}
          </div>
        </div>
      ),
      okText: isHide ? "Ẩn phòng" : "Hiện phòng",
      cancelText: "Hủy",
      okButtonProps: {
        style: filledButtonStyle(actionColor),
      },
      onOk: async () => {
        try {
          await roomsService.updateRoomStatus(room.roomId, next);
          message.success("Cập nhật trạng thái thành công");
          await fetchList();
          onChanged?.();
        } catch (e: any) {
          console.error(e);
          message.error(
            e?.response?.data?.message || "Cập nhật trạng thái thất bại",
          );
        }
      },
    });
  };

  const confirmDelete = (room: RoomCardResponse) => {
    Modal.confirm({
      centered: true,
      title: "Xóa phòng học",
      icon: <ExclamationCircleOutlined style={{ color: deleteColor }} />,
      content: (
        <div className="text-gray-600">
          Hành động này <b>không thể hoàn tác</b>. Bạn chắc chắn muốn xóa phòng:
          <div className="mt-1 font-semibold text-gray-800 line-clamp-2">
            {room.roomName}
          </div>
        </div>
      ),
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: {
        danger: true,
        style: filledButtonStyle(deleteColor),
      },
      onOk: async () => {
        try {
          await roomsService.deleteRoom(room.roomId);
          message.success("Xóa phòng thành công");
          await fetchList();
          onChanged?.();
        } catch (e: any) {
          console.error(e);
          message.error(e?.response?.data?.message || "Xóa phòng thất bại");
        }
      },
    });
  };

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="rounded-2xl">
              <Skeleton active paragraph={{ rows: 4 }} />
            </Card>
          ))}
        </div>
      );
    }

    if (!items.length) {
      return (
        <div className="py-12">
          <Empty
            description="Chưa có phòng nào trong tòa nhà này"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((r) => {
          const priceText = formatVND(r.price);
          const roomCount = r.roomCopyResponseList?.length ?? 0;
          const canHide = r.roomStatus === "ACTIVE";
          const canShow = r.roomStatus === "HIDDEN";

          return (
            <Card
              key={r.roomId}
              className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100"
              styles={{ body: { padding: 16 } }}
              cover={
                r.coverImageUrl ? (
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <Image
                      src={r.coverImageUrl}
                      preview={false}
                      className="!h-48 !w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <Tag color={statusTagColor(r.roomStatus)}>
                        {r.roomStatus}
                      </Tag>
                    </div>
                    {priceText ? (
                      <div
                        className="absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-semibold shadow"
                        style={{
                          background: "rgba(22,119,255,0.95)",
                          color: "#fff",
                        }}
                      >
                        {priceText}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="h-48 w-full bg-slate-100 flex items-center justify-center text-slate-400">
                    Không có ảnh
                  </div>
                )
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 text-[16px] line-clamp-2 leading-6">
                    {r.roomName}
                  </div>
                  <div className="mt-1 text-sm text-slate-500 line-clamp-2">
                    {r.description || "Phòng học tiêu chuẩn"}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <div className="text-xs text-slate-500">Sức chứa</div>
                  <div className="font-semibold text-slate-800">
                    {r.capacity ?? "—"} người
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <div className="text-xs text-slate-500">Giá</div>
                  <div className="font-semibold text-slate-800">
                    {priceText ?? "—"}
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <div className="text-xs text-slate-500">Số phòng</div>
                  <div className="font-semibold text-slate-800">
                    {roomCount}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                <Button
                  block
                  icon={<EyeOutlined />}
                  onClick={() => openDrawer(r.roomId, "view")}
                  style={softButtonStyle(brandColor)}
                  className="col-span-2 rounded-xl font-medium h-11"
                >
                  Xem chi tiết
                </Button>

                <Button
                  block
                  icon={<EditOutlined />}
                  onClick={() => openDrawer(r.roomId, "edit")}
                  style={softButtonStyle(editColor)}
                  className="rounded-xl font-medium h-10"
                >
                  Chỉnh sửa
                </Button>

                <Button
                  block
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => confirmDelete(r)}
                  style={softButtonStyle(deleteColor)}
                  className="rounded-xl font-medium h-10"
                >
                  Xóa
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    );
  }, [items, loading]);

  return (
    <>
      {content}

      <RoomDetailDrawer
        open={drawerOpen}
        roomId={selectedRoomId}
        mode={drawerMode}
        onClose={closeDrawer}
        onUpdated={async () => {
          await fetchList();
          onChanged?.();
        }}
      />
    </>
  );
};

export default RoomCardList;
