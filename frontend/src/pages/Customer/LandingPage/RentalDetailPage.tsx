import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Breadcrumb, Card, Skeleton } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

import rentalAreasService from "../../../services/rental-areas/rentalAreas";
import { createBookingIntent } from "../../../services/booking/bookingService";
import { useAuth } from "../../../context/AuthContext";

import BookingPanel from "../Booking/BookingPanel";
import BookingSearchBar from "../Booking/BookingSearchBar";
import RentalGallery from "../Rental/RentalGallery";
import HostCard from "../Rental/HostCard";
import RentalInfo from "../Rental/RentalInfo";
import RoomCardList from "./RoomListPage";
import AmenitiesSection from "../ProductDetail/AmenitiesSection";

import type { Room } from "../../../types/booking";

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
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [rental, setRental] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<Cart>([]);
  const [filter, setFilter] = useState<BookingFilter>({
    date: "",
    start: "07:00",
    end: "09:00",
  });

  useEffect(() => {
    if (!id) return;
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await rentalAreasService.getDetail(id!);

      const payload = res?.data?.result ?? res?.result ?? null;
      setRental(payload);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Không tải được chi tiết khu vực cho thuê",
      );
    } finally {
      setLoading(false);
    }
  };

  const validateFilter = () => {
    if (!filter.date) {
      toast.error("Vui lòng chọn ngày");
      return false;
    }

    if (!filter.start || !filter.end || filter.start >= filter.end) {
      toast.error("Khung giờ không hợp lệ");
      return false;
    }

    return true;
  };

  const getAvailableCopies = (room: Room) => {
    return (room.roomCopies || []).filter(
      (c) => c.roomCopyStatus === "AVAILABLE",
    ).length;
  };

  const addRoom = (room: Room) => {
    if (!validateFilter()) return;

    const maxCopies = getAvailableCopies(room);
    if (maxCopies <= 0) {
      toast.error("Phòng này hiện không còn trống");
      return;
    }

    let added = false;

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

    if (added) {
      toast.success("Thêm phòng vào giỏ hàng thành công");
    }
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

  const totalSelectedRooms = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const totalAvailableRooms = useMemo(() => {
    const rooms = rental?.rooms || [];
    return rooms.reduce((sum: number, room: Room) => {
      return sum + getAvailableCopies(room);
    }, 0);
  }, [rental]);

  const rentalAmenities = useMemo(() => {
    const amenityMap = new Map<
      number,
      {
        amenityId: number;
        amenityName: string;
        iconKey?: string | null;
      }
    >();

    (rental?.rooms || []).forEach((room: any) => {
      (room?.amenities || []).forEach((item: any) => {
        if (!amenityMap.has(item.amenityId)) {
          amenityMap.set(item.amenityId, {
            amenityId: item.amenityId,
            amenityName: item.amenityName,
            iconKey: item.iconKey,
          });
        }
      });
    });

    return Array.from(amenityMap.values());
  }, [rental]);

  const submitBooking = async () => {
    try {
      if (!cart.length) {
        toast.error("Vui lòng chọn ít nhất một phòng");
        return;
      }

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

      const res = await createBookingIntent(payload);

      if (res.code === 200) {
        toast.success(
          "Hãy xác nhận phòng và hoàn tất thanh toán trong 15 phút.",
        );
        navigate(`/customer/bookings/${res.result.bookingIntentId}`);
        setCart([]);
        return;
      }

      toast.error(res.message || "Đặt phòng thất bại");
    } catch (err) {
      console.error(err);
      toast.error("Đã xảy ra lỗi khi tạo đơn đặt phòng");
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-4">
        <div className="px-4">
          <div className="max-w-[1400px] mx-auto">
            <Card className="rounded-2xl shadow-sm">
              <Skeleton active paragraph={{ rows: 12 }} />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="bg-gray-50 min-h-screen py-4">
        <div className="px-4">
          <div className="max-w-[1400px] mx-auto">
            <Alert
              type="warning"
              showIcon
              message="Không tìm thấy khu vực cho thuê"
              description="Dữ liệu không tồn tại hoặc đã bị ẩn."
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f6f7fb] min-h-screen py-4">
      <div className="px-4 lg:px-6">
        <div className="max-w-[1500px] mx-auto">
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

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-8 space-y-4">
              <RentalGallery rental={rental} />

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <RentalInfo rental={rental} />
              </div>

              <AmenitiesSection amenities={rentalAmenities} />

              <div className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Chọn thời gian đặt phòng
                    </h2>
                    <p className="text-gray-500 mt-1">
                      Chọn ngày và khung giờ trước khi thêm phòng vào giỏ.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm">
                    <div className="rounded-full bg-blue-50 text-blue-700 px-4 py-2 font-medium">
                      Tổng phòng khả dụng: {totalAvailableRooms}
                    </div>
                    <div className="rounded-full bg-green-50 text-green-700 px-4 py-2 font-medium">
                      Đã chọn: {totalSelectedRooms}
                    </div>
                  </div>
                </div>

                <BookingSearchBar filter={filter} setFilter={setFilter} />
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-5">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Danh sách phòng
                  </h2>
                  <p className="text-gray-500 mt-1">
                    Chọn phòng phù hợp với nhu cầu và thêm vào giỏ đặt phòng.
                  </p>
                </div>

                <RoomCardList rooms={rental.rooms || []} onAddRoom={addRoom} />
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Chính sách & lưu ý
                </h2>
                <div className="text-gray-600 leading-7">
                  Vui lòng kiểm tra kỹ ngày, giờ và số lượng phòng trước khi xác
                  nhận. Sau khi tạo yêu cầu đặt phòng, bạn cần hoàn tất xác nhận
                  trong thời gian quy định để giữ chỗ.
                </div>
              </div>
            </div>

            <div className="xl:col-span-4">
              <div className="xl:sticky xl:top-4 space-y-4">
                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <HostCard rental={rental} />
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-4">
                  <BookingPanel
                    cart={cart}
                    increase={increase}
                    decrease={decrease}
                    onSubmit={submitBooking}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
