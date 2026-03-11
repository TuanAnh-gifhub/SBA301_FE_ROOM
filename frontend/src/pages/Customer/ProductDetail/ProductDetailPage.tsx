import React, { useEffect, useMemo, useState } from "react";
import { Alert, Breadcrumb, Skeleton, message } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { Link, useParams } from "react-router-dom";

import postsService, {
  type PostDetailResponse,
  type RoomImageResponse,
  type RentalAreaImageResponse,
} from "../../../services/posts/posts";

import ImageGallery from "./ImageGallery";
import BookingCard from "./BookingCard";
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

  const availableRoomCount = useMemo(() => {
    const copies = data?.room?.roomCopies || [];
    return (
      copies.filter((x) => x.roomCopyStatus === "AVAILABLE").length ||
      copies.length ||
      1
    );
  }, [data]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-4">
        <div className="px-4">
          <div className="max-w-[1600px] mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-4">
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
          <div className="max-w-[1600px] mx-auto">
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
    <div className="bg-gray-50 min-h-screen py-4">
      <div className="px-4">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-4">
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

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-8 space-y-4">
              <ImageGallery title={data.title} images={galleryImages} />

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                  {data.title}
                </div>

                <div className="text-base text-gray-500 mb-4">
                  {data.rentalArea?.rentalAreaName} ·{" "}
                  {data.rentalArea?.cityName}
                </div>

                <div className="text-3xl font-bold text-[#4da6ff] mb-5">
                  {Number(data.room?.price || 0).toLocaleString("vi-VN")} VNĐ
                  <span className="text-base font-normal text-gray-500">
                    {" "}
                    / giờ
                  </span>
                </div>

                <div className="text-2xl font-bold text-gray-800 mb-3">
                  Giới Thiệu Về Phòng
                </div>

                <div className="text-gray-700 leading-8 whitespace-pre-line">
                  {data.content || data.room?.description || "Chưa có mô tả"}
                </div>
              </div>

              <AmenitiesSection amenities={data.room?.amenities || []} />

              <LocationSection
                rentalAreaName={data.rentalArea?.rentalAreaName}
                address={data.rentalArea?.address}
                cityName={data.rentalArea?.cityName}
              />
            </div>

            <div className="xl:col-span-4 space-y-4">
              <BookingCard
                title={data.title}
                price={Number(data.room?.price || 0)}
                categoryName={data.room?.categoryName}
                capacity={data.room?.capacity}
                availableRoomCount={availableRoomCount}
              />

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
                roomCount={availableRoomCount}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
