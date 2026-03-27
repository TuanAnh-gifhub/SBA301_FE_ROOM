import React from "react";
import { Card, Input, Select, Space, Button } from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import type { PostStatus } from "../../../services/posts/posts";

const { Option } = Select;

type Props = {
  loading?: boolean;
  status?: PostStatus;
  keyword: string;
  onStatusChange: (v: PostStatus | undefined) => void;
  onKeywordChange: (v: string) => void;
  onRefresh: () => void;
};

const PostFilters: React.FC<Props> = ({
  loading,
  status,
  keyword,
  onStatusChange,
  onKeywordChange,
  onRefresh,
}) => {
  return (
    <Card
      className="mb-6 !rounded-3xl !border-0 !shadow-sm"
      styles={{ body: { padding: 20 } }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Bộ lọc bài đăng
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Tìm kiếm nhanh theo tiêu đề, phòng, khu vực hoặc trạng thái
          </p>
        </div>

        <Space wrap size="middle">
          <Input
            placeholder="Tìm theo tiêu đề / phòng / khu / địa chỉ..."
            prefix={<SearchOutlined className="text-slate-400" />}
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            className="!h-11 !w-[320px] !rounded-xl"
            allowClear
          />

          <Select
            placeholder="Lọc theo trạng thái"
            value={status}
            onChange={(v) => onStatusChange(v)}
            className="!w-[220px]"
            size="large"
            allowClear
            suffixIcon={<FilterOutlined className="text-slate-400" />}
          >
            <Option value="PENDING">Chờ duyệt</Option>
            <Option value="PUBLISHED">Đã đăng</Option>
            <Option value="HIDDEN">Đang ẩn</Option>
          </Select>

          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={loading}
            className="!h-11 !rounded-xl"
          >
            Làm mới
          </Button>
        </Space>
      </div>
    </Card>
  );
};

export default PostFilters;
