// components/PackageList.tsx
'use client';

import { useEffect, useState } from 'react';
import type { Package } from '../services/packageService/package.types';
import { PackageService } from '../services/packageService/package.service';



/**
 * Component hiển thị danh sách các gói cho USER
 * User có thể xem và chọn gói để đăng ký
 */
export default function PackageList() {
  // State lưu danh sách packages
  const [packages, setPackages] = useState<Package[]>([]);
  
  // State loading
  const [loading, setLoading] = useState(true);
  
  // State error
  const [error, setError] = useState<string | null>(null);

  /**
   * useEffect: Chạy khi component mount (lần đầu render)
   * Gọi API để lấy danh sách packages
   */
  useEffect(() => {
    fetchPackages();
  }, []); // [] = chỉ chạy 1 lần khi component mount

  /**
   * Function fetch packages từ API
   */
  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Gọi API
      const data = await PackageService.getAllPackages();
      
      // Lọc chỉ lấy các gói đang active
      const activePackages = data.filter(pkg => pkg.isActive);
      
      setPackages(activePackages);
    } catch (err) {
      setError('Không thể tải danh sách gói. Vui lòng thử lại!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Function xử lý khi user click "Đăng ký"
   */
  const handleSubscribe = (packageId: string) => {
    // TODO: Implement logic đăng ký gói
    console.log('Đăng ký gói:', packageId);
    // Có thể navigate đến trang thanh toán hoặc mở modal confirm
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
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Các Gói Đăng Bài
        </h1>
        <p className="text-gray-600">
          Chọn gói phù hợp để bắt đầu đăng tin cho thuê phòng
        </p>
      </div>

      {/* Package Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            {/* Package Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
              <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
              <div className="text-3xl font-bold mb-1">
                {formatPrice(pkg.price)}
              </div>
              <p className="text-blue-100 text-sm">
                {pkg.duration} ngày
              </p>
            </div>

            {/* Package Body */}
            <div className="p-6">
              {/* Description */}
              <p className="text-gray-600 mb-6">
                {pkg.description}
              </p>

              {/* Features */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Tính năng:
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">
                      Đăng tối đa {pkg.maxPosts} bài
                    </span>
                  </li>
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Subscribe Button */}
              <button
                onClick={() => handleSubscribe(pkg.id)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
              >
                Đăng ký ngay
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {packages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">Hiện chưa có gói nào khả dụng.</p>
        </div>
      )}
    </div>
  );
}