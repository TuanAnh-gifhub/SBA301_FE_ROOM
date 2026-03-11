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
          <div className="text-sm text-green-600 mt-1">Đang hoạt động</div>
          <div className="text-sm text-gray-500 mt-1">{rentalAreaName}</div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center gap-2 text-gray-700">
          <PhoneOutlined />
          <span>{contactPhone || "Chưa cập nhật số điện thoại"}</span>
        </div>
      </div>

      <div className="mt-5">
        <div className="font-semibold text-gray-800 mb-3">Chat nhanh:</div>
        <div className="flex flex-wrap gap-2">
          <Button shape="round" icon={<MessageOutlined />}>
            Phòng này còn không ạ?
          </Button>
          <Button shape="round">Thời hạn thuê thế nào?</Button>
        </div>
      </div>
    </Card>
  );
};

export default OwnerCard;
