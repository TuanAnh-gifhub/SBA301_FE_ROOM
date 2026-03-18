import React from "react";
import { Button } from "antd";
import { FileTextOutlined, PlusOutlined } from "@ant-design/icons";

type Props = {
  onCreate: () => void;
};

const PageHeader: React.FC<Props> = ({ onCreate }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 p-6 md:p-8 shadow-lg mb-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_30%)]" />
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -left-10 -bottom-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-md">
              <FileTextOutlined className="text-2xl text-white" />
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                Quản lý tin đăng
              </h1>
              <p className="text-white/85 mt-1 text-sm md:text-base">
                Tạo, chỉnh sửa và theo dõi trạng thái tin đăng phòng học một
                cách trực quan hơn
              </p>
            </div>
          </div>
        </div>

        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={onCreate}
          className="!h-11 !rounded-xl !border-0 !bg-white !px-5 !font-semibold !text-sky-600 hover:!bg-sky-50"
        >
          Tạo tin đăng
        </Button>
      </div>
    </div>
  );
};

export default PageHeader;
