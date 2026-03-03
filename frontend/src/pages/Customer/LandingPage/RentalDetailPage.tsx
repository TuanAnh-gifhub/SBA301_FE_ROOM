import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import rentalAreasService from "../../../services/rental-areas/rentalAreas";
import RentalHeader from "./RentalHeader";
import RoomListPage from "./RoomListPage";
import { toast } from "react-toastify";
import { Row, Col } from "antd";
import BookingPanel from "../Booking/BookingPanel";
import { useAuth } from "../../../context/AuthContext";
import type { Room } from "../../../types/booking";
import RoomCardList from "./RoomListPage";
import BookingSearchBar from "../Booking/BookingSearchBar";
import { createBookingIntent } from "../../../services/booking/bookingService";
import RentalGallery from "../Rental/RentalGallery";

import HostCard from "../Rental/HostCard";
import RentalInfo from "../Rental/RentalInfo";

interface BookingSlot {
  roomId: string;
  room: Room;
  date: string;
  start: string;
  end: string;
  quantity: number;
}
interface BookingFilter {
  date: string;
  start: string;
  end: string;
}
type CartItem = {
  room: Room;
  date: string;
  startTime: string;
  endTime: string;
  quantity: number;
};

type Cart = CartItem[];
export default function RentalDetailPage() {
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const { id } = useParams();
  const [rental, setRental] = useState<any>(null);
  const [quantity, setQuantity] = useState(0);
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart>([]);
  const navigate = useNavigate();

  const validateFilter = () => {
    if (!filter.date) {
      toast.error("Chọn ngày");
      return false;
    }

    if (filter.start >= filter.end) {
      toast.error("Giờ không hợp lệ");
      return false;
    }

    return true;
  };
  const [filter, setFilter] = useState<BookingFilter>({
    date: "",
    start: "07:00",
    end: "09:00",
  });
  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    const res = await rentalAreasService.getDetail(id!);
    setRental(res.data.result);
  };
  const getAvailableCopies = (room: Room) => {
    return room.roomCopies.filter((c) => c.roomCopyStatus === "AVAILABLE")
      .length;
  };
  const addRoom = (room: Room) => {
    if (!validateFilter()) return;

    const maxCopies = getAvailableCopies(room);

    setCart((prev) => {
      const index = prev.findIndex(
        (item) =>
          item.room.roomId === room.roomId &&
          item.date === filter.date &&
          item.startTime === filter.start &&
          item.endTime === filter.end,
      );

      if (index !== -1) {
        const copy = [...prev];

        const newQty = copy[index].quantity + 1;

        copy[index] = {
          ...copy[index],
          quantity: Math.min(newQty, maxCopies),
        };

        return copy;
      }

      return [
        ...prev,
        {
          room,
          date: filter.date,
          startTime: filter.start,
          endTime: filter.end,
          quantity: 1,
        },
      ];
    });
  };
  const increase = (index: number) => {
    setCart((prev) => {
      const copy = [...prev];

      const maxCopies = getAvailableCopies(copy[index].room);

      copy[index] = {
        ...copy[index],
        quantity: Math.min(copy[index].quantity + 1, maxCopies),
      };

      return copy;
    });
  };
  const decrease = (index: number) => {
    setCart((prev) => {
      const copy = [...prev];

      const newQty = copy[index].quantity - 1;

      if (newQty <= 0) {
        copy.splice(index, 1);
      } else {
        copy[index] = {
          ...copy[index],
          quantity: newQty,
        };
      }

      return copy;
    });
  };

  if (!rental) return <p>Loading...</p>;

  const submitBooking = async () => {
    try {
      const slotRequests = cart.map((item) => ({
        roomId: item.room.roomId,
        quantity: item.quantity,
        startTime: `${item.date}T${item.startTime}:00`,
        endTime: `${item.date}T${item.endTime}:00`,
      }));

      const payload = {
        userId: user?.userId,
        userName: user?.name,
        userPhone: user?.phone,
        bookingType: "HOURLY",
        numberOfMonths: 0,
        note: "",
        slotRequests,
      };

      console.log(" SEND", payload);

      const res = await createBookingIntent(payload);
      if (res.code === 200) {
        toast.success(
          "Hãy xác nhận  phòng và hoàn tất thanh toán trong 15 phút.",
        );
        navigate(`/customer/bookings/${res.result.bookingIntentId}`);
        setCart([]);
      }
      if (res.code === 500) {
        toast.error(res.message || "Đặt phòng thất bại");
      }
      console.log(" CREATED", res.result);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="max-w-[1150px] mx-auto px-4 mt-3">
      <RentalGallery rental={rental} />

      <div className="grid grid-cols-12 gap-8 mt-6">
        <div className="col-span-8">
          <RentalInfo rental={rental} />
        </div>

        <div className="col-span-4">
          <HostCard rental={rental} />
        </div>
      </div>

      <Row gutter={24} style={{ marginTop: 32 }}>
        <Col span={24}>
         
            <BookingSearchBar filter={filter} setFilter={setFilter} />
        
        </Col>
      </Row>

   
      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col span={16}>
          <RoomCardList rooms={rental.rooms} onAddRoom={addRoom} />
        </Col>

        <Col span={8}>
          <BookingPanel
            cart={cart}
            increase={increase}
            decrease={decrease}
            onSubmit={submitBooking}
          />
        </Col>
      </Row>
    </div>
  );
}
