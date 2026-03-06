import React from "react";
import { Table, Button, Popconfirm, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { PackageResponse } from "../../../services/package/packageService";

// =====================================================
// GIẢI THÍCH:
// Component này chỉ có nhiệm vụ HIỂN THỊ dữ liệu.
// Mọi logic (fetch, delete...) nằm ở trang cha (PackageManagementPage).
// Trang cha truyền data và callback xuống qua props.
// =====================================================

interface PackageTableProps {
  data: PackageResponse[];          // danh sách gói từ API
  loading: boolean;                  // đang fetch → hiện skeleton
  onEdit: (item: PackageResponse) => void;   // callback khi bấm Sửa
  onDelete: (id: string) => void;            // callback khi bấm Xóa
}

const PackageTable: React.FC<PackageTableProps> = ({
  data,
  loading,
  onEdit,
  onDelete,
}) => {

  // Format tiền VND
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  // Format ngày giờ
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("vi-VN");

  // =====================================================
  // Cấu hình cột bảng — mỗi object = 1 cột
  // title    = tiêu đề cột
  // dataIndex = tên field trong PackageResponse
  // render   = custom hiển thị (nếu cần)
  // =====================================================
  const columns: ColumnsType<PackageResponse> = [
    {
      title: "Tên gói",
      dataIndex: "rentPackageName",
      key: "rentPackageName",
      render: (name: string) => (
        <span className="font-semibold">{name}</span>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price: number) => (
        <Tag color="blue">{formatPrice(price)}</Tag>
      ),
    },
    {
      title: "Thời hạn",
      dataIndex: "durationDays",
      key: "durationDays",
      render: (days: number) => `${days} ngày`,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true, // cắt bớt nếu text quá dài
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => formatDate(date),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 160,
      render: (_, record) => (
        <div className="flex gap-2">
          {/* Nút Sửa → gọi onEdit truyền nguyên record lên trang cha */}
          <Button
            size="small"
            type="primary"
            onClick={() => onEdit(record)}
          >
            Sửa
          </Button>

          {/*
            Popconfirm = popup xác nhận trước khi xóa
            Tránh user xóa nhầm
          */}
          <Popconfirm
            title="Xóa gói này?"
            description="Hành động này không thể hoàn tác!"
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(record.rentPackageId)}
          >
            <Button size="small" danger>
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Table
      rowKey="rentPackageId"   // field dùng làm key duy nhất cho mỗi row
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{ pageSize: 10 }}
      scroll={{ x: 800 }}     // cho phép scroll ngang khi màn hình nhỏ
    />
  );
};

export default PackageTable;