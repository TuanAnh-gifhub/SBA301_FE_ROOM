// src/hooks/useReviews.ts
//
// Dat file nay vao: src/hooks/useReviews.ts
// (cung voi cac hook khac trong folder hooks/)
//
// Hook nay lam GI:
//   - Goi API lay danh sach review + summary
//   - Quan ly trang thai filter (loc sao, sap xep, co hinh anh)
//   - Xu ly tat ca actions: tao, sua, xoa, vote, reply
//   - Optimistic UI cho vote (cap nhat UI truoc, sync API sau)
//
// Component chi can goi useReviews(rentalAreaId) roi dung ket qua
// KHONG can biet gi ve API hay service

import { useCallback, useEffect, useRef, useState } from "react";
import { message } from "antd";
import reviewService from "../services/reviews/reviewService";
import type {
  CreateReviewRequest,
  GetReviewsParams,
  PageResponse,
  ReplyReviewRequest,
  ReviewResponse,
  ReviewSummaryResponse,
  SortOption,
  UpdateReviewRequest,
} from "../types/review";

// Kieu tra ve cua hook - component se dung cac gia tri nay
export interface UseReviewsReturn {
  // ── Data ──
  reviews: ReviewResponse[];
  summary: ReviewSummaryResponse | null;
  pagination: Omit<PageResponse<unknown>, "data">;

  // ── Loading states ──
  loading: boolean; // dang tai danh sach review
  summaryLoading: boolean; // dang tai summary
  submitting: boolean; // dang goi API (tao/sua/xoa/reply)

  // ── Filter state (de component hien thi active state) ──
  filterRating: number | null;
  sort: SortOption;
  hasMedia: boolean;
  page: number;

  // ── Actions: filter ──
  setPage: (page: number) => void;
  onFilterRating: (rating: number | null) => void;
  onSort: (sort: SortOption) => void;
  onHasMedia: (v: boolean) => void;

  // ── Actions: CRUD ──
  onCreateReview: (payload: CreateReviewRequest) => Promise<void>;
  onUpdateReview: (
    reviewId: string,
    payload: UpdateReviewRequest,
  ) => Promise<void>;
  onDeleteReview: (reviewId: string) => Promise<void>;
  onToggleVote: (reviewId: string) => Promise<void>;
  onReply: (reviewId: string, payload: ReplyReviewRequest) => Promise<void>;
  onUpdateReply: (
    reviewId: string,
    payload: ReplyReviewRequest,
  ) => Promise<void>;
}

export function useReviews(rentalAreaId: string): UseReviewsReturn {
  // ── Core state ────────────────────────────────────────────────
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [summary, setSummary] = useState<ReviewSummaryResponse | null>(null);
  const [pagination, setPagination] = useState<
    Omit<PageResponse<unknown>, "data">
  >({
    currentPage: 1,
    totalPages: 0,
    pageSize: 5,
    totalElements: 0,
  });

  // ── Loading states ────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ── Filter state ──────────────────────────────────────────────
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sort, setSort] = useState<SortOption>("newest");
  const [hasMedia, setHasMedia] = useState(false);
  const [page, setPage] = useState(1);

  // Dung de cancel request cu khi params thay doi lien tuc
  // Vi du: user click filter nhanh -> chi giu request cuoi cung
  const abortRef = useRef<AbortController | null>(null);

  // ── Fetch summary ─────────────────────────────────────────────
  // useCallback de ham khong bi tao lai moi lan render
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await reviewService.getSummary(rentalAreaId);
      setSummary(res.result);
    } catch {
      // Summary loi khong can bao user, chi de null
    } finally {
      setSummaryLoading(false);
    }
  }, [rentalAreaId]);

  // ── Fetch reviews (co phan trang + filter) ────────────────────
  const fetchReviews = useCallback(
    async (overrides: GetReviewsParams = {}) => {
      // Huy request truoc neu dang chay
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setLoading(true);
      try {
        const res = await reviewService.getReviews(rentalAreaId, {
          page: overrides.page ?? page,
          size: 10,
          rating:
            overrides.rating !== undefined ? overrides.rating : filterRating,
          sort: overrides.sort ?? sort,
          hasMedia:
            overrides.hasMedia !== undefined ? overrides.hasMedia : hasMedia,
        });
        setReviews(res.result.data);
        setPagination({
          currentPage: res.result.currentPage,
          totalPages: res.result.totalPages,
          pageSize: res.result.pageSize,
          totalElements: res.result.totalElements,
        });
      } catch (err: unknown) {
        // Ignore loi cancel (user doi filter lien tuc)
        const isCancel = (err as { name?: string })?.name === "CanceledError";
        if (!isCancel) message.error("Không thể tải đánh giá");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rentalAreaId, page, filterRating, sort, hasMedia],
  );

  // ── Auto fetch khi rentalAreaId hoac filter thay doi ─────────
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rentalAreaId, page, filterRating, sort, hasMedia]);

  // ── Helper: cap nhat 1 review trong list (tranh fetch lai ca trang) ──
  const updateReviewInList = (reviewId: string, updated: ReviewResponse) => {
    setReviews((prev) =>
      prev.map((r) => (r.reviewId === reviewId ? updated : r)),
    );
  };

  // ── Actions ───────────────────────────────────────────────────

  const onCreateReview = async (payload: CreateReviewRequest) => {
    setSubmitting(true);
    try {
      await reviewService.createReview(payload);
      message.success("Đăng đánh giá thành công! 🎉");
      // Quay ve trang 1 va fetch lai ca summary + reviews
      setPage(1);
      await Promise.all([fetchSummary(), fetchReviews({ page: 1 })]);
    } catch (err: unknown) {
      // Lay message tu BE neu co
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Đăng đánh giá thất bại";
      message.error(msg);
      throw err; // Re-throw de ReviewForm biet ma reset loading state
    } finally {
      setSubmitting(false);
    }
  };

  const onUpdateReview = async (
    reviewId: string,
    payload: UpdateReviewRequest,
  ) => {
    setSubmitting(true);
    try {
      const res = await reviewService.updateReview(reviewId, payload);
      updateReviewInList(reviewId, res.result);
      // Cap nhat summary neu rating thay doi
      if (payload.rating !== undefined) await fetchSummary();
      message.success("Cập nhật đánh giá thành công!");
    } catch {
      message.error("Cập nhật thất bại, thử lại sau");
      throw new Error("update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onDeleteReview = async (reviewId: string) => {
    try {
      await reviewService.deleteReview(reviewId);
      // Xoa khoi list ngay lap tuc, khong can fetch lai
      setReviews((prev) => prev.filter((r) => r.reviewId !== reviewId));
      await fetchSummary(); // Cap nhat lai tong so va diem trung binh
      message.success("Đã xóa đánh giá");
    } catch {
      message.error("Xóa thất bại");
    }
  };

  /**
   * OPTIMISTIC UI: Cap nhat so like tren UI NGAY LAP TUC
   * truoc khi doi API tra ve. Neu API loi thi revert lai.
   *
   * Tai sao can: neu doi API moi update thi co 200-500ms lag
   * khien user tuong nut khong hoat dong.
   */
  const onToggleVote = async (reviewId: string) => {
    // Buoc 1: Timm review can update
    const target = reviews.find((r) => r.reviewId === reviewId);
    if (!target) return;

    // Buoc 2: Cap nhat UI ngay (optimistic)
    const optimistic: ReviewResponse = {
      ...target,
      hasVoted: !target.hasVoted,
      helpfulCount: target.hasVoted
        ? target.helpfulCount - 1
        : target.helpfulCount + 1,
    };
    updateReviewInList(reviewId, optimistic);

    // Buoc 3: Goi API
    try {
      await reviewService.toggleVote(reviewId);
      // API thanh cong -> giu nguyen optimistic state
    } catch {
      // API loi -> REVERT ve state cu
      updateReviewInList(reviewId, target);
      message.error("Không thể vote, thử lại sau");
    }
  };

  const onReply = async (reviewId: string, payload: ReplyReviewRequest) => {
    setSubmitting(true);
    try {
      const res = await reviewService.replyReview(reviewId, payload);
      updateReviewInList(reviewId, res.result);
      message.success("Đã phản hồi đánh giá");
    } catch {
      message.error("Phản hồi thất bại");
      throw new Error("reply failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onUpdateReply = async (
    reviewId: string,
    payload: ReplyReviewRequest,
  ) => {
    setSubmitting(true);
    try {
      const res = await reviewService.updateReply(reviewId, payload);
      updateReviewInList(reviewId, res.result);
      message.success("Đã cập nhật phản hồi");
    } catch {
      message.error("Cập nhật phản hồi thất bại");
      throw new Error("update reply failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Filter handlers (reset page ve 1 khi doi filter) ─────────
  const onFilterRating = (rating: number | null) => {
    setFilterRating(rating);
    setPage(1);
  };

  const onSort = (s: SortOption) => {
    setSort(s);
    setPage(1);
  };

  const onHasMedia = (v: boolean) => {
    setHasMedia(v);
    setPage(1);
  };

  return {
    reviews,
    summary,
    pagination,
    loading,
    summaryLoading,
    submitting,
    filterRating,
    sort,
    hasMedia,
    page,
    setPage,
    onFilterRating,
    onSort,
    onHasMedia,
    onCreateReview,
    onUpdateReview,
    onDeleteReview,
    onToggleVote,
    onReply,
    onUpdateReply,
  };
}
