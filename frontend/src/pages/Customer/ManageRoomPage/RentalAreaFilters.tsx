import React from "react";
import { Button, Card, Input, Select } from "antd";
import {
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import type { RentalAreaStatus } from "../../../services/rental-areas/rentalAreas";

const { Option } = Select;

type Props = {
  keyword: string;
  status?: RentalAreaStatus;
  loading: boolean;
  onKeywordChange: (v: string) => void;
  onStatusChange: (v?: RentalAreaStatus) => void;
  onRefresh: () => void;
};

const RentalAreaFilters: React.FC<Props> = ({
  keyword,
  status,
  loading,
  onKeywordChange,
  onStatusChange,
  onRefresh,
}) => {
  const hasFilter = !!keyword.trim() || !!status;

  const handleClear = () => {
    onKeywordChange("");
    onStatusChange(undefined);
  };

  return (
    <Card className="mb-6 rounded-3xl shadow-sm border-0">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-slate-700 font-semibold mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#1677ff]/10 flex items-center justify-center">
              <FilterOutlined style={{ color: "#1677ff" }} />
            </div>
            <div>
              <div className="text-base">Bộ lọc tìm kiếm</div>
              <div className="text-xs text-slate-500 font-normal">
                Tìm nhanh tòa nhà theo tên, địa chỉ và trạng thái hoạt động
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_260px] gap-3">
            <div>
              <div className="text-xs font-medium text-slate-500 mb-2">
                Từ khóa
              </div>
              <Input
                size="large"
                placeholder="Tìm kiếm theo tên tòa nhà hoặc địa chỉ..."
                prefix={<SearchOutlined className="text-slate-400" />}
                value={keyword}
                onChange={(e) => onKeywordChange(e.target.value)}
                allowClear
                className="rounded-xl"
              />
            </div>

            <div>
              <div className="text-xs font-medium text-slate-500 mb-2">
                Trạng thái
              </div>
              <Select
                size="large"
                placeholder="Lọc theo trạng thái"
                value={status}
                onChange={(value) => onStatusChange(value)}
                allowClear
                className="w-full"
              >
                <Option value="ACTIVE">Đang hoạt động</Option>
                <Option value="INACTIVE">Ngừng hoạt động</Option>
                <Option value="SUSPENDED">Bị khóa</Option>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 xl:justify-end">
          <Button
            size="large"
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={loading}
            className="rounded-xl h-11 px-5 font-medium"
            style={{
              background: "#1677ff",
              borderColor: "#1677ff",
              color: "#fff",
              boxShadow: "0 10px 24px rgba(22,119,255,0.16)",
            }}
          >
            Làm mới
          </Button>

          <Button
            size="large"
            icon={<ClearOutlined />}
            onClick={handleClear}
            disabled={!hasFilter}
            className="rounded-xl h-11 px-5 font-medium"
            style={{
              borderColor: hasFilter ? "#d0d5dd" : undefined,
              color: hasFilter ? "#475467" : undefined,
              background: "#fff",
            }}
          >
            Xóa lọc
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default RentalAreaFilters;
