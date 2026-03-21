import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import rentalAreasService from "../../../services/rental-areas/rentalAreas";
import { toast } from "react-toastify";
import {
  Modal,
  Input,
  List,
  Typography,
  Divider,
  Breadcrumb,
  Skeleton,
} from "antd";
import {
  HomeOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
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

const { TextArea } = Input;
const { Text, Title } = Typography;

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
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [rental, setRental] = useState<any>(null);
  const [cart, setCart] = useState<Cart>([]);
  const [completedBookingId, setCompletedBookingId] = useState<string>();

  const [filter, setFilter] = useState<BookingFilter>({
    date: "",
    start: "07:00",
    end: "09:00",
  });

  const [openConfirm, setOpenConfirm] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (!user?.userId || !id) return;
    fetchCompletedBooking();
  }, [user?.userId, id]);

  const fetchDetail = async () => {
    try {
      const res = await rentalAreasService.getDetail(id!);
      setRental(res.data.result);
    } catch (error) {
      toast.error("Không thể tải chi tiết khu vực cho thuê");
    }
  };

  const fetchCompletedBooking = async () => {
    try {
      const res = await getBookingsByUserId({
        userId: user?.userId,
        bookingStatus: "COMPLETED",
        page: 1,
        size: 5,
      });

      const bookings = res?.result?.data ?? res?.result ?? [];
      const first = Array.isArray(bookings) ? bookings[0] : null;

      if (first?.bookingId) {
        setCompletedBookingId(first.bookingId);
      }
    } catch (err) {
      console.error("Không thể kiểm tra booking COMPLETED:", err);
    }
  };

  const validateFilter = () => {
    if (!filter.date) {
      toast.error("Vui lòng chọn ngày");
      return false;
    }

    if (!filter.start || !filter.end) {
      toast.error("Vui lòng chọn đầy đủ thời gian");
      return false;
    }

    if (filter.start >= filter.end) {
      toast.error("Thời gian không hợp lệ");
      return false;
    }

    return true;
  };

  const getAvailableCopies = (room: Room) => {
    return room.roomCopies.filter((c) => c.roomCopyStatus === "AVAILABLE")
      .length;
  };

  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const isTimeOverlap = (
    startA: string,
    endA: string,
    startB: string,
    endB: string,
  ) => {
    return (
      toMinutes(startA) < toMinutes(endB) && toMinutes(startB) < toMinutes(endA)
    );
  };

  const hasConflictInCart = (
    roomId: string,
    date: string,
    startTime: string,
    endTime: string,
    ignoreExactMatch = false,
  ) => {
    return cart.some((item) => {
      const sameRoom = item.room.roomId === roomId;
      const sameDate = item.date === date;

      if (!sameRoom || !sameDate) return false;

      const exactSameSlot =
        item.startTime === startTime && item.endTime === endTime;

      if (ignoreExactMatch && exactSameSlot) {
        return false;
      }

      return isTimeOverlap(startTime, endTime, item.startTime, item.endTime);
    });
  };

  const validateCartConflicts = (items: Cart) => {
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i];
        const b = items[j];

        const sameRoom = a.room.roomId === b.room.roomId;
        const sameDate = a.date === b.date;

        if (!sameRoom || !sameDate) continue;

        if (isTimeOverlap(a.startTime, a.endTime, b.startTime, b.endTime)) {
          return {
            valid: false,
            itemA: a,
            itemB: b,
          };
        }
      }
    }

    return { valid: true as const };
  };

  const addRoom = (room: Room) => {
    if (!validateFilter()) return;

    const maxCopies = getAvailableCopies(room);

    if (maxCopies <= 0) {
      toast.error("Phòng này hiện không còn lượt khả dụng");
      return;
    }

    const hasConflict = hasConflictInCart(
      room.roomId,
      filter.date,
      filter.start,
      filter.end,
      true,
    );

    if (hasConflict) {
      toast.error("Khung giờ này bị trùng với lịch bạn đã chọn cho phòng này");
      return;
    }

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
        copy[index].quantity = Math.min(copy[index].quantity + 1, maxCopies);

        if (copy[index].quantity === prev[index].quantity) {
          toast.warning("Đã đạt số lượng phòng khả dụng tối đa");
        } else {
          toast.success("Đã tăng số lượng phòng");
        }

        return copy;
      }

      toast.success("Đã thêm phòng vào giỏ");

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
      const max = getAvailableCopies(copy[index].room);
      const nextQty = Math.min(copy[index].quantity + 1, max);

      if (nextQty === copy[index].quantity) {
        toast.warning("Đã đạt số lượng phòng khả dụng tối đa");
        return prev;
      }

      copy[index].quantity = nextQty;
      return copy;
    });
  };

  const decrease = (index: number) => {
    setCart((prev) => {
      const copy = [...prev];
      const qty = copy[index].quantity - 1;

      if (qty <= 0) {
        copy.splice(index, 1);
      } else {
        copy[index].quantity = qty;
      }

      return copy;
    });
  };

  const openBookingConfirm = () => {
    if (!cart.length) {
      toast.warning("Bạn chưa chọn phòng nào");
      return;
    }

    const conflictCheck = validateCartConflicts(cart);

    if (!conflictCheck.valid) {
      toast.error(
        "Giỏ đặt phòng đang có khung giờ bị trùng, vui lòng kiểm tra lại",
      );
      return;
    }

    setOpenConfirm(true);
  };

  const submitBooking = async () => {
    if (!user?.userName) {
      toast.error("Thiếu tên người dùng");
      return;
    }

    if (!user?.phone) {
      toast.error("Vui lòng cập nhật số điện thoại trước khi đặt phòng");
      return;
    }

    const conflictCheck = validateCartConflicts(cart);

    if (!conflictCheck.valid) {
      toast.error(
        "Giỏ đặt phòng đang có khung giờ bị trùng, vui lòng kiểm tra lại",
      );
      return;
    }

    try {
      const slotRequests = cart.map((item) => ({
        roomId: item.room.roomId,
        quantity: item.quantity,
        startTime: `${item.date}T${item.startTime}:00`,
        endTime: `${item.date}T${item.endTime}:00`,
      }));

      const payload = {
        userId: user?.userId,
        userName: user?.userName,
        userPhone: user?.phone,
        bookingType: "HOURLY",
        numberOfMonths: 0,
        note,
        slotRequests,
      };

      const res = await createBookingIntent(payload);

      if (res.code === 200) {
        toast.success(
          "Tạo booking thành công. Vui lòng thanh toán trong 15 phút",
        );
        navigate(`/customer/bookings/${res.result.bookingIntentId}`);
        setCart([]);
        setOpenConfirm(false);
        setNote("");
      } else {
        toast.error(res.message || "Đặt phòng thất bại");
      }
    } catch (err: any) {
      toast.error("Có lỗi xảy ra khi đặt phòng");
    }
  };

  if (!rental) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-6">
        <Skeleton active paragraph={{ rows: 12 }} />
      </div>
    );
  }

  const isOwner = user?.userId === rental?.ownerId;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-5 md:py-7">
        <div className="mb-4">
          <Breadcrumb
            items={[
              {
                title: (
                  <span className="flex items-center gap-1">
                    <HomeOutlined />
                    Trang chủ
                  </span>
                ),
              },
              {
                title: "Khu vực cho thuê",
              },
              {
                title: rental?.rentalAreaName || "Chi tiết",
              },
            ]}
          />
        </div>

        <div className="space-y-6">
          <RentalGallery rental={rental} />

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
            <div className="xl:col-span-8">
              <div className="h-full">
                <RentalInfo rental={rental} />
              </div>
            </div>

            <div className="xl:col-span-4">
              <div className="h-full">
                <HostCard rental={rental} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 md:p-5">
            <BookingSearchBar filter={filter} setFilter={setFilter} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            <div className="xl:col-span-8">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 md:p-6">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div>
                    <Title level={3} style={{ marginBottom: 4 }}>
                      Danh sách phòng
                    </Title>
                    <Text type="secondary">
                      Chọn phòng phù hợp với nhu cầu và khung giờ của bạn
                    </Text>
                  </div>
                </div>

                <RoomCardList rooms={rental.rooms} onAddRoom={addRoom} />
              </div>
            </div>

            <div className="xl:col-span-4">
              <div className="xl:sticky xl:top-6">
                <BookingPanel
                  cart={cart}
                  increase={increase}
                  decrease={decrease}
                  onSubmit={openBookingConfirm}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 md:p-6">
            <div className="mb-5">
              <Title level={3} style={{ marginBottom: 4 }}>
                Đánh giá từ khách hàng
              </Title>
              <Text type="secondary">
                Xem phản hồi thực tế từ những người đã sử dụng không gian này
              </Text>
            </div>

            <ReviewSection
              rentalAreaId={rental.rentalAreaId}
              bookingId={completedBookingId}
              currentUserId={user?.userId}
              isOwner={isOwner}
            />
          </div>
        </div>

        <Modal
          title="Xác nhận đặt phòng"
          open={openConfirm}
          onCancel={() => setOpenConfirm(false)}
          onOk={submitBooking}
          okText="Xác nhận & thanh toán"
          cancelText="Hủy"
        >
          <Text strong>Danh sách phòng đã chọn:</Text>

          <List
            dataSource={cart}
            renderItem={(item) => (
              <List.Item>
                <div>
                  <div className="font-medium">{item.room.name}</div>
                  <div className="text-slate-500">
                    {item.date} | {item.startTime} - {item.endTime}
                  </div>
                  <div>Số lượng: {item.quantity}</div>
                </div>
              </List.Item>
            )}
          />

          <Divider />

          <Text strong>Ghi chú thêm:</Text>
          <TextArea
            rows={3}
            placeholder="Nhập yêu cầu thêm (nếu có)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Modal>
      </div>
    </div>
  );
}
