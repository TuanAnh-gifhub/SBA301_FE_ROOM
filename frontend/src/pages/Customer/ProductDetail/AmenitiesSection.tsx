import React from "react";
import { Card, Empty } from "antd";
import {
  FaVideo,
  FaVolumeUp,
  FaChalkboard,
  FaFan,
  FaWifi,
  FaSnowflake,
  FaLightbulb,
  FaDesktop,
  FaPrint,
  FaMicrophone,
  FaCog,
} from "react-icons/fa";

type AmenityItem = {
  amenityId: number;
  amenityName: string;
  iconKey?: string | null;
};

type Props = {
  amenities: AmenityItem[];
};

const iconMap: Record<string, React.ReactNode> = {
  FaVideo: <FaVideo />,
  FaVolumeUp: <FaVolumeUp />,
  FaChalkboard: <FaChalkboard />,
  FaFan: <FaFan />,
  FaWifi: <FaWifi />,
  FaSnowflake: <FaSnowflake />,
  FaLightbulb: <FaLightbulb />,
  FaDesktop: <FaDesktop />,
  FaPrint: <FaPrint />,
  FaMicrophone: <FaMicrophone />,
};

const getAmenityIcon = (iconKey?: string | null) => {
  if (!iconKey) return <FaCog />;
  return iconMap[iconKey] || <FaCog />;
};

const AmenitiesSection: React.FC<Props> = ({ amenities }) => {
  return (
    <Card className="shadow-sm rounded-xl">
      <div className="text-2xl font-bold text-gray-800 mb-5">
        Trang Thiết Bị & Tiện Ích
      </div>

      {!amenities?.length ? (
        <Empty description="Chưa có tiện ích" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {amenities.map((item) => (
            <div
              key={item.amenityId}
              className="border border-gray-200 rounded-xl h-[110px] flex flex-col items-center justify-center text-center bg-white"
            >
              <div className="text-3xl text-[#4da6ff] mb-2">
                {getAmenityIcon(item.iconKey)}
              </div>
              <div className="text-gray-700 font-medium px-3">
                {item.amenityName}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default AmenitiesSection;
