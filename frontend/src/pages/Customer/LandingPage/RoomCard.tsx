 import BookingPanel from "./BookingPanel";

export default function RoomCard({ room }: any) {
  return (
    <div className="border rounded-xl p-6 flex justify-between">
      <div>
        <h3 className="font-semibold text-lg">
          {room.roomName}
        </h3>

        <p>Sức chứa: {room.capacity} người</p>

        <p className="text-blue-600 font-semibold mt-2">
          {room.price.toLocaleString()} VND / giờ
        </p>
      </div>

      <BookingPanel room={room} />
    </div>
  );
}