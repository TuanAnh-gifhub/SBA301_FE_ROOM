import RoomCard from "./RoomCard";
interface Props {
  rooms: Room[];
  onAddRoom: (room: Room) => void;
}
export default function RoomCardList({ rooms, onAddRoom }) {
  return (
    <div className="space-y-6">
      {rooms.map((room) => (
        <RoomCard key={room.roomId} room={room} onAddRoom={onAddRoom} />
      ))}
    </div>
  );
}
