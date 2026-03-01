import React, { useEffect, useState } from "react";
import { Button, Input, message } from "antd";
import {
  packageService,
  type PackageResponse,
  type PackageRequest,
} from "../../../services/package/packageService.ts";
import PackageTable from "./PackageTable.tsx";
import PackageFormModal from "./PackageFormModal.tsx";

// =====================================================
// GIẢI THÍCH LUỒNG HOẠT ĐỘNG:
//
// 1. Mount → fetchData() → gọi API GET /packages → setData()
// 2. Bấm "+ Thêm mới" → openCreate() → mở Modal (mode=create)
// 3. Bấm "Sửa" trên table → openEdit(item) → mở Modal (mode=edit, có data cũ)
// 4. Submit form trong Modal → handleSubmit() → gọi API create/update → fetchData() lại
// 5. Bấm "Xóa" → handleDelete() → gọi API delete → fetchData() lại
// =====================================================

const PackageManagementPage: React.FC = () => {

  // --- STATE ---
  const [data, setData] = useState<PackageResponse[]>([]);      // danh sách gói
  const [loading, setLoading] = useState(false);                 // loading bảng
  const [keyword, setKeyword] = useState("");                    // từ khóa tìm kiếm
  const [modalOpen, setModalOpen] = useState(false);            // đóng/mở modal
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<PackageResponse | null>(null); // gói đang sửa
  const [submitLoading, setSubmitLoading] = useState(false);    // loading nút submit

  // --- LỌC DỮ LIỆU THEO TỪ KHÓA ---
  // Lọc ở FE (không cần gọi API mỗi lần gõ) vì data ít
  const filtered = data.filter((pkg) => {
    const k = keyword.trim().toLowerCase();
    if (!k) return true;
    return (
      pkg.rentPackageName.toLowerCase().includes(k) ||
      pkg.description.toLowerCase().includes(k)
    );
  });

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await packageService.getAllPackages();
      setData(res.data.result || []);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message || "Lỗi tải danh sách gói");
    } finally {
      setLoading(false);
    }
  };

  // Chạy 1 lần khi component mount
  useEffect(() => {
    fetchData();
  }, []);

  // --- MỞ MODAL TẠO MỚI ---
  const openCreate = () => {
    setModalMode("create");
    setEditing(null);      // không có data cũ
    setModalOpen(true);
  };

  // --- MỞ MODAL CHỈNH SỬA ---
  // Nhận item từ PackageTable → lưu vào editing → truyền vào Modal
  const openEdit = (item: PackageResponse) => {
    setModalMode("edit");
    setEditing(item);      // lưu data cũ để Modal điền sẵn
    setModalOpen(true);
  };

  // --- XỬ LÝ SUBMIT FORM ---
  const handleSubmit = async (payload: PackageRequest) => {
    try {
      setSubmitLoading(true);
      if (modalMode === "create") {
        await packageService.createPackage(payload);
        message.success("Tạo gói thành công!");
      } else {
        if (!editing) return;
        await packageService.updatePackage(editing.rentPackageId, payload);
        message.success("Cập nhật gói thành công!");
      }
      setModalOpen(false);
      await fetchData(); // refresh lại bảng
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message || "Thao tác thất bại");
    } finally {
      setSubmitLoading(false);
    }
  };

  // --- XỬ LÝ XÓA ---
  const handleDelete = async (id: string) => {
    try {
      await packageService.deletePackage(id);
      message.success("Xóa gói thành công!");
      await fetchData(); // refresh lại bảng
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      message.error(err?.response?.data?.message || "Xóa thất bại");
    }
  };

  // --- RENDER ---
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold" style={{ color: "inherit" }}>
          Quản lý Gói Premium
        </h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm theo tên hoặc mô tả..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-[260px]"
          />
          <Button type="primary" onClick={openCreate}>
            + Thêm mới
          </Button>
        </div>
      </div>

      {/* Bảng danh sách */}
      <PackageTable
        data={filtered}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {/* Modal tạo/sửa */}
      <PackageFormModal
        open={modalOpen}
        mode={modalMode}
        initialData={editing}
        loading={submitLoading}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default PackageManagementPage;