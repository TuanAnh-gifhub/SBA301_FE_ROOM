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
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 md:p-7 h-full flex flex-col min-h-[460px]">
      <div className="inline-flex items-center rounded-full bg-blue-50 text-blue-600 px-3 py-1 text-xs font-semibold mb-3 w-fit">
        Không gian cho thuê
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
        {rental?.rentalAreaName || "Khu vực cho thuê"}
      </h1>

      <div className="mt-3 flex items-start gap-2 text-slate-500 text-sm md:text-base">
        <EnvironmentOutlined className="mt-1 text-[#4da6ff]" />
        <span>{rental?.address || "Chưa cập nhật địa chỉ"}</span>
      </div>

      <div className="h-px bg-slate-200 my-6" />

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="text-xl font-bold text-slate-800 mb-3 shrink-0">
          Mô tả
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto pr-2 text-slate-600 leading-7 text-[15px] md:text-base">
          {rental?.description ||
            "Không gian học tập hiện đại, đầy đủ tiện nghi, phù hợp cho học nhóm, workshop và meeting trong môi trường chuyên nghiệp."}
        </div>
      </div>
    </div>
  );
};

export default RentalInfo;
