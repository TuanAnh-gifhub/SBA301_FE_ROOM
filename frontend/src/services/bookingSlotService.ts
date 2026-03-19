import api from "../config/axios";

// ── Types ─────────────────────────────────────

export interface ExtendCheckRequest {
  amount: number;
  unit: "hour" | "minute";
}

export interface ExtendCheckResponse {
  available: boolean;
  conflictMessage: string | null;
  slotId: string;
  roomCode: string;
  originalEnd: string;
  newEnd: string;
  addedMinutes: number;
  originalPrice: number;
  extraPrice: number;
  hourlyRate: number;
}

export interface SwapCheckRequest {
  newStartTime: string;
  newEndTime: string;
}

export interface SwapCheckResponse {
  available: boolean;
  conflictMessage: string | null;
  slotId: string;
  roomCode: string;
  originalStart: string;
  originalEnd: string;
  newStart: string;
  newEnd: string;
  durationMinutes: number;
}

// ❌ bỏ BASE cũ đi
// const BASE = ...

export const bookingSlotService = {
  // ===== EXTEND =====

  checkExtend: (bookingId: string, slotId: string, req: ExtendCheckRequest) =>
    api
      .post<{ result: ExtendCheckResponse }>(
        `/slots/${bookingId}/${slotId}/extend/check`, // ✅ FIX
        req,
      )
      .then((r) => r.data.result),

  confirmExtend: (bookingId: string, slotId: string, req: ExtendCheckRequest) =>
    api
      .post(
        `/slots/${bookingId}/${slotId}/extend/confirm`, // ✅ FIX
        req,
      )
      .then((r) => r.data),

  // ===== SWAP =====

  checkSwap: (bookingId: string, slotId: string, req: SwapCheckRequest) =>
    api
      .post<{ result: SwapCheckResponse }>(
        `/slots/${bookingId}/${slotId}/swap/check`, // ✅ FIX
        req,
      )
      .then((r) => r.data.result),

  confirmSwap: (bookingId: string, slotId: string, req: SwapCheckRequest) =>
    api
      .post(
        `/slots/${bookingId}/${slotId}/swap/confirm`, // ✅ FIX
        req,
      )
      .then((r) => r.data),
};
