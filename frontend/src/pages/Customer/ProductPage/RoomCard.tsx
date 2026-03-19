import React, { useMemo } from "react";
import { Button, Card, Tag, Typography } from "antd";
import { EnvironmentOutlined, TeamOutlined } from "@ant-design/icons";
import type { RoomCardItem } from "./types";

const { Text } = Typography;

const formatVND = (value?: number | string | null) => {
  if (value == null) return "";
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return "";

  return n.toLocaleString("vi-VN") + " VNĐ";
};

type Props = {
  item: RoomCardItem;
  onView: (postId: string) => void;
};

const RoomCard: React.FC<Props> = ({ item, onView }) => {
  const priceLabel = useMemo(() => formatVND(item.price), [item.price]);

  return (
    <Card
      hoverable
      className="shadow-sm rounded-xl overflow-hidden"
      cover={
        <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
          {item.coverImageUrl ? (
            <img
              src={item.coverImageUrl}
              alt={item.title}
              className="h-44 w-full object-cover"
            />
          ) : (
            <div className="h-44 w-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}

          {item.price != null ? (
            <Tag
              className="absolute top-2 right-2 border-0"
              style={{
                background: "#4da6ff",
                color: "white",
                fontWeight: 600,
                borderRadius: 8,
                padding: "2px 8px",
              }}
            >
              {priceLabel}/giờ
            </Tag>
          ) : null}
        </div>
      }
      bodyStyle={{ padding: 14 }}
    >
      <div className="min-h-[84px]">
        <div className="font-semibold text-gray-800 line-clamp-2">
          {item.title}
        </div>

        <div className="mt-1 flex items-center gap-2 text-gray-500 text-sm">
          <EnvironmentOutlined />
          <Text className="text-gray-500">
            {item.city || item.rentalAreaName || "—"}
          </Text>
        </div>

        <div className="mt-2 flex items-center gap-2 text-gray-600 text-sm">
          <TeamOutlined />
          <span>
            {item.capacity != null ? `${item.capacity} người` : "Chưa cập nhật"}
          </span>
        </div>

        {item.price != null && (
          <div className="mt-2 flex items-end justify-end gap-1">
            <span className="text-lg font-bold" style={{ color: "#4da6ff" }}>
              {priceLabel}
            </span>
            <span className="text-gray-500 text-sm">/giờ</span>
          </div>
        )}
      </div>

      <Button
        block
        className="mt-3"
        style={{
          borderColor: "#4da6ff",
          color: "#4da6ff",
          fontWeight: 600,
          borderRadius: 10,
        }}
        onClick={() => onView(item.rentalAreaId)}
      >
        Xem chi tiết
      </Button>
    </Card>
  );
};

export default RoomCard;
