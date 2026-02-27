import { Table, Select, Button, Tag } from "antd";
import { useState } from "react";
import QuantitySelect from "./QuantitySelect";

const { Option } = Select;
interface Props {
  rooms: any[];
  onQuantityChange: (room: any, qty: number) => void;
}

export default function RoomListPage({ rooms, onQuantityChange }: Props) {
  const columns = [
    {
      title: "Loại phòng",
      dataIndex: "roomName",
      key: "roomName",
      render: (_: any, room: any) => (
        <div>
          <h3 style={{ color: "#1677ff", fontWeight: 600 }}>{room.roomName}</h3>
          <div>Diện tích: {room.area || 20} m²</div>
        </div>
      ),
    },

    {
      title: "Tiện ích & sức chứa",
      key: "facility",
      render: (_: any, room: any) => (
        <div>
          <div>Sức chứa: {room.capacity} người</div>
          {room.amenities?.map((amenity: any) => (
            <div key={amenity.amenityId}> {amenity.amenityName}</div>
          ))}
        </div>
      ),
    },

    {
      title: "Giá hôm nay",
      key: "price",
      render: (_: any, room: any) => (
        <div>
          <h3 style={{ color: "#389e0d" }}>
            {room.price.toLocaleString()} VND
          </h3>
          <Tag color="green">Đã bao gồm thuế</Tag>
        </div>
      ),
    },

    {
      title: "Chọn phòng",
      key: "quantity",
      render: (_: any, room: any) => (
        <QuantitySelect
          room={room}
          onChange={(qty) => onQuantityChange(room, qty)}
        />
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={rooms}
      rowKey="roomId"
      pagination={false}
      bordered
    />
  );
}
