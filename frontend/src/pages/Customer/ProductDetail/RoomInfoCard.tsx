import React from "react";
import { Card, Tag } from "antd";

type Props = {
  roomName?: string;
  categoryName?: string;
  capacity?: number;
  area?: number;
  roomStatus?: string;
  roomCount?: number;
};

const getStatusColor = (status?: string) => {
  switch ((status || "").toUpperCase()) {
    case "ACTIVE":
      return "green";
    case "INACTIVE":
      return "default";
    default:
      return "blue";
  }
};

const RoomInfoCard: React.FC<Props> = ({
  roomName,
  categoryName,
  capacity,
  area,
  roomStatus,
}) => {
  return (
    <Card className="shadow-sm rounded-xl">
      <div className="text-xl font-bold text-gray-800 mb-4">
        Thông tin phòng
      </div>

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <span className="text-gray-500">Tên phòng</span>
          <span className="font-semibold text-gray-800 text-right">
            {roomName || "—"}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <span className="text-gray-500">Loại phòng</span>
          <span className="font-semibold text-gray-800 text-right">
            {categoryName || "—"}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <span className="text-gray-500">Sức chứa</span>
          <span className="font-semibold text-gray-800 text-right">
            {capacity != null ? `${capacity} người` : "—"}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <span className="text-gray-500">Diện tích</span>
          <span className="font-semibold text-gray-800 text-right">
            {area != null ? `${area} m²` : "—"}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <span className="text-gray-500">Trạng thái</span>
          <Tag color={getStatusColor(roomStatus)} className="mr-0">
            {roomStatus || "—"}
          </Tag>
        </div>
      </div>
    </Card>
  );
};

export default RoomInfoCard;
