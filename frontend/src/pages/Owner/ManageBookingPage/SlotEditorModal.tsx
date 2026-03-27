import React, { useState, useEffect } from "react";
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
  Card,
  message,
  Select,
} from "antd";
import {
  ClockCircleOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { bookingSlotService } from "../../../services/bookingSlotService";
import { roomCopyService } from "../../../services/roomCopyService";

const { Text } = Typography;
const { Option } = Select;

// --- Types ---
interface Props {
  open: boolean;
  booking: any;
  onClose: () => void;
  onSuccess: () => void;
}

type Mode = "extend" | "swap";

interface SlotState {
  checking: boolean;
  confirming: boolean;
  done: boolean;
  checkResult: any | null;
  // State cho Swap
  swapDate?: Dayjs | null;
  swapStartTime?: Dayjs | null;
  swapEndTime?: Dayjs | null;
  swapRoomCode?: string | null;
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

  const [slotStates, setSlotStates] = useState<Record<string, SlotState>>({});

  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const allSlots = booking?.slots ?? [];

  useEffect(() => {
    if (open && booking?.rentalAreaId) {
      setLoadingRooms(true);
      roomCopyService
        .getRoomCopiesByRentalArea(booking.rentalAreaId)
        .then((res) => setAvailableRooms(res.result || []))
        .catch(() => message.error("Không thể lấy danh sách phòng của cơ sở"))
        .finally(() => setLoadingRooms(false));
    }
  }, [open, booking?.rentalAreaId]);

  // --- Helpers ---
  const fmtVND = (n: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(n);

  const getSState = (id: string): SlotState =>
    slotStates[id] ?? {
      checking: false,
      confirming: false,
      done: false,
      checkResult: null,
    };

  const updateSState = (id: string, patch: Partial<SlotState>) => {
    setSlotStates((prev) => ({
      ...prev,
      [id]: { ...getSState(id), ...patch },
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
    updateSState(id, { checking: true, checkResult: null });
    try {
      const res = await bookingSlotService.checkExtend(booking.bookingId, id, {
        amount: extendAmount,
        unit: extendUnit,
      });
      updateSState(id, { checkResult: res, checking: false });
    } catch (e: any) {
      updateSState(id, { checking: false });
      message.error(e?.response?.data?.message || "Lỗi kiểm tra gia hạn");
    }
  };

  const handleConfirmExtend = async (slot: any) => {
    const id = slot.slotId;
    updateSState(id, { confirming: true });
    try {
      await bookingSlotService.confirmExtend(booking.bookingId, id, {
        amount: extendAmount,
        unit: extendUnit,
      });
      updateSState(id, { confirming: false, done: true });
      message.success(`Đã gia hạn thành công phòng ${slot.roomCopy?.roomCode}`);
      onSuccess();
    } catch (e: any) {
      updateSState(id, { confirming: false });
      message.error(e?.response?.data?.message || "Lỗi xác nhận gia hạn");
    }
  };

  // --- Logic Đổi Khung Giờ/Phòng (Swap) ---
  const handleCheckSwap = async (slot: any) => {
    const id = slot.slotId;
    const s = getSState(id);
    if (!s.swapDate || !s.swapStartTime || !s.swapEndTime) {
      return message.warning("Vui lòng chọn đầy đủ ngày và giờ mới");
    }

    updateSState(id, { checking: true, checkResult: null });
    try {
      const res = await bookingSlotService.checkSwap(booking.bookingId, id, {
        newStartTime: buildISO(s.swapDate, s.swapStartTime),
        newEndTime: buildISO(s.swapDate, s.swapEndTime),
        newRoomCode: s.swapRoomCode || slot.roomCopy?.roomCode,
      });
      updateSState(id, { checkResult: res, checking: false });
    } catch (e: any) {
      updateSState(id, { checking: false });
      message.error(e?.response?.data?.message || "Lỗi kiểm tra đổi slot");
    }
  };

  const handleConfirmSwap = async (slot: any) => {
    const id = slot.slotId;
    const s = getSState(id);
    updateSState(id, { confirming: true });
    try {
      await bookingSlotService.confirmSwap(booking.bookingId, id, {
        newStartTime: buildISO(s.swapDate!, s.swapStartTime!),
        newEndTime: buildISO(s.swapDate!, s.swapEndTime!),
        newRoomCode: s.swapRoomCode || slot.roomCopy?.roomCode,
      });
      updateSState(id, { confirming: false, done: true });
      message.success(
        `Đã đổi thành công sang phòng ${s.swapRoomCode || slot.roomCopy?.roomCode}`,
      );
      onSuccess();
    } catch (e: any) {
      updateSState(id, { confirming: false });
      message.error(e?.response?.data?.message || "Lỗi xác nhận đổi");
    }
  };

  // --- Render từng thẻ Slot ---
  const renderSlotCard = (slot: any) => {
    const id = slot.slotId;
    const state = getSState(id);
    const originalDuration = dayjs(slot.endTime).diff(
      dayjs(slot.startTime),
      "minute",
    );

    if (state.done) {
      return (
        <Alert
          key={id}
          type="success"
          showIcon
          message={`Phòng ${slot.roomCopy?.roomCode} - Hoàn tất cập nhật`}
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
              Hiện tại: {dayjs(slot.startTime).format("HH:mm")} -{" "}
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
              <Text>Giờ kết thúc mới: </Text>
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
                size="small"
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
                <Button
                  size="small"
                  type="primary"
                  loading={state.confirming}
                  onClick={() => handleConfirmExtend(slot)}
                >
                  Xác nhận gia hạn (+{fmtVND(state.checkResult.extraPrice)})
                </Button>
              )}
            </Space>
          </Space>
        ) : (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Select
              placeholder="Chọn phòng mới (mặc định phòng cũ)"
              style={{ width: "100%" }}
              loading={loadingRooms}
              value={state.swapRoomCode}
              onChange={(val) =>
                updateSState(id, { swapRoomCode: val, checkResult: null })
              }
            >
              {availableRooms.map((r) => (
                <Option key={r.roomCopyId} value={r.roomCode}>
                  {r.roomCode} - {r.roomName}
                </Option>
              ))}
            </Select>

            <Space wrap>
              <DatePicker
                size="small"
                placeholder="Ngày mới"
                onChange={(d) =>
                  updateSState(id, { swapDate: d, checkResult: null })
                }
              />
              <TimePicker
                size="small"
                format="HH:mm"
                placeholder="Bắt đầu"
                onChange={(t) =>
                  updateSState(id, { swapStartTime: t, checkResult: null })
                }
              />
              <TimePicker
                size="small"
                format="HH:mm"
                placeholder="Kết thúc"
                onChange={(t) =>
                  updateSState(id, { swapEndTime: t, checkResult: null })
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
                    : "warning"
                }
              >
                Thời lượng mới:{" "}
                {dayjs(state.swapEndTime).diff(state.swapStartTime, "minute")}{" "}
                phút (Gốc: {originalDuration} phút)
              </Text>
            )}

            {state.checkResult && (
              <Alert
                type={state.checkResult.available ? "success" : "error"}
                message={
                  state.checkResult.available
                    ? "Phòng và khung giờ hợp lệ"
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
                  Xác nhận đổi
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
      title="Chỉnh sửa chi tiết từng khung giờ"
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
          onChange={(e) => {
            setMode(e.target.value);
            setSlotStates({});
          }}
          buttonStyle="solid"
        >
          <Radio.Button value="extend">
            <ClockCircleOutlined /> Gia hạn thêm
          </Radio.Button>
          <Radio.Button value="swap">
            <SwapOutlined /> Đổi phòng & giờ
          </Radio.Button>
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
            <Text>Gia hạn :</Text>
            <InputNumber
              min={1}
              value={extendAmount}
              onChange={(v) => {
                setExtendAmount(v || 1);
                setSlotStates({});
              }}
            />
            <Radio.Group
              value={extendUnit}
              onChange={(e) => {
                setExtendUnit(e.target.value);
                setSlotStates({});
              }}
            >
              <Radio value="hour">Giờ</Radio>
              <Radio value="minute">Phút</Radio>
            </Radio.Group>
          </Space>
        </div>
      )}

      <Divider orientation="left" style={{ fontSize: 12 }}>
        Danh sách các phòng trong Booking
      </Divider>

      <div style={{ maxHeight: "450px", overflowY: "auto", paddingRight: 8 }}>
        {allSlots.map(renderSlotCard)}
      </div>
    </Modal>
  );
};

export default SlotEditorModal;
