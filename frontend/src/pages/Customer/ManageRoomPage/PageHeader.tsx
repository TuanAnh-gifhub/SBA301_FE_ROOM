import React from "react";
import { Button } from "antd";
import {
  ArrowRightOutlined,
  HomeOutlined,
  PlusOutlined,
} from "@ant-design/icons";

type Props = {
  onCreate: () => void;
};

const PageHeader: React.FC<Props> = ({ onCreate }) => {
  return (
    <div className="mb-6">
      <div className="rounded-3xl overflow-hidden border border-slate-100 bg-white shadow-sm">
        <div className="px-6 py-6 md:px-8 md:py-7 bg-gradient-to-r from-[#eff6ff] via-white to-[#f8fafc]">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
            <div className="min-w-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#1677ff]/10 flex items-center justify-center shrink-0">
                  <HomeOutlined style={{ fontSize: 26, color: "#1677ff" }} />
                </div>

                <div className="min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">
                    Quản lý tòa nhà & phòng học
                  </h1>
                  <p className="text-slate-500 mt-1 text-sm md:text-base">
                    Tạo tòa nhà, thêm phòng học và quản lý toàn bộ trạng thái
                    trong một giao diện hiện đại hơn
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 text-sm">
                  Dashboard quản lý
                </span>
                <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 text-sm">
                  Theo dõi trạng thái tòa nhà
                </span>
                <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 text-sm">
                  Quản lý phòng học tập trung
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Button
                size="large"
                onClick={onCreate}
                icon={<PlusOutlined />}
                className="rounded-xl h-11 px-5 font-medium"
                style={{
                  background: "#1677ff",
                  borderColor: "#1677ff",
                  color: "#fff",
                  boxShadow: "0 10px 24px rgba(22,119,255,0.18)",
                }}
              >
                Thêm tòa nhà mới
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
