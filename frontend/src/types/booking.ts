// types/room.ts
export type Room = {
  id: string;
  name: string;
  quantity: number;
};

// types/booking.ts
export type BookingType = "HOURLY" | "DAILY" | "MONTHLY";

export type SlotDraft = {
  date: string;
  startTime: string;
  endTime: string;
  quantity: number;
};

export type SlotRequest = {
  roomId: string;
  quantity: number;
  startTime: string;
  endTime: string;
};

export type BookingRequest = {
  userId: string;
  bookingType: BookingType;
  numberOfMonths: number;
  note?: string;
  slotRequests: SlotRequest[];
};
