// utils/bookingMapper.ts
import type { SlotDraft } from "../types/booking";

export function toSlotRequest(slot: SlotDraft, roomId: string) {
  return {
    roomId,
    quantity: slot.quantity,
    startTime: `${slot.date}T${slot.startTime}:00`,
    endTime: `${slot.date}T${slot.endTime}:00`,
  };
}
