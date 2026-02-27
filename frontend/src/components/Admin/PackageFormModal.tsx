// components/admin/PackageFormModal.tsx
'use client';

import { useState, useEffect } from 'react';
import type { Package } from '../../services/packageService/package.types';
import type { PackageFormData } from '../../services/packageService/package.types';
import { PackageService } from '../../services/packageService/package.service';

interface Props {
  package: Package | null; // null = create mode, có data = edit mode
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal Form để tạo mới hoặc chỉnh sửa package
 */
export default function PackageFormModal({ package: pkg, onClose, onSuccess }: Props) {
  // State cho form data
  const [formData, setFormData] = useState<PackageFormData>({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    maxPosts: 5,
    features: [],
    isActive: true,
  });

  // State cho feature input (để thêm feature mới)
  const [featureInput, setFeatureInput] = useState('');

  // State loading khi submit
  const [submitting, setSubmitting] = useState(false);

  /**
   * Khi có package (edit mode), fill data vào form
   */
  useEffect(() => {
    if (pkg) {
      setFormData({
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        duration: pkg.duration,
        maxPosts: pkg.maxPosts,
        features: [...pkg.features], // Copy array
        isActive: pkg.isActive,
      });
    }
  }, [pkg]);

  /**
   * Xử lý thay đổi input
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  /**
   * Xử lý checkbox isActive
   */
  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      isActive: e.target.checked,
    }));
  };

  /**
   * Thêm feature mới vào danh sách
   */
  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()],
      }));
      setFeatureInput(''); // Clear input
    }
  };

  /**
   * Xóa feature khỏi danh sách
   */
  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  /**
   * Xử lý submit form
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên gói!');
      return;
    }

    if (formData.price <= 0) {
      alert('Giá phải lớn hơn 0!');
      return;
    }

    if (formData.maxPosts <= 0) {
      alert('Số bài đăng phải lớn hơn 0!');
      return;
    }

    try {
      setSubmitting(true);

      if (pkg) {
        // Edit mode
        await PackageService.updatePackage(pkg.id, formData);
        alert('Cập nhật gói thành công!');
      } else {
        // Create mode
        await PackageService.createPackage(formData);
        alert('Tạo gói mới thành công!');
      }

      onSuccess(); // Callback để parent reload data
    } catch (error) {
      alert('Có lỗi xảy ra! Vui lòng thử lại.');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">
              {pkg ? 'Chỉnh sửa gói' : 'Tạo gói mới'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Tên gói */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên gói <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="VD: Gói Cơ Bản"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả về gói này..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Grid 2 cột */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Giá */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="100000"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Thời hạn */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời hạn (ngày) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="30"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Số bài đăng tối đa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số bài đăng tối đa <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="maxPosts"
                value={formData.maxPosts}
                onChange={handleChange}
                placeholder="5"
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Tính năng */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tính năng
              </label>
              
              {/* Input thêm feature */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  placeholder="Nhập tính năng và nhấn Enter"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Thêm
                </button>
              </div>

              {/* Danh sách features */}
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg"
                  >
                    <span className="text-gray-700">{feature}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="text-red-500 hover:text-red-700"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkbox Active */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={handleCheckbox}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Kích hoạt gói này
              </label>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={submitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                {submitting ? 'Đang xử lý...' : pkg ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}