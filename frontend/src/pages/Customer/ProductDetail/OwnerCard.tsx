import React from "react";
import { Avatar, Button, Card } from "antd";
import {
  MessageOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";

type Props = {
  ownerName?: string;
  contactName?: string;
  contactPhone?: string;
  rentalAreaName?: string;
};

const OwnerCard: React.FC<Props> = ({
  ownerName,
  contactName,
  contactPhone,
  rentalAreaName,
}) => {
  const displayName = contactName || ownerName || "Chủ phòng";

  return (
    <Card className="shadow-sm rounded-xl">
      <div className="flex items-start gap-4">
        <Avatar size={56} icon={<UserOutlined />} />
        <div className="flex-1">
          <div className="text-xl font-bold text-gray-800">{displayName}</div>
          <div className="flex items-center gap-2 text-gray-700">
            <PhoneOutlined />
            <span>{contactPhone || "Chưa cập nhật số điện thoại"}</span>
          </div>
          <div className="text-sm text-green-600 mt-1">Đang hoạt động</div>
          <div className="text-sm text-gray-500 mt-1">{rentalAreaName}</div>
        </div>
      </div>
    </Card>
  );
};

export default OwnerCard;
