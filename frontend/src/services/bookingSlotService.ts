import api from "../config/axios";

// ── Types ────────────────────────────────────────────────────────

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
  newStartTime: string; // ISO: "2025-07-01T09:00:00"
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

const BASE = (bookingId: string) => `/slots/${bookingId}`;

export const bookingSlotService = {
  checkExtend: (bookingId: string, slotId: string, req: ExtendCheckRequest) =>
    api
      .post<{
        result: ExtendCheckResponse;
      }>(`${BASE(bookingId)}/extend/${slotId}/check`, req)
      .then((r) => r.data.result),

  confirmExtend: (bookingId: string, slotId: string, req: ExtendCheckRequest) =>
    api
      .post(`${BASE(bookingId)}/extend/${slotId}/confirm`, req)
      .then((r) => r.data),

  checkSwap: (bookingId: string, slotId: string, req: SwapCheckRequest) =>
    api
      .post<{
        result: SwapCheckResponse;
      }>(`${BASE(bookingId)}/swap/${slotId}/check`, req)
      .then((r) => r.data.result),

  confirmSwap: (bookingId: string, slotId: string, req: SwapCheckRequest) =>
    api
      .post(`${BASE(bookingId)}/swap/${slotId}/confirm`, req)
      .then((r) => r.data),
};
