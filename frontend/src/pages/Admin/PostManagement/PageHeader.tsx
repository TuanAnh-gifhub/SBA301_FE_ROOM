import React from "react";
import { Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

type Props = {
  onRefresh: () => void;
  loading?: boolean;
};

const PageHeader: React.FC<Props> = ({ onRefresh, loading }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý tin đăng</h1>
        </div>

        <Button
          icon={<ReloadOutlined />}
          onClick={onRefresh}
          loading={loading}
          style={{ borderColor: "#4da6ff", color: "#4da6ff" }}
        >
          Làm mới
        </Button>
      </div>
    </div>
  );
};

export default PageHeader;
