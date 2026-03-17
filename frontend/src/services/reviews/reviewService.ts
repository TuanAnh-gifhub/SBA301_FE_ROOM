// src/services/reviews/reviewService.ts
//
// Dat file nay vao: src/services/reviews/reviewService.ts
// Cung cap voi cac service khac: booking, rental-areas, rooms...
//
// Pattern giong rentalAreasService:
//   - Import `api` tu config/axios (da co token interceptor roi)
//   - Moi method tra ve ApiResponse<T>
//   - Export default object

import api from "../../config/axios";

import type {
  ApiResponse,
  CreateReviewRequest,
  GetReviewsParams,
  PageResponse,
  ReplyReviewRequest,
  ReviewResponse,
  ReviewSummaryResponse,
  ReviewStatus,
  UpdateReviewRequest,
} from "../../types/review";

// Re-export ApiResponse de dung o noi khac neu can
// (hoac import tu rentalAreasService neu du an da co san)
export type { ApiResponse };

const reviewService = {

  // ── PUBLIC (khong can dang nhap) ──────────────────────────────

  /**
   * Lay danh sach review cua 1 rental area
   * GET /reviews/rental-area/:rentalAreaId
   *
   * @param rentalAreaId  - ID cua rental area
   * @param params        - Bo loc: page, size, rating, sort, hasMedia
   */
  getReviews: async (
    rentalAreaId: string,
    params: GetReviewsParams = {}
  ): Promise<ApiResponse<PageResponse<ReviewResponse>>> => {
    const response = await api.get<ApiResponse<PageResponse<ReviewResponse>>>(
      `/reviews/rental-area/${rentalAreaId}`,
      {
        params: {
          page: params.page ?? 1,
          size: params.size ?? 10,
          sort: params.sort ?? "newest",
          // Chi truyen len neu co gia tri (tranh ?rating=null tren URL)
          ...(params.rating != null && { rating: params.rating }),
          ...(params.hasMedia === true && { hasMedia: true }),
        },
      }
    );
    return response.data;
  },

  /**
   * Lay tong hop diem: diem trung binh, tong so review, phan bo sao
   * GET /reviews/rental-area/:rentalAreaId/summary
   */
  getSummary: async (
    rentalAreaId: string
  ): Promise<ApiResponse<ReviewSummaryResponse>> => {
    const response = await api.get<ApiResponse<ReviewSummaryResponse>>(
      `/reviews/rental-area/${rentalAreaId}/summary`
    );
    return response.data;
  },

  // ── USER (can dang nhap) ──────────────────────────────────────

  /**
   * Tao review moi
   * POST /reviews
   * Chi nguoi thue da COMPLETED booking moi goi duoc
   */
  createReview: async (
    payload: CreateReviewRequest
  ): Promise<ApiResponse<ReviewResponse>> => {
    const response = await api.post<ApiResponse<ReviewResponse>>(
      "/reviews",
      payload
    );
    return response.data;
  },

  /**
   * Sua review (chinh chu, trong 7 ngay ke tu ngay tao)
   * PATCH /reviews/:reviewId
   */
  updateReview: async (
    reviewId: string,
    payload: UpdateReviewRequest
  ): Promise<ApiResponse<ReviewResponse>> => {
    const response = await api.patch<ApiResponse<ReviewResponse>>(
      `/reviews/${reviewId}`,
      payload
    );
    return response.data;
  },

  /**
   * Xoa review - soft delete (chinh chu hoac Admin)
   * DELETE /reviews/:reviewId
   */
  deleteReview: async (reviewId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(
      `/reviews/${reviewId}`
    );
    return response.data;
  },

  /**
   * Toggle vote "Huu ich" - bam lan 2 = bo vote
   * POST /reviews/:reviewId/vote
   */
  toggleVote: async (reviewId: string): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>(
      `/reviews/${reviewId}/vote`
    );
    return response.data;
  },

  // ── OWNER (chu phong) ─────────────────────────────────────────

  /**
   * Chu phong tao phan hoi - moi review chi co 1 reply
   * POST /reviews/:reviewId/reply
   */
  replyReview: async (
    reviewId: string,
    payload: ReplyReviewRequest
  ): Promise<ApiResponse<ReviewResponse>> => {
    const response = await api.post<ApiResponse<ReviewResponse>>(
      `/reviews/${reviewId}/reply`,
      payload
    );
    return response.data;
  },

  /**
   * Chu phong cap nhat phan hoi da tao
   * PATCH /reviews/:reviewId/reply
   */
  updateReply: async (
    reviewId: string,
    payload: ReplyReviewRequest
  ): Promise<ApiResponse<ReviewResponse>> => {
    const response = await api.patch<ApiResponse<ReviewResponse>>(
      `/reviews/${reviewId}/reply`,
      payload
    );
    return response.data;
  },

  // ── ADMIN ─────────────────────────────────────────────────────

  /**
   * Admin doi trang thai review
   * PATCH /reviews/:reviewId/status?status=APPROVED
   */
  updateStatus: async (
    reviewId: string,
    status: ReviewStatus
  ): Promise<ApiResponse<ReviewResponse>> => {
    const response = await api.patch<ApiResponse<ReviewResponse>>(
      `/reviews/${reviewId}/status`,
      null,
      { params: { status } }
    );
    return response.data;
  },
};

export default reviewService;