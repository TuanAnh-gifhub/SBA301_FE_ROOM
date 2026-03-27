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
    address?: string;
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
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
        <Empty description="Không có hình ảnh" />
      </div>
    );
  }

  const current = images[currentIndex];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 md:p-5">
      <div className="relative rounded-2xl overflow-hidden bg-slate-100">
        <img
          src={current.imageUrl}
          alt={rental?.rentalAreaName || "rental-image"}
          className="w-full h-[280px] sm:h-[380px] md:h-[500px] xl:h-[560px] object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />

        <div className="absolute left-5 bottom-5 text-white max-w-[80%]">
          <div className="text-2xl md:text-3xl font-bold drop-shadow">
            {rental?.rentalAreaName || "Khu vực cho thuê"}
          </div>
          <div className="text-sm md:text-base text-white/90 mt-1">
            {rental?.address || "Không gian cho thuê hiện đại"}
          </div>
        </div>

        {images.length > 1 && (
          <>
            <Button
              shape="circle"
              icon={<LeftOutlined />}
              className="!absolute !left-4 !top-1/2 !-translate-y-1/2 shadow-lg"
              onClick={handlePrev}
            />

            <Button
              shape="circle"
              icon={<RightOutlined />}
              className="!absolute !right-4 !top-1/2 !-translate-y-1/2 shadow-lg"
              onClick={handleNext}
            />

            <div className="absolute bottom-4 right-4 bg-black/55 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              {currentIndex + 1}/{images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {images.map((img, idx) => {
            const active = idx === currentIndex;
            return (
              <button
                key={img.rentalAreaImageId || idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${
                  active
                    ? "border-blue-500 scale-[0.98] shadow-md"
                    : "border-transparent opacity-80 hover:opacity-100"
                }`}
              >
                <img
                  src={img.imageUrl}
                  alt={`thumb-${idx}`}
                  className="w-[110px] md:w-[140px] h-[72px] md:h-[90px] object-cover"
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
