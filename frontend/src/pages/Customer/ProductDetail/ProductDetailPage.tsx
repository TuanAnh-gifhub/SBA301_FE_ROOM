import React, { useEffect, useMemo, useState } from "react";
import { Alert, Breadcrumb, Skeleton, message, Tag } from "antd";
import {
  HomeOutlined,
  AppstoreOutlined,
  TeamOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Link, useParams } from "react-router-dom";

import postsService, {
  type PostDetailResponse,
  type RoomImageResponse,
  type RentalAreaImageResponse,
} from "../../../services/posts/posts";

import ImageGallery from "./ImageGallery";
import AmenitiesSection from "./AmenitiesSection";
import OwnerCard from "./OwnerCard";
import RoomInfoCard from "./RoomInfoCard";
import LocationSection from "./LocationSection";

type GalleryImage = {
  id: string;
  imageUrl: string;
  isCover?: boolean;
  sortOrder?: number;
};

const sortImages = <T extends { sortOrder?: number; isCover?: boolean }>(
  items: T[],
) => {
  return [...items].sort((a, b) => {
    if ((a.isCover ? 1 : 0) !== (b.isCover ? 1 : 0)) {
      return (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0);
    }
    return (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999);
  });
};

const ProductDetailPage: React.FC = () => {
  const { postId } = useParams();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PostDetailResponse | null>(null);

  useEffect(() => {
    if (!postId) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await postsService.getPublicPostDetail(postId);

        if (res.code !== 200 && res.code !== 0) {
          message.error(res.message || "Không tải được chi tiết bài đăng");
          return;
        }

        setData(res.result);
      } catch (e: any) {
        console.error(e);
        message.error(
          e?.response?.data?.message ||
            "Đã xảy ra lỗi khi tải chi tiết bài đăng",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [postId]);

  const galleryImages: GalleryImage[] = useMemo(() => {
    if (!data) return [];

    const roomImages = sortImages<RoomImageResponse>(
      data.room?.images || [],
    ).map((img) => ({
      id: img.roomImageId,
      imageUrl: img.imageUrl,
      isCover: img.isCover,
      sortOrder: img.sortOrder,
    }));

    if (roomImages.length > 0) return roomImages;

    return sortImages<RentalAreaImageResponse>(
      data.rentalArea?.images || [],
    ).map((img) => ({
      id: img.rentalAreaImageId,
      imageUrl: img.imageUrl,
      isCover: img.isCover,
      sortOrder: img.sortOrder,
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-4">
        <div className="px-4">
          <div className="max-w-[1400px] mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <Skeleton active paragraph={{ rows: 10 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-50 min-h-screen py-4">
        <div className="px-4">
          <div className="max-w-[1400px] mx-auto">
            <Alert
              type="warning"
              message="Không tìm thấy bài đăng"
              description="Bài đăng không tồn tại hoặc đã bị ẩn."
              showIcon
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="px-4">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-5">
            <Breadcrumb
              items={[
                {
                  title: (
                    <Link to="/">
                      <HomeOutlined /> Trang chủ
                    </Link>
                  ),
                },
                {
                  title: <Link to="/product">Phòng học</Link>,
                },
                {
                  title: data.title,
                },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-8 space-y-6">
              <ImageGallery title={data.title} images={galleryImages} />

              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 mb-6">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 leading-snug">
                      {data.title}
                    </h1>

                    <p className="text-base text-gray-500 mt-2">
                      {data.rentalArea?.rentalAreaName} ·{" "}
                      {data.rentalArea?.cityName}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-blue-50 text-blue-600 px-4 py-3 rounded-xl">
                      <div className="text-sm text-blue-500 font-medium">
                        Giá thuê
                      </div>
                      <div className="text-2xl font-bold">
                        {Number(data.room?.price || 0).toLocaleString("vi-VN")}{" "}
                        VNĐ
                        <span className="text-sm font-normal text-gray-500">
                          {" "}
                          / giờ
                        </span>
                      </div>
                    </div>

                    {data.room?.categoryName && (
                      <div className="bg-gray-50 px-4 py-3 rounded-xl min-w-[140px]">
                        <div className="text-sm text-gray-500">Loại phòng</div>
                        <div className="font-semibold text-gray-800">
                          {data.room.categoryName}
                        </div>
                      </div>
                    )}

                    {!!data.room?.capacity && (
                      <div className="bg-gray-50 px-4 py-3 rounded-xl min-w-[140px]">
                        <div className="text-sm text-gray-500">Sức chứa</div>
                        <div className="font-semibold text-gray-800">
                          {data.room.capacity} người
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {data.room?.categoryName && (
                      <Tag icon={<AppstoreOutlined />} color="blue">
                        {data.room.categoryName}
                      </Tag>
                    )}
                    {!!data.room?.capacity && (
                      <Tag icon={<TeamOutlined />} color="gold">
                        {data.room.capacity} người
                      </Tag>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Giới thiệu về phòng
                  </h2>

                  <div className="text-gray-700 leading-8 whitespace-pre-line text-[15px]">
                    {data.content || data.room?.description || "Chưa có mô tả"}
                  </div>
                </div>
              </div>

              <AmenitiesSection amenities={data.room?.amenities || []} />

              <LocationSection
                rentalAreaName={data.rentalArea?.rentalAreaName}
                address={data.rentalArea?.address}
                cityName={data.rentalArea?.cityName}
              />
            </div>

            <div className="xl:col-span-4 space-y-6">
              <div className="xl:sticky xl:top-6 space-y-6">
                <OwnerCard
                  ownerName={data.rentalArea?.ownerName}
                  contactName={data.rentalArea?.contactName}
                  contactPhone={data.rentalArea?.contactPhone}
                  rentalAreaName={data.rentalArea?.rentalAreaName}
                />

                <RoomInfoCard
                  roomName={data.room?.roomName}
                  categoryName={data.room?.categoryName}
                  capacity={data.room?.capacity}
                  area={data.room?.area}
                  roomStatus={data.room?.roomStatus}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
