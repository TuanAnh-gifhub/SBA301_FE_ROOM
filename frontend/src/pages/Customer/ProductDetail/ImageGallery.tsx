import React, { useMemo, useState } from "react";
import { Button, Empty } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  PlayCircleFilled,
} from "@ant-design/icons";

type GalleryImage = {
  id: string;
  imageUrl: string;
  isCover?: boolean;
  sortOrder?: number;
};

type Props = {
  title?: string;
  images: GalleryImage[];
};

const ImageGallery: React.FC<Props> = ({ title, images }) => {
  const validImages = useMemo(
    () => (images || []).filter((x) => !!x?.imageUrl),
    [images],
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    if (!validImages.length) return;
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (!validImages.length) return;
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  if (!validImages.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <Empty description="Không có hình ảnh" />
      </div>
    );
  }

  const current = validImages[currentIndex];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="relative rounded-xl overflow-hidden bg-gray-100">
        <img
          src={current.imageUrl}
          alt={title || "room-image"}
          className="w-full h-[520px] object-cover"
        />

        <Button
          shape="circle"
          icon={<LeftOutlined />}
          className="!absolute !left-5 !top-1/2 !-translate-y-1/2 shadow"
          onClick={handlePrev}
        />

        <Button
          shape="circle"
          icon={<RightOutlined />}
          className="!absolute !right-5 !top-1/2 !-translate-y-1/2 shadow"
          onClick={handleNext}
        />

        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1}/{validImages.length}
        </div>
      </div>

      {validImages.length > 1 && (
        <div className="mt-4 flex items-center gap-3 overflow-x-auto">
          {validImages.map((img, idx) => {
            const active = idx === currentIndex;
            return (
              <button
                key={img.id || idx}
                onClick={() => setCurrentIndex(idx)}
                className={`shrink-0 rounded-xl overflow-hidden border-2 transition ${
                  active ? "border-[#4da6ff]" : "border-transparent"
                }`}
              >
                <img
                  src={img.imageUrl}
                  alt={`${title || "thumb"}-${idx}`}
                  className="w-[120px] h-[76px] object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
