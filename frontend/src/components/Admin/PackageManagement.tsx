// components/admin/PackageManagement.tsx
'use client';

import { useEffect, useState } from 'react';
import type { Package } from '../../services/packageService/package.types';
import { PackageService } from '../../services/packageService/package.service';
import PackageFormModal from './PackageFormModal';
/**
 * Component quản lý packages cho ADMIN
 * Admin có thể xem, thêm, sửa, xóa packages
 */
export default function PackageManagement() {
  // State lưu danh sách packages
  const [packages, setPackages] = useState<Package[]>([]);
  
  // State loading
  const [loading, setLoading] = useState(true);
  
  // State error
  const [error, setError] = useState<string | null>(null);
  
  // State mở modal form (null = đóng, 'create' = tạo mới, package object = edit)
  const [modalState, setModalState] = useState<'create' | Package | null>(null);

  /**
   * Fetch packages khi component mount
   */
  useEffect(() => {
    fetchPackages();
  }, []);

  /**
   * Function fetch packages từ API
   */
  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await PackageService.getAllPackages();
      setPackages(data);
    } catch (err) {
      setError('Không thể tải danh sách gói. Vui lòng thử lại!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xử lý xóa package
   */
  const handleDelete = async (id: string) => {
    // Confirm trước khi xóa
    if (!window.confirm('Bạn có chắc muốn xóa gói này?')) {
      return;
    }

    try {
      await PackageService.deletePackage(id);
      
      // Cập nhật lại danh sách (xóa khỏi state)
      setPackages(packages.filter(pkg => pkg.id !== id));
      
      alert('Xóa gói thành công!');
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa gói!');
      console.error(error);
    }
  };

  /**
   * Xử lý khi form modal submit thành công
   */
  const handleFormSuccess = () => {
    setModalState(null); // Đóng modal
    fetchPackages(); // Reload danh sách
  };

  /**
   * Format số tiền VND
   */
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  /**
   * Format ngày tháng
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Hiển thị loading
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Hiển thị error
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchPackages}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header với nút Thêm mới */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Quản Lý Gói Đăng Bài
          </h1>
          <p className="text-gray-600 mt-2">
            Tổng số gói: {packages.length}
          </p>
        </div>
        <button
          onClick={() => setModalState('create')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Thêm gói mới
        </button>
      </div>

      {/* Table hiển thị packages */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên gói
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời hạn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số bài đăng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {pkg.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {pkg.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatPrice(pkg.price)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {pkg.duration} ngày
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {pkg.maxPosts} bài
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        pkg.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {pkg.isActive ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(pkg.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setModalState(pkg)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {packages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">Chưa có gói nào.</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {modalState && (
        <PackageFormModal
          package={modalState === 'create' ? null : modalState}
          onClose={() => setModalState(null)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}