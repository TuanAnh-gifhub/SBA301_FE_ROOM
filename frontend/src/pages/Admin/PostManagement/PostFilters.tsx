import React from "react";
import { Card, Input, Select, Space, Button } from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
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
    <Card className="mb-6 shadow-sm">
      <Space size="middle" wrap>
        <Input
          placeholder="Tìm theo tiêu đề / phòng / khu / địa chỉ..."
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          style={{ width: 320 }}
          allowClear
        />

        <Select
          placeholder="Lọc theo trạng thái"
          value={status}
          onChange={(v) => onStatusChange(v)}
          style={{ width: 220 }}
          allowClear
        >
          <Option value="PENDING">Chờ duyệt</Option>
          <Option value="PUBLISHED">Đã đăng</Option>
          <Option value="HIDDEN">Đang ẩn</Option>
        </Select>

        <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
          Làm mới
        </Button>
      </Space>
    </Card>
  );
};

export default PostFilters;
