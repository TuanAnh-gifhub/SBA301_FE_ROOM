import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import rentalAreasService from "../../../services/rental-areas/rentalAreas";
import RentalHeader from "./RentalHeader";
import RoomListPage from "./RoomListPage";
import { BookingProvider } from "../../Customer/Booking/BookingContext";
import { Row, Col } from "antd";
import BookingPanel from "../Booking/BookingPanel";
import { useAuth } from "../../../context/AuthContext";
export default function RentalDetailPage() {
  const { id } = useParams();
  const [rental, setRental] = useState<any>(null);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    const res = await rentalAreasService.getDetail(id!);
    setRental(res.data.result);
  };
  const [selectedRooms, setSelectedRooms] = useState<
    Record<string, { room: Room; quantity: number }>
  >({});
  const [quantity, setQuantity] = useState(0);
  if (!rental) return <p>Loading...</p>;
  const { user } = useAuth();

  const handleQuantityChange = (room: Room, qty: number) => {
    setSelectedRooms((prev) => {
      const updated = { ...prev };

      if (qty === 0) {
        delete updated[room.roomId];
      } else {
        updated[room.roomId] = {
          room,
          quantity: qty,
        };
      }

      return updated;
    });
  };
  return (
    <>
      <RentalHeader rental={rental} />
      <BookingProvider>
        <Row gutter={24}>
          <Col span={16}>
            <RoomListPage
              rooms={rental.rooms}
              onQuantityChange={handleQuantityChange}
            />
          </Col>

          <Col span={8}>
            {selectedRooms && Object.keys(selectedRooms).length > 0 && (
              <div className="p-4 border rounded-lg">
                <h3 className="font-bold mb-2">Phòng đã chọn:</h3>
                {Object.values(selectedRooms).map((item) => (
                  <div key={item.room.roomId} className="mb-2">
                    {item.room.roomName} - Số lượng: {item.quantity}
                  </div>
                ))}
              </div>
            )}
            <BookingPanel
              selectedRooms={selectedRooms}
              userId={user?.userId || ""}
            />
          </Col>
        </Row>
      </BookingProvider>
    </>
  );
}
