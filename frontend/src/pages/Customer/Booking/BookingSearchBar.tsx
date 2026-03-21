import { CalendarOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

export default function BookingSearchBar({ filter, setFilter }) {
  const handleAddTime = () => {
    if (!filter.date || !filter.start || !filter.end) {
      toast.error("Vui lòng chọn đầy đủ ngày và thời gian");
      return;
    }

    if (filter.start >= filter.end) {
      toast.error("Thời gian kết thúc phải lớn hơn thời gian bắt đầu");
      return;
    }

    toast.success("Thêm khung giờ thành công! Hãy thêm phòng và đặt lịch.");
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <label className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-2">
              <CalendarOutlined />
              Ngày sử dụng
            </label>
            <input
              type="date"
              value={filter.date}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  date: e.target.value,
                }))
              }
              className="w-full bg-transparent text-slate-800 border-none outline-none"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <label className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-2">
              <ClockCircleOutlined />
              Bắt đầu
            </label>
            <input
              type="time"
              value={filter.start}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  start: e.target.value,
                }))
              }
              className="w-full bg-transparent text-slate-800 border-none outline-none"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <label className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-2">
              <ClockCircleOutlined />
              Kết thúc
            </label>
            <input
              type="time"
              value={filter.end}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  end: e.target.value,
                }))
              }
              className="w-full bg-transparent text-slate-800 border-none outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleAddTime}
          className="h-[52px] px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow-sm"
        >
          Áp dụng khung giờ
        </button>
      </div>
    </div>
  );
}
