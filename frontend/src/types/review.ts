// src/types/review.ts
//
// Dat file nay vao: src/types/review.ts
// (cung cap voi booking.ts, room.ts da co san)

// ── Enums & Constants ────────────────────────────────────────────

export type ReviewStatus =
  | "APPROVED"
  | "PENDING_MODERATION"
  | "REJECTED"
  | "HIDDEN";

export type MediaType = "IMAGE" | "VIDEO";

export type SortOption =
  | "newest"
  | "oldest"
  | "highest"
  | "lowest"
  | "most_helpful";

/**
 * Danh sach tags hop le - khop voi BE (ReviewTagConstant.java)
 * icon: hien thi trong TagSelector
 * label: ten tieng Viet hien thi cho user
 */
export const REVIEW_TAGS = [
  { key: "YEN_TINH",             label: "Yên tĩnh",            icon: "🔇" },
  { key: "SACH_SE",              label: "Sạch sẽ",              icon: "✨" },
  { key: "WIFI_TOT",             label: "WiFi tốt",             icon: "📶" },
  { key: "DIEU_HOA_MAT",         label: "Điều hòa mát",         icon: "❄️" },
  { key: "ANH_SANG_DU",          label: "Ánh sáng đủ",          icon: "💡" },
  { key: "VI_TRI_THUAN_TIEN",    label: "Vị trí thuận tiện",    icon: "📍" },
  { key: "CHU_PHONG_THAN_THIEN", label: "Chủ phòng thân thiện", icon: "😊" },
] as const;

export type TagKey = (typeof REVIEW_TAGS)[number]["key"];

// ── ApiResponse wrapper (dung chung toan du an) ─────────────────
// Giong voi ApiResponse da dinh nghia trong rentalAreasService.ts
// Dat o day de review feature tu quan ly, khong phu thuoc file khac
export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

// ── API Response types ───────────────────────────────────────────
// Khop chinh xac voi ReviewResponse.java o BE

export interface ReviewerInfo {
  userId: string;
  userName: string;
}

export interface MediaInfo {
  mediaId: string;
  url: string;
  mediaType: MediaType;
  displayOrder: number;
}

export interface ReplyInfo {
  replyId: string;
  ownerName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewResponse {
  reviewId: string;
  reviewer: ReviewerInfo;
  rating: number;             // 1-5
  comment?: string;           // optional (nullable)
  tags: string[];             // ["YEN_TINH", "SACH_SE", ...]
  mediaList: MediaInfo[];
  reply?: ReplyInfo;          // optional - chi co neu chu phong da reply
  helpfulCount: number;
  status: ReviewStatus;
  createdAt: string;          // ISO string
  updatedAt: string;
  hasVoted: boolean;          // user hien tai da vote chua
  canEdit: boolean;           // con trong 7 ngay de sua
}

export interface StarDistribution {
  star: number;       // 1, 2, 3, 4, 5
  count: number;
  percentage: number; // 0.0 -> 100.0
}

export interface ReviewSummaryResponse {
  averageRating: number | null; // null = chua co review nao
  totalReviews: number;
  distribution: StarDistribution[];
}

// PageResponse - dung chung voi booking, room, etc.
export interface PageResponse<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  data: T[];
}

// ── API Request types ────────────────────────────────────────────
// Khop voi BE DTOs

export interface CreateReviewRequest {
  bookingId: string;
  rating: number;
  comment?: string;
  tags: string[];
  mediaUrls: string[];
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
  tags?: string[];
  mediaUrls?: string[];
}

export interface ReplyReviewRequest {
  content: string;
}

// Params cho GET /reviews/rental-area/:id
export interface GetReviewsParams {
  page?: number;
  size?: number;
  rating?: number | null;
  sort?: SortOption;
  hasMedia?: boolean;
}