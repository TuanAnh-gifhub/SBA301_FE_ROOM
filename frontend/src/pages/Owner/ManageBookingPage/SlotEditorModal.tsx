// import { useState } from "react";
// import {
//   Modal,
//   Button,
//   message,
//   Spin,
//   Space,
//   Alert,
//   Tag,
//   InputNumber,
//   Radio,
//   DatePicker,
//   TimePicker,
//   Divider,
//   Typography,
// } from "antd";
// import {
//   ClockCircleOutlined,
//   SwapOutlined,
//   CheckCircleOutlined,
//   SearchOutlined,
//   WarningOutlined,
//   WalletOutlined,
//   CreditCardOutlined,
//   DollarOutlined,
//   SyncOutlined,
// } from "@ant-design/icons";
// import dayjs from "dayjs";
// import {
//   checkSlotConflict,
//   extendSlot,
//   swapSlot,
// } from "../../../services/booking/bookingSlotService";

// const { Text } = Typography;

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface SlotEditorModalProps {
//   open: boolean;
//   booking: any;
//   onClose: () => void;
//   onSuccess: () => void;
// }

// type Mode = "extend" | "swap";
// type ExtendUnit = "hour" | "minute";
// type ConflictStatus = "idle" | "checking" | "ok" | "conflict";

// /**
//  * State độc lập cho từng slot:
//  * - extend: dùng chung amount/unit từ shared controls, chỉ track conflict + confirm
//  * - swap: mỗi slot có DatePicker/TimePicker riêng vì duration từng phòng có thể khác nhau
//  */
// interface PerSlotState {
//   // Extend
//   extendConflict: ConflictStatus;
//   extendConfirming: boolean;
//   extendDone: boolean;

//   // Swap — input riêng từng phòng
//   swapDate: dayjs.Dayjs | null;
//   swapStartTime: dayjs.Dayjs | null;
//   swapEndTime: dayjs.Dayjs | null;
//   swapConflict: ConflictStatus;
//   swapConfirming: boolean;
//   swapDone: boolean;
// }

// const initSlotState = (): PerSlotState => ({
//   extendConflict: "idle",
//   extendConfirming: false,
//   extendDone: false,
//   swapDate: null,
//   swapStartTime: null,
//   swapEndTime: null,
//   swapConflict: "idle",
//   swapConfirming: false,
//   swapDone: false,
// });

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const formatVND = (n: number) =>
//   new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
//     n,
//   );

// const buildDT = (date: dayjs.Dayjs, time: dayjs.Dayjs) =>
//   date.hour(time.hour()).minute(time.minute()).second(0);

// const slotDurMin = (slot: any) =>
//   dayjs(slot.endTime).diff(dayjs(slot.startTime), "minute");

// // ─── Component ────────────────────────────────────────────────────────────────

// const SlotEditorModal = ({
//   open,
//   booking,
//   onClose,
//   onSuccess,
// }: SlotEditorModalProps) => {
//   const [mode, setMode] = useState<Mode>("extend");

//   // Shared extend controls (amount/unit áp dụng cho tất cả phòng)
//   const [extendAmount, setExtendAmount] = useState<number>(1);
//   const [extendUnit, setExtendUnit] = useState<ExtendUnit>("hour");

//   // Per-slot state — key = slotId
//   const [slotStates, setSlotStates] = useState<Record<string, PerSlotState>>(
//     {},
//   );

//   // ── Data ──────────────────────────────────────────────────────────
//   const allSlots: any[] = booking?.slots || [];
//   const paymentMethod: string = booking?.paymentMethod || "";
//   const isPaidByWallet =
//     paymentMethod === "WALLET" || paymentMethod === "VN_PAY";
//   const totalPrice: number = booking?.totalPrice || 0;
//   const addedMinutes = extendUnit === "hour" ? extendAmount * 60 : extendAmount;

//   // ── Per-slot state helpers ─────────────────────────────────────────
//   const getState = (slotId: string): PerSlotState =>
//     slotStates[slotId] ?? initSlotState();

//   const patch = (slotId: string, p: Partial<PerSlotState>) =>
//     setSlotStates((prev) => ({
//       ...prev,
//       [slotId]: { ...getState(slotId), ...p },
//     }));

//   const resetState = () => {
//     setSlotStates({});
//     setExtendAmount(1);
//     setExtendUnit("hour");
//   };

//   // ── Extend helpers ─────────────────────────────────────────────────
//   const newEndTime = (slot: any) => {
//     const end = dayjs(slot.endTime);
//     return extendUnit === "hour"
//       ? end.add(extendAmount, "hour")
//       : end.add(extendAmount, "minute");
//   };

//   const extraPrice = (slot: any) => {
//     const durH = slotDurMin(slot) / 60;
//     const perH = durH > 0 ? (slot.price || 0) / durH : 0;
//     return (addedMinutes / 60) * perH;
//   };

//   // ── Swap helpers ───────────────────────────────────────────────────
//   const getSwapDT = (slotId: string) => {
//     const s = getState(slotId);
//     if (!s.swapDate || !s.swapStartTime || !s.swapEndTime) return null;
//     return {
//       start: buildDT(s.swapDate, s.swapStartTime),
//       end: buildDT(s.swapDate, s.swapEndTime),
//     };
//   };

//   const swapDurMin = (slotId: string) => {
//     const dt = getSwapDT(slotId);
//     if (!dt) return null;
//     return dt.end.diff(dt.start, "minute");
//   };

//   // ── Handlers: Extend ──────────────────────────────────────────────
//   const handleCheckExtend = async (slot: any) => {
//     if (!extendAmount || extendAmount <= 0) {
//       message.error("Vui lòng nhập thời gian muốn gia hạn");
//       return;
//     }
//     patch(slot.slotId, { extendConflict: "checking" });
//     try {
//       const result = await checkSlotConflict(
//         booking.bookingId,
//         slot.slotId,
//         dayjs(slot.startTime).format("YYYY-MM-DDTHH:mm:ss"),
//         newEndTime(slot).format("YYYY-MM-DDTHH:mm:ss"),
//       );
//       patch(slot.slotId, {
//         extendConflict: result.available ? "ok" : "conflict",
//       });
//     } catch (e: any) {
//       patch(slot.slotId, { extendConflict: "idle" });
//       message.error(e?.response?.data?.message || "Lỗi kiểm tra xung đột");
//     }
//   };

//   const handleConfirmExtend = async (slot: any) => {
//     patch(slot.slotId, { extendConfirming: true });
//     try {
//       await extendSlot(
//         booking.bookingId,
//         slot.slotId,
//         extendAmount,
//         extendUnit,
//       );
//       patch(slot.slotId, { extendConfirming: false, extendDone: true });
//       message.success(`Phòng ${slot.roomCopy?.roomCode}: gia hạn thành công!`);
//       onSuccess();
//     } catch (e: any) {
//       patch(slot.slotId, { extendConfirming: false });
//       message.error(e?.response?.data?.message || "Lỗi gia hạn");
//     }
//   };

//   // ── Handlers: Swap ────────────────────────────────────────────────
//   const handleCheckSwap = async (slot: any) => {
//     const dt = getSwapDT(slot.slotId);
//     if (!dt) {
//       message.error("Vui lòng chọn đầy đủ ngày và giờ");
//       return;
//     }
//     if (!dt.end.isAfter(dt.start)) {
//       message.error("Giờ kết thúc phải sau giờ bắt đầu");
//       return;
//     }

//     const newDur = dt.end.diff(dt.start, "minute");
//     const oldDur = slotDurMin(slot);
//     if (newDur !== oldDur) {
//       message.error(
//         `Phòng ${slot.roomCopy?.roomCode}: phải chọn đúng ${oldDur} phút (hiện tại ${newDur} phút)`,
//       );
//       return;
//     }

//     patch(slot.slotId, { swapConflict: "checking" });
//     try {
//       const result = await checkSlotConflict(
//         booking.bookingId,
//         slot.slotId,
//         dt.start.format("YYYY-MM-DDTHH:mm:ss"),
//         dt.end.format("YYYY-MM-DDTHH:mm:ss"),
//       );
//       patch(slot.slotId, {
//         swapConflict: result.available ? "ok" : "conflict",
//       });
//     } catch (e: any) {
//       patch(slot.slotId, { swapConflict: "idle" });
//       message.error(e?.response?.data?.message || "Lỗi kiểm tra xung đột");
//     }
//   };

//   const handleConfirmSwap = async (slot: any) => {
//     const dt = getSwapDT(slot.slotId);
//     if (!dt) return;
//     patch(slot.slotId, { swapConfirming: true });
//     try {
//       await swapSlot(
//         booking.bookingId,
//         slot.slotId,
//         dt.start.format("YYYY-MM-DD HH:mm:ss"),
//         dt.end.format("YYYY-MM-DD HH:mm:ss"),
//       );
//       patch(slot.slotId, { swapConfirming: false, swapDone: true });
//       message.success(
//         `Phòng ${slot.roomCopy?.roomCode}: chuyển slot thành công!`,
//       );
//       onSuccess();
//     } catch (e: any) {
//       patch(slot.slotId, { swapConfirming: false });
//       message.error(e?.response?.data?.message || "Lỗi chuyển slot");
//     }
//   };

//   // ── Payment badge ──────────────────────────────────────────────────
//   const renderPaymentBadge = () => {
//     const map: Record<
//       string,
//       { color: string; icon: React.ReactNode; label: string }
//     > = {
//       WALLET: {
//         color: "#722ed1",
//         icon: <WalletOutlined />,
//         label: "Ví cá nhân",
//       },
//       VN_PAY: {
//         color: "#1677ff",
//         icon: <CreditCardOutlined />,
//         label: "VNPay",
//       },
//       CASH: { color: "#52c41a", icon: <DollarOutlined />, label: "Tiền mặt" },
//     };
//     const m = map[paymentMethod] ?? {
//       color: "#888",
//       icon: <DollarOutlined />,
//       label: paymentMethod,
//     };
//     return (
//       <Tag color={m.color} icon={m.icon} style={{ fontSize: 13 }}>
//         {m.label}
//       </Tag>
//     );
//   };

//   // ── Per-slot card ──────────────────────────────────────────────────
//   const renderSlotCard = (slot: any) => {
//     const s = getState(slot.slotId);
//     const roomCode = slot.roomCopy?.roomCode;
//     const start = dayjs(slot.startTime);
//     const end = dayjs(slot.endTime);
//     const durMin = slotDurMin(slot);
//     const isDone = mode === "extend" ? s.extendDone : s.swapDone;

//     // ── Đã xong: hiển thị badge thành công ──
//     if (isDone) {
//       return (
//         <div
//           key={slot.slotId}
//           style={{
//             border: "1px solid #b7eb8f",
//             borderRadius: 8,
//             padding: "12px 16px",
//             background: "#f6ffed",
//             display: "flex",
//             alignItems: "center",
//             gap: 12,
//           }}
//         >
//           <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 18 }} />
//           <div>
//             <Text strong style={{ color: "#52c41a" }}>
//               Phòng {roomCode}
//             </Text>
//             <Text type="secondary" style={{ marginLeft: 10, fontSize: 12 }}>
//               {mode === "extend"
//                 ? "Đã gia hạn thành công"
//                 : "Đã chuyển slot thành công"}
//             </Text>
//           </div>
//         </div>
//       );
//     }

//     return (
//       <div
//         key={slot.slotId}
//         style={{
//           border: "1px solid #d9d9d9",
//           borderRadius: 8,
//           padding: "14px 16px",
//           background: "#fafafa",
//         }}
//       >
//         {/* ── Header phòng ── */}
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginBottom: 12,
//           }}
//         >
//           <Space>
//             <Tag
//               color="blue"
//               style={{ fontSize: 13, fontWeight: 600, margin: 0 }}
//             >
//               Phòng {roomCode}
//             </Tag>
//             <Text type="secondary" style={{ fontSize: 12 }}>
//               {start.format("DD/MM/YYYY")}
//               <Text strong>
//                 {start.format("HH:mm")} → {end.format("HH:mm")}
//               </Text>
//               　({(durMin / 60).toFixed(1)}h)
//             </Text>
//           </Space>
//           <Text style={{ color: "#1677ff", fontSize: 13, fontWeight: 600 }}>
//             {formatVND(slot.price || 0)}
//           </Text>
//         </div>

//         {/* ════════════════ EXTEND UI ════════════════ */}
//         {mode === "extend" && (
//           <Space direction="vertical" style={{ width: "100%" }} size={8}>
//             {/* Preview thời gian + phí */}
//             <div
//               style={{
//                 background: "#f0f5ff",
//                 border: "1px solid #adc6ff",
//                 borderRadius: 6,
//                 padding: "8px 12px",
//               }}
//             >
//               <Space wrap size={12}>
//                 <span style={{ fontSize: 13 }}>
//                   {start.format("HH:mm")} →{" "}
//                   <Text strong style={{ color: "#52c41a" }}>
//                     {newEndTime(slot).format("HH:mm")}
//                   </Text>
//                   <Tag color="green" style={{ marginLeft: 6 }}>
//                     +{addedMinutes} phút
//                   </Tag>
//                 </span>
//                 {isPaidByWallet && extraPrice(slot) > 0 && (
//                   <span style={{ fontSize: 13 }}>
//                     <Text type="secondary">Phí thêm: </Text>
//                     <Text strong style={{ color: "#f5222d" }}>
//                       {formatVND(extraPrice(slot))}
//                     </Text>
//                   </span>
//                 )}
//               </Space>
//             </div>

//             {/* Conflict result */}
//             {s.extendConflict === "ok" && (
//               <Alert
//                 message="Khả dụng — có thể gia hạn"
//                 type="success"
//                 showIcon
//                 icon={<CheckCircleOutlined />}
//                 style={{ padding: "4px 10px" }}
//               />
//             )}
//             {s.extendConflict === "conflict" && (
//               <Alert
//                 message="Xung đột — khung giờ đã bị đặt"
//                 type="error"
//                 showIcon
//                 icon={<WarningOutlined />}
//                 style={{ padding: "4px 10px" }}
//               />
//             )}

//             {/* Actions */}
//             <Space>
//               <Button
//                 size="small"
//                 icon={<SearchOutlined />}
//                 loading={s.extendConflict === "checking"}
//                 onClick={() => handleCheckExtend(slot)}
//               >
//                 Kiểm tra xung đột
//               </Button>
//               {s.extendConflict === "ok" && (
//                 <Button
//                   size="small"
//                   type="primary"
//                   icon={<CheckCircleOutlined />}
//                   loading={s.extendConfirming}
//                   danger={isPaidByWallet && extraPrice(slot) > 0}
//                   onClick={() => handleConfirmExtend(slot)}
//                 >
//                   {isPaidByWallet && extraPrice(slot) > 0
//                     ? `Xác nhận & Thu thêm ${formatVND(extraPrice(slot))}`
//                     : "Xác nhận gia hạn"}
//                 </Button>
//               )}
//             </Space>
//           </Space>
//         )}

//         {/* ════════════════ SWAP UI — input riêng từng phòng ════════════════ */}
//         {mode === "swap" && (
//           <Space direction="vertical" style={{ width: "100%" }} size={10}>
//             {/* Thông tin duration yêu cầu */}
//             <div
//               style={{
//                 background: "#fffbe6",
//                 border: "1px solid #ffe58f",
//                 borderRadius: 6,
//                 padding: "6px 12px",
//                 fontSize: 12,
//               }}
//             >
//               <ClockCircleOutlined
//                 style={{ color: "#d48806", marginRight: 6 }}
//               />
//               <Text style={{ fontSize: 12 }}>
//                 Phòng này cần chọn đúng{" "}
//                 <Text strong style={{ color: "#d48806" }}>
//                   {durMin} phút
//                 </Text>{" "}
//                 ({(durMin / 60).toFixed(1)}h) — bằng thời gian cũ
//               </Text>
//             </div>

//             {/* DatePicker + TimePicker riêng cho phòng này */}
//             <Space wrap size={8}>
//               <div>
//                 <div style={{ fontSize: 11, color: "#888", marginBottom: 3 }}>
//                   Ngày mới
//                 </div>
//                 <DatePicker
//                   value={s.swapDate}
//                   onChange={(d) =>
//                     patch(slot.slotId, { swapDate: d, swapConflict: "idle" })
//                   }
//                   format="DD/MM/YYYY"
//                   disabledDate={(d) => d.isBefore(dayjs(), "day")}
//                   placeholder="Chọn ngày"
//                   size="small"
//                 />
//               </div>
//               <div>
//                 <div style={{ fontSize: 11, color: "#888", marginBottom: 3 }}>
//                   Giờ bắt đầu
//                 </div>
//                 <TimePicker
//                   value={s.swapStartTime}
//                   onChange={(t) =>
//                     patch(slot.slotId, {
//                       swapStartTime: t,
//                       swapConflict: "idle",
//                     })
//                   }
//                   format="HH:mm"
//                   minuteStep={30}
//                   placeholder="Bắt đầu"
//                   style={{ width: 100 }}
//                   size="small"
//                 />
//               </div>
//               <div>
//                 <div style={{ fontSize: 11, color: "#888", marginBottom: 3 }}>
//                   Giờ kết thúc
//                 </div>
//                 <TimePicker
//                   value={s.swapEndTime}
//                   onChange={(t) =>
//                     patch(slot.slotId, { swapEndTime: t, swapConflict: "idle" })
//                   }
//                   format="HH:mm"
//                   minuteStep={30}
//                   placeholder="Kết thúc"
//                   style={{ width: 100 }}
//                   size="small"
//                 />
//               </div>

//               {/* Preview duration đã chọn */}
//               {(() => {
//                 const dur = swapDurMin(slot.slotId);
//                 if (!dur || dur <= 0) return null;
//                 const match = dur === durMin;
//                 return (
//                   <Tag
//                     color={match ? "green" : "red"}
//                     icon={match ? <CheckCircleOutlined /> : <WarningOutlined />}
//                     style={{ marginTop: 18 }}
//                   >
//                     {dur} phút {match ? "✓ khớp" : `≠ cần ${durMin} phút`}
//                   </Tag>
//                 );
//               })()}
//             </Space>

//             {/* Preview slot mới nếu hợp lệ */}
//             {(() => {
//               const dt = getSwapDT(slot.slotId);
//               if (!dt || swapDurMin(slot.slotId) !== durMin) return null;
//               return (
//                 <div
//                   style={{
//                     background: "#f0f5ff",
//                     border: "1px solid #adc6ff",
//                     borderRadius: 6,
//                     padding: "8px 12px",
//                   }}
//                 >
//                   <Space size={8}>
//                     <SwapOutlined style={{ color: "#1677ff" }} />
//                     <Text style={{ fontSize: 13 }}>
//                       {start.format("DD/MM")} {start.format("HH:mm")}–
//                       {end.format("HH:mm")}
//                     </Text>
//                     <Text type="secondary">→</Text>
//                     <Text strong style={{ color: "#1677ff", fontSize: 13 }}>
//                       {dt.start.format("DD/MM")} {dt.start.format("HH:mm")}–
//                       {dt.end.format("HH:mm")}
//                     </Text>
//                     <Tag color="green" style={{ margin: 0 }}>
//                       Không phí thêm
//                     </Tag>
//                   </Space>
//                 </div>
//               );
//             })()}

//             {/* Conflict result */}
//             {s.swapConflict === "ok" && (
//               <Alert
//                 message="Khung giờ trống — có thể chuyển"
//                 type="success"
//                 showIcon
//                 icon={<CheckCircleOutlined />}
//                 style={{ padding: "4px 10px" }}
//               />
//             )}
//             {s.swapConflict === "conflict" && (
//               <Alert
//                 message="Khung giờ đã bị đặt — chọn giờ khác"
//                 type="error"
//                 showIcon
//                 icon={<WarningOutlined />}
//                 style={{ padding: "4px 10px" }}
//               />
//             )}

//             {/* Actions */}
//             <Space>
//               <Button
//                 size="small"
//                 icon={<SearchOutlined />}
//                 loading={s.swapConflict === "checking"}
//                 disabled={!s.swapDate || !s.swapStartTime || !s.swapEndTime}
//                 onClick={() => handleCheckSwap(slot)}
//               >
//                 Kiểm tra khả dụng
//               </Button>
//               {s.swapConflict === "ok" && (
//                 <Button
//                   size="small"
//                   type="primary"
//                   icon={<CheckCircleOutlined />}
//                   loading={s.swapConfirming}
//                   onClick={() => handleConfirmSwap(slot)}
//                 >
//                   Xác nhận chuyển slot
//                 </Button>
//               )}
//             </Space>
//           </Space>
//         )}
//       </div>
//     );
//   };

//   // ── Summary counts ────────────────────────────────────────────────
//   const doneCount = Object.values(slotStates).filter((s) =>
//     mode === "extend" ? s.extendDone : s.swapDone,
//   ).length;

//   // ── Render Modal ──────────────────────────────────────────────────
//   return (
//     <Modal
//       title={
//         <Space>
//           <ClockCircleOutlined style={{ color: "#1677ff" }} />
//           <span>Chỉnh sửa slot — {allSlots.length} phòng</span>
//         </Space>
//       }
//       open={open}
//       onCancel={() => {
//         resetState();
//         onClose();
//       }}
//       width={780}
//       footer={
//         doneCount > 0 ? (
//           <Button
//             type="primary"
//             onClick={() => {
//               resetState();
//               onClose();
//             }}
//           >
//             Đóng　({doneCount}/{allSlots.length} phòng đã cập nhật)
//           </Button>
//         ) : null
//       }
//       destroyOnClose
//     >
//       <Space direction="vertical" style={{ width: "100%" }} size="middle">
//         {/* ── Thông tin booking ── */}
//         <div
//           style={{
//             background: "#f0f5ff",
//             border: "1px solid #adc6ff",
//             padding: "12px 16px",
//             borderRadius: 8,
//           }}
//         >
//           <Text type="secondary" style={{ fontSize: 11 }}>
//             THÔNG TIN BOOKING
//           </Text>
//           <div
//             style={{
//               marginTop: 6,
//               display: "flex",
//               gap: 20,
//               flexWrap: "wrap",
//               alignItems: "center",
//             }}
//           >
//             <Space size={6}>
//               <Text type="secondary" style={{ fontSize: 12 }}>
//                 Thanh toán:
//               </Text>
//               {renderPaymentBadge()}
//             </Space>
//             <span>
//               <Text type="secondary" style={{ fontSize: 12 }}>
//                 Tổng tiền:{" "}
//               </Text>
//               <Text strong style={{ color: "#1677ff" }}>
//                 {formatVND(totalPrice)}
//               </Text>
//             </span>
//             <span>
//               <Text type="secondary" style={{ fontSize: 12 }}>
//                 Số phòng:{" "}
//               </Text>
//               <Text strong>{allSlots.length} phòng</Text>
//             </span>
//           </div>
//         </div>

//         {/* ── Mode selector ── */}
//         <Radio.Group
//           value={mode}
//           onChange={(e) => {
//             setMode(e.target.value);
//             setSlotStates({});
//           }}
//         >
//           <Space>
//             <Radio.Button
//               value="extend"
//               style={{ height: "auto", padding: "8px 20px" }}
//             >
//               <Space>
//                 <ClockCircleOutlined />
//                 <span>
//                   <div style={{ fontWeight: 600 }}>Gia hạn thêm</div>
//                   <div style={{ fontSize: 11, color: "#888" }}>
//                     Kéo dài giờ kết thúc
//                   </div>
//                 </span>
//               </Space>
//             </Radio.Button>
//             <Radio.Button
//               value="swap"
//               style={{ height: "auto", padding: "8px 20px" }}
//             >
//               <Space>
//                 <SwapOutlined />
//                 <span>
//                   <div style={{ fontWeight: 600 }}>Chuyển slot</div>
//                   <div style={{ fontSize: 11, color: "#888" }}>
//                     Đổi khung giờ (giữ nguyên độ dài)
//                   </div>
//                 </span>
//               </Space>
//             </Radio.Button>
//           </Space>
//         </Radio.Group>

//         <Divider style={{ margin: "2px 0" }} />

//         {/* ── Shared controls: Extend ── */}
//         {mode === "extend" && (
//           <Space align="center" wrap>
//             <Text strong>Gia hạn thêm:</Text>
//             <InputNumber
//               min={1}
//               max={extendUnit === "hour" ? 24 : 120}
//               value={extendAmount}
//               onChange={(v) => {
//                 setExtendAmount(v || 1);
//                 setSlotStates({});
//               }}
//               style={{ width: 80 }}
//             />
//             <Radio.Group
//               value={extendUnit}
//               onChange={(e) => {
//                 setExtendUnit(e.target.value);
//                 setSlotStates({});
//               }}
//               optionType="button"
//               buttonStyle="solid"
//               options={[
//                 { label: "Giờ", value: "hour" },
//                 { label: "Phút", value: "minute" },
//               ]}
//             />
//             {isPaidByWallet && (
//               <Alert
//                 message="Gia hạn sẽ thu thêm phí tương ứng"
//                 type="info"
//                 showIcon
//                 icon={<WalletOutlined />}
//                 style={{ padding: "2px 10px", fontSize: 12 }}
//               />
//             )}
//             <Text type="secondary" style={{ fontSize: 12 }}>
//               → Kiểm tra và xác nhận từng phòng bên dưới. Phòng nào không muốn
//               gia hạn thì bỏ qua.
//             </Text>
//           </Space>
//         )}

//         {/* ── Mode swap: chỉ mô tả, input nằm trong từng slot card ── */}
//         {mode === "swap" && (
//           <Alert
//             message="Mỗi phòng chọn khung giờ riêng — duration phải bằng slot gốc. Phòng nào không muốn chuyển thì bỏ qua."
//             type="info"
//             showIcon
//             style={{ fontSize: 12 }}
//           />
//         )}

//         <Divider style={{ margin: "2px 0" }} />

//         {/* ── Per-slot cards ── */}
//         <Space direction="vertical" style={{ width: "100%" }} size={10}>
//           {allSlots.map((slot: any) => renderSlotCard(slot))}
//         </Space>

//         {/* ── Summary ── */}
//         {doneCount > 0 && doneCount < allSlots.length && (
//           <Alert
//             message={`Đã cập nhật ${doneCount}/${allSlots.length} phòng. Các phòng còn lại giữ nguyên.`}
//             type="success"
//             showIcon
//             icon={<SyncOutlined />}
//           />
//         )}
//       </Space>
//     </Modal>
//   );
// };

// export default SlotEditorModal;
