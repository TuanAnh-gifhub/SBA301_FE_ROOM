import React, { useState } from "react";
import {
  Modal,
  Radio,
  Space,
  InputNumber,
  Alert,
  Tag,
  Button,
  Divider,
  Typography,
  DatePicker,
  TimePicker,
  Spin,
  Card,
  message,
} from "antd";
import {
  ClockCircleOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  WarningOutlined,
  WalletOutlined,
  CreditCardOutlined,
  DollarOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { bookingSlotService } from "../../../services/bookingSlotService";

const { Text } = Typography;

// --- Types ---
interface Props {
  open: boolean;
  booking: any;
  onClose: () => void;
  onSuccess: () => void; // Dùng để trigger fetch lại data ở page cha
}

type Mode = "extend" | "swap";

// Quản lý state cho từng Slot riêng biệt
interface SlotState {
  checking: boolean;
  confirming: boolean;
  done: boolean;
  checkResult: any | null;
  // Dành riêng cho Swap
  swapDate?: Dayjs | null;
  swapStartTime?: Dayjs | null;
  swapEndTime?: Dayjs | null;
}

const SlotEditorModal: React.FC<Props> = ({
  open,
  booking,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<Mode>("extend");
  const [extendAmount, setExtendAmount] = useState(1);
  const [extendUnit, setExtendUnit] = useState<"hour" | "minute">("hour");

  // State tổng quản lý theo ID của Slot: { "uuid-1": { ... }, "uuid-2": { ... } }
  const [slotStates, setSlotStates] = useState<Record<string, SlotState>>({});

  const allSlots = booking?.slots ?? [];

  // --- Helpers ---
  const fmtVND = (n: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(n);

  const getSlotState = (id: string): SlotState =>
    slotStates[id] ?? {
      checking: false,
      confirming: false,
      done: false,
      checkResult: null,
      swapDate: null,
      swapStartTime: null,
      swapEndTime: null,
    };

  const updateSlotState = (id: string, patch: Partial<SlotState>) => {
    setSlotStates((prev) => ({
      ...prev,
      [id]: { ...getSlotState(id), ...patch },
    }));
  };

  const buildISO = (date: Dayjs, time: Dayjs) =>
    date
      .hour(time.hour())
      .minute(time.minute())
      .second(0)
      .format("YYYY-MM-DDTHH:mm:ss");

  const resetAll = () => {
    setSlotStates({});
    setExtendAmount(1);
    onClose();
  };

  // --- Logic Gia Hạn (Extend) ---
  const handleCheckExtend = async (slot: any) => {
    const id = slot.slotId;
    updateSlotState(id, { checking: true, checkResult: null });
    try {
      const res = await bookingSlotService.checkExtend(booking.bookingId, id, {
        amount: extendAmount,
        unit: extendUnit,
      });
      updateSlotState(id, { checkResult: res, checking: false });
    } catch (e: any) {
      updateSlotState(id, { checking: false });
      message.error(e?.response?.data?.message || "Lỗi kiểm tra gia hạn");
    }
  };

  const handleConfirmExtend = async (slot: any) => {
    const id = slot.slotId;
    updateSlotState(id, { confirming: true });
    try {
      await bookingSlotService.confirmExtend(booking.bookingId, id, {
        amount: extendAmount,
        unit: extendUnit,
      });
      updateSlotState(id, { confirming: false, done: true });
      message.success(`Đã gia hạn phòng ${slot.roomCopy?.roomCode}`);
      onSuccess(); // Update lại data tổng ở ngoài
    } catch (e: any) {
      updateSlotState(id, { confirming: false });
      message.error(e?.response?.data?.message || "Lỗi xác nhận");
    }
  };

  // --- Logic Chuyển Slot (Swap) ---
  const handleCheckSwap = async (slot: any) => {
    const id = slot.slotId;
    const s = getSlotState(id);
    if (!s.swapDate || !s.swapStartTime || !s.swapEndTime) {
      return message.warning("Vui lòng chọn đầy đủ ngày giờ mới");
    }

    updateSlotState(id, { checking: true, checkResult: null });
    try {
      const res = await bookingSlotService.checkSwap(booking.bookingId, id, {
        newStartTime: buildISO(s.swapDate, s.swapStartTime),
        newEndTime: buildISO(s.swapDate, s.swapEndTime),
      });
      updateSlotState(id, { checkResult: res, checking: false });
    } catch (e: any) {
      updateSlotState(id, { checking: false });
      message.error(e?.response?.data?.message || "Lỗi kiểm tra chuyển slot");
    }
  };

  const handleConfirmSwap = async (slot: any) => {
    const id = slot.slotId;
    const s = getSlotState(id);
    updateSlotState(id, { confirming: true });
    try {
      await bookingSlotService.confirmSwap(booking.bookingId, id, {
        newStartTime: buildISO(s.swapDate!, s.swapStartTime!),
        newEndTime: buildISO(s.swapDate!, s.swapEndTime!),
      });
      updateSlotState(id, { confirming: false, done: true });
      message.success(`Đã chuyển slot phòng ${slot.roomCopy?.roomCode}`);
      onSuccess();
    } catch (e: any) {
      updateSlotState(id, { confirming: false });
      message.error(e?.response?.data?.message || "Lỗi xác nhận chuyển");
    }
  };

  // --- Render từng thẻ Slot ---
  const renderSlotCard = (slot: any) => {
    const id = slot.slotId;
    const state = getSlotState(id);
    const originalDuration = dayjs(slot.endTime).diff(
      dayjs(slot.startTime),
      "minute",
    );

    // Nếu slot đã cập nhật xong, hiển thị trạng thái hoàn tất
    if (state.done) {
      return (
        <Alert
          key={id}
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          message={`Phòng ${slot.roomCopy?.roomCode} - Đã cập nhật thành công`}
          style={{ marginBottom: 12 }}
        />
      );
    }

    return (
      <Card
        key={id}
        size="small"
        title={
          <Space>
            <Tag color="blue">Phòng {slot.roomCopy?.roomCode}</Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {dayjs(slot.startTime).format("HH:mm")} -{" "}
              {dayjs(slot.endTime).format("HH:mm")}
            </Text>
          </Space>
        }
        extra={<Text strong>{fmtVND(slot.price)}</Text>}
        style={{
          marginBottom: 12,
          border: state.checkResult?.available ? "1px solid #52c41a" : "",
        }}
      >
        {mode === "extend" ? (
          <Space direction="vertical" style={{ width: "100%" }}>
            <div style={{ background: "#f5f5f5", padding: 8, borderRadius: 4 }}>
              <Text size="small">Kết thúc mới: </Text>
              <Text strong style={{ color: "#1890ff" }}>
                {dayjs(slot.endTime)
                  .add(extendAmount, extendUnit)
                  .format("HH:mm (DD/MM)")}
              </Text>
            </div>
            {state.checkResult && (
              <Alert
                type={state.checkResult.available ? "success" : "error"}
                message={
                  state.checkResult.available
                    ? "Có thể gia hạn"
                    : state.checkResult.conflictMessage
                }
                showIcon
                style={{ padding: "2px 8px" }}
              />
            )}
            <Space>
              <Button
                size="small"
                icon={<SearchOutlined />}
                loading={state.checking}
                onClick={() => handleCheckExtend(slot)}
              >
                Kiểm tra
              </Button>
              {state.checkResult?.available && (
                <div
                  style={{
                    marginTop: 8,
                    padding: "8px",
                    background: "#f6ffed",
                    border: "1px solid #b7eb8f",
                    borderRadius: 4,
                  }}
                >
                  <Space direction="vertical" size={0}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Phí phát sinh:{" "}
                      <Text strong>{fmtVND(state.checkResult.extraPrice)}</Text>
                    </Text>
                    <Button
                      size="small"
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      loading={state.confirming}
                      onClick={() => handleConfirmExtend(slot)}
                    >
                      Xác nhận gia hạn
                    </Button>
                  </Space>
                </div>
              )}
            </Space>
          </Space>
        ) : (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Space wrap>
              <DatePicker
                size="small"
                placeholder="Ngày mới"
                onChange={(d) =>
                  updateSlotState(id, { swapDate: d, checkResult: null })
                }
              />
              <TimePicker
                size="small"
                format="HH:mm"
                placeholder="Bắt đầu"
                onChange={(t) =>
                  updateSlotState(id, { swapStartTime: t, checkResult: null })
                }
              />
              <TimePicker
                size="small"
                format="HH:mm"
                placeholder="Kết thúc"
                onChange={(t) =>
                  updateSlotState(id, { swapEndTime: t, checkResult: null })
                }
              />
            </Space>

            {state.swapStartTime && state.swapEndTime && (
              <Text
                size="small"
                type={
                  dayjs(state.swapEndTime).diff(
                    state.swapStartTime,
                    "minute",
                  ) === originalDuration
                    ? "success"
                    : "danger"
                }
              >
                Thời lượng:{" "}
                {dayjs(state.swapEndTime).diff(state.swapStartTime, "minute")} /{" "}
                {originalDuration} phút
              </Text>
            )}

            {state.checkResult && (
              <Alert
                type={state.checkResult.available ? "success" : "error"}
                message={
                  state.checkResult.available
                    ? "Khung giờ trống"
                    : state.checkResult.conflictMessage
                }
                showIcon
              />
            )}
            <Space>
              <Button
                size="small"
                icon={<SearchOutlined />}
                loading={state.checking}
                onClick={() => handleCheckSwap(slot)}
              >
                Kiểm tra lịch
              </Button>
              {state.checkResult?.available && (
                <Button
                  size="small"
                  type="primary"
                  loading={state.confirming}
                  onClick={() => handleConfirmSwap(slot)}
                >
                  Đổi ngay
                </Button>
              )}
            </Space>
          </Space>
        )}
      </Card>
    );
  };

  return (
    <Modal
      open={open}
      title="Chỉnh sửa từng khung giờ phòng"
      onCancel={resetAll}
      width={700}
      footer={[
        <Button key="close" onClick={resetAll}>
          Đóng
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Radio.Group
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="extend">Gia hạn thêm</Radio.Button>
          <Radio.Button value="swap">Đổi khung giờ</Radio.Button>
        </Radio.Group>
      </div>

      {mode === "extend" && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: "#e6f7ff",
            borderRadius: 8,
          }}
        >
          <Space>
            <Text>Gia hạn chung cho các phòng:</Text>
            <InputNumber
              min={1}
              value={extendAmount}
              onChange={(v) => setExtendAmount(v || 1)}
            />
            <Radio.Group
              value={extendUnit}
              onChange={(e) => setExtendUnit(e.target.value)}
            >
              <Radio value="hour">Giờ</Radio>
              <Radio value="minute">Phút</Radio>
            </Radio.Group>
          </Space>
        </div>
      )}

      <Divider orientation="left" style={{ fontSize: 12 }}>
        Danh sách phòng trong Booking
      </Divider>

      <div style={{ maxHeight: "400px", overflowY: "auto", paddingRight: 8 }}>
        {allSlots.map(renderSlotCard)}
      </div>
    </Modal>
  );
};

export default SlotEditorModal;
