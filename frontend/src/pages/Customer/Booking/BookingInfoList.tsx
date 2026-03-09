import { Card } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
export default function BookingInfoList({ intent }: any) {
  const navigate = useNavigate();

  const { user } = useAuth();
  if (!user) {
    navigate("/login");
  }
  return (
    <>
      <Card>
        {intent.slots.map((slot: any) => (
          <Card key={slot.intentSlotId} className="mb-4">
            <div className="flex gap-3">
              <div className="w-46 h-40">
                <img
                  src={slot.room.images?.[0]?.imageUrl || "/no-image.png"}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  {slot.room.roomName}
                </h3>

                <p className="text-gray-500 text-sm mb-2">
                  {new Date(slot.startTime).toLocaleString("vi-VN")} →
                  {new Date(slot.endTime).toLocaleString("vi-VN")}
                </p>
                <p className="mb-2">Số lượng: {slot.quantity}</p>
                <p>Sức chứa: {slot.room.capacity} người</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {slot.room.amenities?.map((a: any) => (
                    <span
                      key={a.amenityId}
                      className="bg-gray-100 px-2 py-1 rounded text-sm"
                    >
                      {a.amenityName}
                    </span>
                  ))}
                </div>
              </div>

              <div className="w-48 text-right flex flex-col justify-between">
                <div>
                  <p className="text-red-500 text-xl font-bold">
                    {slot.room.price?.toLocaleString()} VNĐ
                  </p>

                  <p className="text-gray-400 text-sm">/ khung giờ</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </Card>
    </>
  );
}
