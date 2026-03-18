import React from "react";
import { EnvironmentOutlined } from "@ant-design/icons";

type Props = {
  rental: {
    rentalAreaName?: string;
    address?: string;
    description?: string;
  };
};

const RentalInfo: React.FC<Props> = ({ rental }) => {
  return (
    <div>
      <div className="text-3xl font-bold text-gray-800">
        {rental?.rentalAreaName || "Khu vực cho thuê"}
      </div>

      <div className="mt-2 flex items-start gap-2 text-gray-500">
        <EnvironmentOutlined className="mt-1 text-[#4da6ff]" />
        <span>{rental?.address || "Chưa cập nhật địa chỉ"}</span>
      </div>

      <div className="border-t pt-4 mt-4">
        <div className="text-xl font-bold text-gray-800 mb-3">Mô tả</div>
        <div className="text-gray-700 leading-7">
          {rental?.description ||
            "Không gian học tập hiện đại, đầy đủ tiện nghi, phù hợp học nhóm, workshop và meeting."}
        </div>
      </div>
    </div>
  );
};

export default RentalInfo;
