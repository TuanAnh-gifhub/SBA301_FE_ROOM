import RoomCard from "./RoomCard";

export default function RoomListPage({ rooms }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Các phòng còn trống</h2>

      {rooms.map((room: any) => (
        <RoomCard key={room.roomId} room={room} />
      ))}
    </div>
  );
}
