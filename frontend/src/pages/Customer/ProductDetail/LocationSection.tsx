import React from "react";
import { Card } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";

type Props = {
  rentalAreaName?: string;
  address?: string;
  cityName?: string;
};

const LocationSection: React.FC<Props> = ({
  rentalAreaName,
  address,
  cityName,
}) => {
  const fullAddress = [address, cityName].filter(Boolean).join(", ");

  return (
    <Card className="shadow-sm rounded-xl">
      <div className="text-2xl font-bold text-gray-800 mb-5">Vị Trí</div>

      <div className="flex items-start gap-3 mb-4">
        <div className="text-[#4da6ff] text-2xl mt-1">
          <EnvironmentOutlined />
        </div>

        <div>
          <div className="text-xl font-semibold text-gray-800">
            {fullAddress || "Chưa cập nhật địa chỉ"}
          </div>
          {rentalAreaName ? (
            <div className="text-gray-500 mt-1">{rentalAreaName}</div>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-gray-200">
        <iframe
          title="room-location"
          width="100%"
          height="320"
          loading="lazy"
          style={{ border: 0 }}
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${encodeURIComponent(
            fullAddress || rentalAreaName || "Ho Chi Minh City",
          )}&output=embed`}
        />
      </div>
    </Card>
  );
};

export default LocationSection;
