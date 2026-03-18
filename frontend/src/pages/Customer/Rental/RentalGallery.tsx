import React, { useMemo, useState } from "react";
import { Button, Empty } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

type RentalImage = {
  rentalAreaImageId?: string;
  imageUrl: string;
  isCover?: boolean;
  sortOrder?: number;
};

type Props = {
  rental: {
    rentalAreaName?: string;
    images?: RentalImage[];
  };
};

const sortImages = (items: RentalImage[] = []) => {
  return [...items].sort((a, b) => {
    if ((a.isCover ? 1 : 0) !== (b.isCover ? 1 : 0)) {
      return (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0);
    }
    return (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999);
  });
};

const RentalGallery: React.FC<Props> = ({ rental }) => {
  const images = useMemo(
    () => sortImages(rental?.images || []).filter((x) => !!x?.imageUrl),
    [rental],
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    if (!images.length) return;
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (!images.length) return;
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!images.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <Empty description="Không có hình ảnh" />
      </div>
    );
  }

  const current = images[currentIndex];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="relative rounded-xl overflow-hidden bg-gray-100">
        <img
          src={current.imageUrl}
          alt={rental?.rentalAreaName || "rental-image"}
          className="w-full h-[420px] md:h-[520px] object-cover"
        />

        {images.length > 1 && (
          <>
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
              {currentIndex + 1}/{images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto">
          {images.map((img, idx) => {
            const active = idx === currentIndex;
            return (
              <button
                key={img.rentalAreaImageId || idx}
                onClick={() => setCurrentIndex(idx)}
                className={`shrink-0 rounded-xl overflow-hidden border-2 transition ${
                  active ? "border-[#4da6ff]" : "border-transparent"
                }`}
              >
                <img
                  src={img.imageUrl}
                  alt={`thumb-${idx}`}
                  className="w-[120px] h-[78px] object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RentalGallery;
