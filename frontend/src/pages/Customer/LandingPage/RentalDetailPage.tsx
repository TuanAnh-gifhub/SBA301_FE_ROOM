import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import rentalAreasService from "../../../services/rental-areas/rentalAreas";
import RentalHeader from "./RentalHeader";
import RoomListPage from "./RoomListPage";
import { BookingProvider } from "../../Customer/Booking/BookingContext";
import { Row, Col } from "antd";
import BookingPanel from "../Booking/BookingPanel";
import { useAuth } from "../../../context/AuthContext";
import type { Room } from "../../../types/room";

export default function RentalDetailPage() {
  const { id } = useParams();

  const { user } = useAuth();
  const [rental, setRental] = useState<any>(null);
  const [selectedRooms, setSelectedRooms] = useState<
    Record<string, { room: Room; quantity: number }>
  >({});

  const openChatWithUser = (userId: string, userName: string) => {
    console.log("--- Bắt đầu phát Event ---");
    console.log("Target User ID:", userId);
    console.log("Target User Name:", userName);

    const event = new CustomEvent("OPEN_CHAT_WITH_USER", {
      detail: { userId, userName },
    });

    window.dispatchEvent(event);
    console.log("Event 'OPEN_CHAT_WITH_USER' đã được dispatch vào window.");
  };

  const handleContactHost = (room: Room, qty: number) => {
    console.log("Nút 'Nhắn tin với chủ nhà' đã được click.");

    if (!rental) {
      console.warn("Click nhưng dữ liệu 'rental' đang null!");
      return;
    }

    if (rental.ownerId) {
      openChatWithUser(rental.ownerId, rental.ownerName);
    } else {
      console.error(
        "Không tìm thấy thông tin 'owner' trong dữ liệu rental:",
        rental,
      );
      console.log("Kiểm tra toàn bộ object rental để tìm ID chủ nhà:", rental);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await rentalAreasService.getDetail(id!);
      console.log("Dữ liệu API trả về:", res.data.result);
      setRental(res.data.result);
    } catch (error) {
      console.error("Lỗi khi fetch dữ liệu rental:", error);
    }
  };

  const handleQuantityChange = (room: Room, qty: number) => {
    setSelectedRooms((prev) => {
      const updated = { ...prev };
      if (qty === 0) {
        delete updated[room.id];
      } else {
        updated[room.id] = { room, quantity: qty };
      }
      return updated;
    });
  };

  if (!rental) return <p>Loading...</p>;

  return (
    <>
      <RentalHeader rental={rental} />

      <div style={{ marginBottom: 16 }}>
        <button
          onClick={handleContactHost}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nhắn tin với chủ nhà
        </button>
      </div>

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
                  <div key={item.room.name} className="mb-2">
                    {item.room.name} - Số lượng: {item.quantity}
                  </div>
                ))}
              </div>
            )}
            <BookingPanel
              room={Object.values(selectedRooms)[0]?.room || null}
              quantity={Object.values(selectedRooms)[0]?.quantity || 0}
              userId={user?.userId || ""}
            />
          </Col>
        </Row>
      </BookingProvider>
    </>
  );
}
