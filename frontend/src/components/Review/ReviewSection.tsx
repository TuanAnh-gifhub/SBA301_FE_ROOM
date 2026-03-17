// src/components/review/ReviewSection.tsx
//
// Component CHINH - wrap tat ca lai thanh 1 section
// Day la FILE DUY NHAT ban can import vao trang RentalAreaDetail
//
// ── CACH SU DUNG ─────────────────────────────────────────────────
//
// import { ReviewSection } from "@/components/review/ReviewSection";
//
// // Trong trang RentalAreaDetail:
// <ReviewSection
//   rentalAreaId={rentalArea.rentalAreaId}
//   bookingId={completedBookingId}
//   currentUserId={user?.userId}
//   isOwner={user?.userId === rentalArea.ownerId}
// />
//
// ── PROPS ────────────────────────────────────────────────────────
//
// rentalAreaId   : ID phong can hien thi review (bat buoc)
// bookingId      : bookingId da COMPLETED cua user hien tai
//                  -> truyen vao = hien form de user viet review
//                  -> undefined   = an form (chua co booking COMPLETED)
// currentUserId  : ID user dang dang nhap (lay tu useAuth)
//                  -> undefined = chua dang nhap
// isOwner        : true neu user dang dang nhap la chu phong
//                  -> hien nut "Phan hoi" tren moi review

import { Divider } from "antd";
import { StarOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { useReviews } from "../../hooks/userReviews";
import type { CreateReviewRequest } from "../../types/review";
import { ReviewSummary } from "./ReviewSummary";
import { ReviewFilterBar } from "./ReviewFilterBar";
import { ReviewForm } from "./ReviewForm";
import { ReviewList } from "./ReviewList";

interface ReviewSectionProps {
  rentalAreaId: string;
  bookingId?: string;
  currentUserId?: string;
  isOwner?: boolean;
}

export function ReviewSection({
  rentalAreaId,
  bookingId,
  currentUserId,
  isOwner,
}: ReviewSectionProps) {
  // Lay user hien tai tu AuthContext (de bien biet da dang nhap chua)
  const { isAuthenticated } = useAuth();

  // Toan bo logic o day - component chi render
  const {
    reviews,
    summary,
    pagination,
    loading,
    summaryLoading,
    submitting,
    filterRating,
    sort,
    hasMedia,
    // page,
    setPage,
    onCreateReview,
    onUpdateReview,
    onDeleteReview,
    onToggleVote,
    onReply,
    onUpdateReply,
    onFilterRating,
    onSort,
    onHasMedia,
  } = useReviews(rentalAreaId);

  return (
    <section className="space-y-5">
      {/* Tieu de section */}
      <div className="flex items-center gap-2">
        <StarOutlined className="text-yellow-400 text-xl" />
        <h2 className="text-xl font-bold text-gray-900 m-0">Đánh giá</h2>
      </div>

      {/* Tong hop diem */}
      <ReviewSummary summary={summary} loading={summaryLoading} />

      <Divider className="my-4" />

      {/* Form viet review
          Dieu kien hien:
          1. Co bookingId (da dat phong va COMPLETED)
          2. Da dang nhap
          Logic an hien bookingId -> cha (RentalAreaDetail) quyet dinh
      */}
      {bookingId && isAuthenticated && (
        <ReviewForm
          bookingId={bookingId}
          submitting={submitting}
        onSubmit={(payload) => {
        // Vì bạn đang gọi onCreateReview, ta ngầm hiểu ngữ cảnh ở đây là Create
        // Nên ta có thể an tâm ép kiểu payload thành CreateReviewRequest
        return onCreateReview(payload as CreateReviewRequest);
        }}        />
      )}

      {/* Huong dan neu chua dang nhap */}
      {bookingId && !isAuthenticated && (
        <div className="text-center py-4 text-sm text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          Đăng nhập để viết đánh giá cho phòng này
        </div>
      )}

      {/* Filter bar */}
      <ReviewFilterBar
        filterRating={filterRating}
        sort={sort}
        hasMedia={hasMedia}
        totalElements={pagination.totalElements}
        onFilterRating={onFilterRating}
        onSort={onSort}
        onHasMedia={onHasMedia}
      />

      {/* Danh sach review */}
      <ReviewList
        reviews={reviews}
        pagination={pagination}
        loading={loading}
        submitting={submitting}
        currentUserId={currentUserId}
        isOwner={isOwner}
        onPageChange={setPage}
        onUpdate={onUpdateReview}
        onDelete={onDeleteReview}
        onVote={onToggleVote}
        onReply={onReply}
        onUpdateReply={onUpdateReply}
      />
    </section>
  );
}