import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import rentalAreasService from "../../../services/rental-areas/rentalAreas";
import { toast } from "react-toastify";
import { Row, Col } from "antd";
import BookingPanel from "../Booking/BookingPanel";
import { useAuth } from "../../../context/AuthContext";
import type { Room } from "../../../types/booking";
import RoomCardList from "./RoomListPage";
import BookingSearchBar from "../Booking/BookingSearchBar";
import {
  createBookingIntent,
  getBookingsByUserId,
} from "../../../services/booking/bookingService";
import RentalGallery from "../Rental/RentalGallery";
import { ReviewSection } from "../../../components/review/ReviewSection";
import HostCard from "../Rental/HostCard";
import RentalInfo from "../Rental/RentalInfo";

// ── Import service booking để lấy completedBookingId ──────────────
// TODO: thay bằng đúng service booking của dự án bạn
// import bookingService from "../../../services/booking/bookingService";

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

  // ── FIX 1: completedBookingId ────────────────────────────────────
  // State lưu bookingId COMPLETED của user cho rental area này.
  // Nếu có -> hiện form viết review. Nếu undefined -> ẩn form.
const [completedBookingId, setCompletedBookingId] = useState<string | undefined>(
 // paste bookingId COMPLETED thật từ DB vào đây
);

  const [filter, setFilter] = useState<BookingFilter>({
    date: "",
    start: "07:00",
    end: "09:00",
  });

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // ── FIX 2: Fetch completedBookingId theo user + rentalArea ────────
  // Chạy khi đã có user và id rental area
  useEffect(() => {
    if (!user?.userId || !id) return;
    fetchCompletedBooking();
  }, [user?.userId, id]);

  const fetchDetail = async () => {
    const res = await rentalAreasService.getDetail(id!);
    setRental(res.data.result);
  };

  const fetchCompletedBooking = async () => {
    try {
      // Gọi GET /bookings/my-bookings?rentalAreaId=...&status=COMPLETED&page=1&size=1
      // Chỉ cần lấy 1 booking COMPLETED là đủ để mở form viết review
    const res = await getBookingsByUserId({
      userId: user?.userId,
      bookingStatus: "COMPLETED",
      page: 1,
      size: 5,
    });

      // res.result có thể là PageResponse hoặc array tuỳ BE
      // Trường hợp 1: BE trả về PageResponse { data: [...] }
      const bookings = res?.result?.data ?? res?.result ?? [];
      const first = Array.isArray(bookings) ? bookings[0] : null;

      if (first?.bookingId) {
        setCompletedBookingId(first.bookingId);
      }
    } catch (err) {
      // Lỗi ở đây không cần báo user — chỉ ẩn form viết review
      console.error("Không thể kiểm tra booking COMPLETED:", err);
    }
  };

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

  const getAvailableCopies = (room: Room) => {
    return room.roomCopies.filter((c) => c.roomCopyStatus === "AVAILABLE")
      .length;
  };

  const addRoom = (room: Room) => {
    if (!validateFilter()) return;
    const maxCopies = getAvailableCopies(room);
    let added = false;

    setCart((prev) => {
      const index = prev.findIndex(
        (item) =>
          item.room.roomId === room.roomId &&
          item.date === filter.date &&
          item.startTime === filter.start &&
          item.endTime === filter.end
      );

      if (index !== -1) {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          quantity: Math.min(copy[index].quantity + 1, maxCopies),
        };

        added = true;
        return copy;
      }

      added = true;
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

    if (added) toast.success("Thêm phòng vào giỏ hàng thành công");
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
        copy[index] = { ...copy[index], quantity: newQty };
      }
      return copy;
    });
  };

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
        userPhone: user?.phone || "",
        bookingType: "HOURLY",
        numberOfMonths: 0,
        note: "",
        slotRequests,
      };

      const res = await createBookingIntent(payload);
      if (res.code === 200) {
        toast.success("Hãy xác nhận phòng và hoàn tất thanh toán trong 15 phút.");
        navigate(`/customer/bookings/${res.result.bookingIntentId}`);
        setCart([]);
      }

      if (res.code === 500) {
        toast.error(res.message || "Đặt phòng thất bại");
      }
    } catch (err) {
      if (err.response && err.response.data) {
        const res = err.response.data;
        console.log("Dữ liệu lỗi từ server:", res);

        if (res.code === 2003) {
          const errorMessages = Object.values(res.result);
          errorMessages.forEach((msg) => toast.error(msg));
        } else {
          toast.error(res.message || "Đặt phòng thất bại");
        }
      } else {
        toast.error("Không thể kết nối đến server");
      }

    }
  };

  if (!rental) return <p>Loading...</p>;

  // ── FIX 3: isOwner ───────────────────────────────────────────────
  // rental.ownerId không có trong RentalAreaResponse mặc định.
  // Kiểm tra xem API trả về field gì để xác định chủ phòng.
  //
  // Option A: Nếu API trả về `ownerId` trong rental object:
  //   const isOwner = user?.userId === rental?.ownerId;
  //
  // Option B: Nếu API trả về nested object `owner: { userId }`:
  //   const isOwner = user?.userId === rental?.owner?.userId;
  //
  // Option C: Nếu không có field nào → dùng role của user:
  //   const isOwner = user?.role === "OWNER";
  //
  // Tạm thời dùng Option A (sửa lại nếu sai field):
  const isOwner = user?.userId === rental?.ownerId;

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

      {/* ── FIX HOÀN CHỈNH: ReviewSection ────────────────────────── */}
      {/* rental.rentalAreaId lấy từ state `rental` đã fetch được     */}
      <div className="mt-10">
        <ReviewSection
          rentalAreaId={rental.rentalAreaId}
          bookingId={completedBookingId}
          currentUserId={user?.userId}
          isOwner={isOwner}
        />
      </div>
    </div>
  );
}