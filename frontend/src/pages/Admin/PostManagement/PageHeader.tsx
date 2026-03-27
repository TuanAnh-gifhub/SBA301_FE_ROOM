import React from "react";
import { Button, Space, Statistic } from "antd";
import {
  ReloadOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  EyeInvisibleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

type Props = {
  onRefresh: () => void;
  loading?: boolean;
  total?: number;
  published?: number;
  hidden?: number;
  pending?: number;
};

const statCardClass =
  "rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-3 min-w-[150px]";

const PageHeader: React.FC<Props> = ({
  onRefresh,
  loading,
  total = 0,
  published = 0,
  hidden = 0,
  pending = 0,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 p-6 md:p-8 shadow-lg mb-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_30%)]" />
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -left-10 -bottom-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

      <div className="relative flex flex-col gap-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-md">
                <FileTextOutlined className="text-2xl text-white" />
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                  Quản lý tin đăng
                </h1>
                <p className="text-white/85 mt-1 text-sm md:text-base">
                  Theo dõi, duyệt, ẩn hiện và quản lý toàn bộ bài đăng một cách
                  trực quan
                </p>
              </div>
            </div>
          </div>

          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={loading}
            className="!h-11 !rounded-xl !border-0 !bg-white !px-5 !font-semibold !text-sky-600 hover:!bg-sky-50"
          >
            Làm mới
          </Button>
        </div>

        <Space wrap size={12}>
          <div className={statCardClass}>
            <Statistic
              title={<span className="!text-white/80">Tổng bài đăng</span>}
              value={total}
              prefix={<FileTextOutlined className="text-white" />}
              valueStyle={{ color: "white", fontWeight: 700, fontSize: 24 }}
            />
          </div>

          <div className={statCardClass}>
            <Statistic
              title={<span className="!text-white/80">Đã đăng</span>}
              value={published}
              prefix={<CheckCircleOutlined className="text-white" />}
              valueStyle={{ color: "white", fontWeight: 700, fontSize: 24 }}
            />
          </div>

          <div className={statCardClass}>
            <Statistic
              title={<span className="!text-white/80">Chờ duyệt</span>}
              value={pending}
              prefix={<ClockCircleOutlined className="text-white" />}
              valueStyle={{ color: "white", fontWeight: 700, fontSize: 24 }}
            />
          </div>

          <div className={statCardClass}>
            <Statistic
              title={<span className="!text-white/80">Đang ẩn</span>}
              value={hidden}
              prefix={<EyeInvisibleOutlined className="text-white" />}
              valueStyle={{ color: "white", fontWeight: 700, fontSize: 24 }}
            />
          </div>
        </Space>
      </div>
    </div>
  );
};

export default PageHeader;
