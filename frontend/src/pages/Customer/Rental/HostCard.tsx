import {
  MessageOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";

export default function HostCard({ rental }: any) {
  const handleChatClick = () => {
    if (!rental.userId && !rental.ownerId) {
      console.error("Không tìm thấy ID chủ phòng");
      return;
    }

    const event = new CustomEvent("OPEN_CHAT_WITH_USER", {
      detail: {
        userId: rental.ownerId,
        userName: rental.ownerName || rental.contactName || "Chủ phòng",
      },
    });

    window.dispatchEvent(event);
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-7 shadow-sm border border-slate-200 h-full min-h-[460px] flex flex-col">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-50 flex items-center justify-center text-blue-600 text-3xl shrink-0">
          <UserOutlined />
        </div>

        <div className="min-w-0">
          <h3 className="font-bold text-xl text-slate-800 truncate">
            {rental.contactName || rental.ownerName || "Chủ phòng"}
          </h3>
          <p className="text-slate-500 text-sm mt-1">Đối tác cho thuê</p>

          <div className="mt-2 inline-flex items-center rounded-full bg-emerald-50 text-emerald-600 px-3 py-1 text-xs font-semibold">
            Phản hồi nhanh
          </div>
        </div>
      </div>

      <div className="my-6 h-px bg-slate-200" />

      <div className="space-y-4 flex-1">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <PhoneOutlined />
          </div>
          <div>
            <div className="text-sm text-slate-500">Số điện thoại</div>
            <div className="font-medium text-slate-800">
              {rental.contactPhone || "Chưa cập nhật"}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            ⭐
          </div>
          <div>
            <div className="text-sm text-slate-500">Độ tin cậy</div>
            <div className="font-medium text-slate-800">Host uy tín</div>
          </div>
        </div>
      </div>

      <button
        onClick={handleChatClick}
        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-semibold transition flex items-center justify-center gap-2"
      >
        <MessageOutlined />
        Chat ngay với chủ phòng
      </button>
    </div>
  );
}
