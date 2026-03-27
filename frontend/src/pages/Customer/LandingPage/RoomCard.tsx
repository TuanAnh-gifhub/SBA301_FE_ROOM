import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaCog, FaArrowRight } from "react-icons/fa";

import { iconMap } from "../../../utils/iconMapper";
import postsService from "../../../services/posts/posts";

export default function RoomCard({ room, onAddRoom }) {
  const navigate = useNavigate();

  const coverImage =
    room.images?.find((img) => img.isCover)?.imageUrl ||
    room.images?.[0]?.imageUrl ||
    "https://placehold.co/600x400?text=No+Image";

  const availableRooms =
    room.roomCopies?.filter((c) => c.roomCopyStatus === "AVAILABLE").length ||
    0;

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN").format(price || 0);

  const handleViewDetail = async () => {
    try {
      const res = await postsService.getPostIdByRoomId(room.roomId);

      if (res.code !== 1000 || !res.result?.postId) {
        throw new Error(res.message || "Không tìm thấy bài đăng");
      }

      navigate(`/products/${res.result.postId}`);
    } catch (error) {
      console.error(error);
      toast.error("Không lấy được thông tin bài đăng");
    }
  };

  const amenities = room.amenities?.slice(0, 6) || [];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition p-4 md:p-5">
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="w-full lg:w-[290px] shrink-0">
          <div className="relative overflow-hidden rounded-xl bg-gray-100">
            <img
              src={coverImage}
              alt={room.roomName}
              className="w-full h-[210px] object-cover hover:scale-[1.02] transition"
            />

            <div className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#4da6ff] shadow-sm">
              {room.categoryName || "Phòng học"}
            </div>
          </div>

          {!!room.images?.length && (
            <div className="flex gap-2 mt-3 overflow-hidden">
              {room.images.slice(0, 4).map((img) => (
                <img
                  key={img.roomImageId}
                  src={img.imageUrl}
                  alt="thumb"
                  className="w-16 h-12 md:w-[70px] md:h-[52px] object-cover rounded-lg border border-gray-200"
                />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleViewDetail}
            className="mt-3 inline-flex items-center gap-2 text-[#4da6ff] hover:text-blue-600 text-sm font-medium transition"
          >
            Xem chi tiết
            <FaArrowRight size={12} />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-gray-800 leading-snug">
                    {room.roomName}
                  </h3>

                  <span className="shrink-0 text-xs font-semibold bg-amber-50 text-amber-700 px-3 py-1 rounded-full">
                    Số lượng {availableRooms} phòng
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                  <span className="rounded-full bg-gray-100 px-3 py-1">
                    Sức chứa {room.capacity || 0} người
                  </span>

                  {room.area ? (
                    <span className="rounded-full bg-gray-100 px-3 py-1">
                      {room.area} m²
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="shrink-0 text-sm text-amber-500 font-medium">
                ⭐ 4.8
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 xl:grid-cols-3 gap-3">
              {amenities.map((a) => {
                const Icon = a.iconKey ? iconMap[a.iconKey] : null;

                return (
                  <div
                    key={a.amenityId}
                    className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                  >
                    <span className="text-[#4da6ff] shrink-0">
                      {Icon ? <Icon size={15} /> : <FaCog size={15} />}
                    </span>
                    <span className="truncate">{a.amenityName}</span>
                  </div>
                );
              })}
            </div>

            {/* PRICE + AVAILABILITY */}
            <div className="flex flex-col items-end gap-1 mt-8">
              <div className="flex items-end justify-end gap-2">
                <span className="text-[#4da6ff] text-2xl font-bold leading-none">
                  {formatPrice(room.price)} VNĐ
                </span>
                <span className="text-gray-500 text-sm">/ giờ</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
            {/* PRICE + AVAILABILITY */}
            <div className="flex flex-col gap-1"></div>
            {/* BUTTON */}
            <button
              type="button"
              onClick={() => onAddRoom(room)}
              className={`px-5 py-2.5 rounded-xl font-medium transition shadow-sm ${
                availableRooms <= 0
                  ? "bg-gray-300 text-white cursor-not-allowed"
                  : "bg-[#4da6ff] hover:bg-blue-600 text-white"
              }`}
              disabled={availableRooms <= 0}
            >
              Thêm phòng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
