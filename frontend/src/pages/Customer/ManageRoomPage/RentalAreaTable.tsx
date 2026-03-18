import React from "react";
import { Button, Card, Modal, Tag } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { RentalAreaResponse } from "../../../services/rental-areas/rentalAreas";

type NextStatus = "ACTIVE" | "INACTIVE";

type Props = {
  data: RentalAreaResponse[];
  onAddRoom: (rentalArea: RentalAreaResponse) => void;
  onToggleStatus: (
    rentalArea: RentalAreaResponse,
    nextStatus: NextStatus,
  ) => void;
  onView?: (rentalArea: RentalAreaResponse) => void;
  onEdit?: (rentalArea: RentalAreaResponse) => void;
  onDelete: (rentalArea: RentalAreaResponse) => void;
};

const brandColor = "#1677ff";
const addRoomColor = "#0f766e";
const editColor = "#7c3aed";
const hideColor = "#d97706";
const showColor = "#059669";
const deleteColor = "#dc2626";

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

const statusMeta = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return {
        label: "Đang hoạt động",
        color: "success",
      };
    case "INACTIVE":
      return {
        label: "Ngưng hoạt động",
        color: "default",
      };
    case "SUSPENDED":
      return {
        label: "Bị khóa",
        color: "error",
      };
    default:
      return {
        label: status,
        color: "default",
      };
  }
};

const RentalAreaTable: React.FC<Props> = ({
  data,
  onAddRoom,
  onToggleStatus,
  onView,
  onEdit,
  onDelete,
}) => {
  const confirmDelete = (ra: RentalAreaResponse) => {
    Modal.confirm({
      centered: true,
      title: "Xóa tòa nhà",
      icon: <ExclamationCircleOutlined style={{ color: deleteColor }} />,
      content: (
        <div className="text-gray-600">
          Hành động này <b>không thể hoàn tác</b>. Bạn chắc chắn muốn xóa tòa
          nhà:
          <div className="mt-1 font-semibold text-gray-800 line-clamp-2">
            {ra.rentalAreaName}
          </div>
        </div>
      ),
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: {
        danger: true,
        style: filledButtonStyle(deleteColor),
      },
      onOk: async () => onDelete(ra),
    });
  };

  const confirmToggle = (ra: RentalAreaResponse, next: NextStatus) => {
    const isHide = next === "INACTIVE";
    const actionColor = isHide ? hideColor : showColor;

    Modal.confirm({
      centered: true,
      title: isHide ? "Ngưng hoạt động tòa nhà" : "Kích hoạt tòa nhà",
      icon: <ExclamationCircleOutlined style={{ color: actionColor }} />,
      content: (
        <div className="text-gray-600">
          Bạn chắc chắn muốn <b>{isHide ? "ngưng hoạt động" : "kích hoạt"}</b>:
          <div className="mt-1 font-semibold text-gray-800 line-clamp-2">
            {ra.rentalAreaName}
          </div>
        </div>
      ),
      okText: isHide ? "Ngưng hoạt động" : "Kích hoạt",
      cancelText: "Hủy",
      okButtonProps: {
        style: filledButtonStyle(actionColor),
      },
      onOk: async () => onToggleStatus(ra, next),
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {data.map((ra) => {
        const contact = [ra.contactName, ra.contactPhone]
          .filter(Boolean)
          .join(" • ");

        const canHide = ra.status === "ACTIVE";
        const canShow = ra.status === "INACTIVE";
        const isSuspended = ra.status === "SUSPENDED";
        const status = statusMeta(ra.status);

        return (
          <Card
            key={ra.rentalAreaId}
            className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100"
            styles={{ body: { padding: 16 } }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-slate-800 text-[17px] line-clamp-2 leading-6">
                  {ra.rentalAreaName}
                </div>
                <div className="mt-1 text-sm text-slate-500 line-clamp-2">
                  {ra.address}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {ra.cityName || "—"}
                </div>
              </div>

              <Tag color={status.color as any}>{status.label}</Tag>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-slate-50 px-3 py-3">
                <div className="text-xs text-slate-500">Người liên hệ</div>
                <div className="mt-1 font-medium text-slate-800 line-clamp-1">
                  {ra.contactName || "—"}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 px-3 py-3">
                <div className="text-xs text-slate-500">Số điện thoại</div>
                <div className="mt-1 font-medium text-slate-800 line-clamp-1">
                  {ra.contactPhone || "—"}
                </div>
              </div>
            </div>

            {contact ? (
              <div className="mt-3 text-sm text-slate-500 line-clamp-1">
                Liên hệ:{" "}
                <span className="text-slate-700 font-medium">{contact}</span>
              </div>
            ) : null}

            <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
              <Button
                block
                icon={<EyeOutlined />}
                onClick={() => onView?.(ra)}
                style={softButtonStyle(brandColor)}
                className="rounded-xl font-medium h-10"
              >
                Xem chi tiết
              </Button>

              <Button
                block
                icon={<PlusOutlined />}
                onClick={() => onAddRoom(ra)}
                style={filledButtonStyle(addRoomColor)}
                className="rounded-xl font-medium h-10"
              >
                Thêm phòng
              </Button>

              <Button
                block
                icon={canHide ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                disabled={isSuspended || (!canHide && !canShow)}
                onClick={() =>
                  confirmToggle(ra, canHide ? "INACTIVE" : "ACTIVE")
                }
                style={
                  canHide
                    ? filledButtonStyle(hideColor)
                    : canShow
                      ? filledButtonStyle(showColor)
                      : undefined
                }
                className="rounded-xl font-medium h-10"
              >
                {canHide ? "Ẩn tòa nhà" : "Hiện tòa nhà"}
              </Button>

              <Button
                block
                icon={<EditOutlined />}
                onClick={() => onEdit?.(ra)}
                style={softButtonStyle(editColor)}
                className="rounded-xl font-medium h-10"
              >
                Chỉnh sửa
              </Button>

              <Button
                block
                icon={<DeleteOutlined />}
                danger
                onClick={() => confirmDelete(ra)}
                style={softButtonStyle(deleteColor)}
                className="rounded-xl font-medium h-10 col-span-2"
              >
                Xóa tòa nhà
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default RentalAreaTable;
