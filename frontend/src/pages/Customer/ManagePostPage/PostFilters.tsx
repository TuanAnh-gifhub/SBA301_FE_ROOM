import React from "react";
import { Button, Card, Input, Select } from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import type { PostStatus } from "../../../services/posts/posts";

const { Option } = Select;

type Props = {
  keyword: string;
  status?: PostStatus;
  loading?: boolean;

  onKeywordChange: (v: string) => void;
  onStatusChange: (v?: PostStatus) => void;
  onRefresh: () => void;
  onClearFilters: () => void;
};

const PostFilters: React.FC<Props> = ({
  keyword,
  status,
  loading = false,
  onKeywordChange,
  onStatusChange,
  onRefresh,
  onClearFilters,
}) => {
  const hasFilter = Boolean(keyword.trim() || status);

  return (
    <Card className="mb-6 rounded-3xl border-0 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <FilterOutlined className="text-sky-500" />
            <span>Bộ lọc tin đăng</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Tìm kiếm nhanh theo tiêu đề, phòng học, địa chỉ và trạng thái
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full lg:max-w-5xl">
          <Input
            placeholder="Tìm theo tiêu đề / tên phòng / địa chỉ..."
            prefix={<SearchOutlined className="text-slate-400" />}
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            allowClear
            className="!h-11 !rounded-xl"
          />

          <Select
            placeholder="Lọc theo trạng thái"
            value={status}
            onChange={(v) => onStatusChange(v)}
            allowClear
            className="h-11"
            size="large"
          >
            <Option value="PENDING">Chờ duyệt</Option>
            <Option value="PUBLISHED">Đã đăng</Option>
            <Option value="HIDDEN">Đang ẩn</Option>
            <Option value="DELETED">Đã xóa</Option>
          </Select>

          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={loading}
            className="!h-11 !rounded-xl !font-medium"
          >
            Làm mới dữ liệu
          </Button>

          <Button
            icon={<ClearOutlined />}
            onClick={onClearFilters}
            disabled={!hasFilter}
            className="!h-11 !rounded-xl !font-medium"
          >
            Xóa lọc
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PostFilters;
