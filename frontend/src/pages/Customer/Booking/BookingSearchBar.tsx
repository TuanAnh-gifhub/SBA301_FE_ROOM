import { toast } from "react-toastify";

// Hàm tạo option từ 00:00 đến 23:30
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
    .toString()
    .padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

export default function BookingSearchBar({ filter, setFilter }) {
  const handleAddTime = () => {
    const { date, start, end } = filter;

    if (!date || !start || !end) {
      toast.error("Vui lòng chọn đầy đủ ngày và thời gian");
      return;
    }

    if (start >= end) {
      toast.error("Thời gian kết thúc phải lớn hơn thời gian bắt đầu");
      return;
    }

    toast.success("Thêm khung giờ thành công!");
  };

  const renderTimeSelect = (label, value, field) => (
    <div className="flex flex-col flex-1">
      <label className="text-xs text-gray-500 mb-1 font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) =>
          setFilter((prev) => ({ ...prev, [field]: e.target.value }))
        }
        className="border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
      >
        <option value="">--:--</option>
        {TIME_OPTIONS.map((time) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="mb-8">
      <div className="flex items-end gap-4 bg-white shadow-md rounded-2xl px-6 py-5 border border-gray-100">
        {/* Chọn Ngày */}
        <div className="flex flex-col flex-1">
          <label className="text-xs text-gray-500 mb-1 font-medium">Ngày</label>
          <input
            type="date"
            value={filter.date}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, date: e.target.value }))
            }
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Chọn Bắt đầu & Kết thúc */}
        {renderTimeSelect("Bắt đầu", filter.start, "start")}
        {renderTimeSelect("Kết thúc", filter.end, "end")}

        <button
          onClick={handleAddTime}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl h-[42px] font-medium transition-all shadow-sm active:scale-95"
        >
          Thêm khung giờ
        </button>
      </div>
    </div>
  );
}
