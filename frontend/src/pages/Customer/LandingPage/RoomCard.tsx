import { iconMap } from "../../../utils/iconMapper";
export default function RoomCard({ room, onAddRoom }) {
  const coverImage =
    room.images?.find((img) => img.isCover)?.imageUrl ||
    room.images?.[0]?.imageUrl;

  const availableRooms =
    room.roomCopies?.filter((c) => c.roomCopyStatus === "AVAILABLE").length ||
    0;

  const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price);

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 flex gap-5">
     
      <div className="w-64">
        <img
          src={coverImage}
          alt={room.roomName}
          className="w-full h-40 object-cover rounded-lg"
        />

       
        <div className="flex gap-2 mt-2">
          {room.images?.slice(0, 3).map((img) => (
            <img
              key={img.roomImageId}
              src={img.imageUrl}
              className="w-16 h-12 object-cover rounded"
            />
          ))}
        </div>

        <p className="text-teal-600 text-sm mt-2 cursor-pointer">
          Xem ảnh và chi tiết
        </p>
      </div>

     
      <div className="flex flex-col justify-between flex-1">
        <div>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{room.roomName}</h3>

            <span className="text-sm text-gray-600">⭐ 4.8</span>
          </div>

          <p className="text-gray-500 text-sm mb-3">
            Sức chứa {room.capacity} người
          </p>

          <div className="grid grid-cols-3 gap-y-2 text-sm text-gray-600">
            {room.amenities?.slice(0, 4).map((a) => {
              const Icon = iconMap[a.icon];

              return (
                <div key={a.amenityId} className="flex items-center gap-2">
                  {Icon && <Icon size={16} />}
                  <span>{a.amenityName}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div>
            <p className="text-red-500 font-semibold text-lg">
              {formatPrice(room.price)} VNĐ
              <span className="text-gray-500 text-sm font-normal"> / giờ</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-amber-600 text-sm">
              Còn lại {availableRooms} phòng
            </span>

            <button
              onClick={() => onAddRoom(room)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
            >
              Thêm phòng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
