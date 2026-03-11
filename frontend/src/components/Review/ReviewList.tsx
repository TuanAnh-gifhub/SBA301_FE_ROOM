// src/components/review/ReviewList.tsx
//
// Render danh sach ReviewCard voi:
//   - Skeleton loader khi dang tai
//   - Empty state khi chua co review
//   - Pagination o cuoi

import { Empty, Pagination, Skeleton } from "antd";
import type {
  PageResponse,
  ReplyReviewRequest,
  ReviewResponse,
  UpdateReviewRequest,
} from "../../types/review";
import { ReviewCard } from "./ReviewCard";

// Skeleton 1 card khi loading
function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton.Avatar active size="default" />
        <Skeleton active title={{ width: 120 }} paragraph={false} />
      </div>
      <Skeleton active paragraph={{ rows: 2 }} title={false} />
    </div>
  );
}

interface ReviewListProps {
  reviews: ReviewResponse[];
  pagination: Omit<PageResponse<unknown>, "data">;
  loading: boolean;
  submitting: boolean;
  currentUserId?: string;
  isOwner?: boolean;
  onPageChange: (page: number) => void;
  onUpdate: (reviewId: string, payload: UpdateReviewRequest) => Promise<void>;
  onDelete: (reviewId: string) => Promise<void>;
  onVote: (reviewId: string) => Promise<void>;
  onReply: (reviewId: string, payload: ReplyReviewRequest) => Promise<void>;
  onUpdateReply: (reviewId: string, payload: ReplyReviewRequest) => Promise<void>;
}

export function ReviewList({
  reviews,
  pagination,
  loading,
  submitting,
  currentUserId,
  isOwner,
  onPageChange,
  onUpdate,
  onDelete,
  onVote,
  onReply,
  onUpdateReply,
}: ReviewListProps) {
  // Loading: hien 3 skeleton
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  // Empty state
  if (reviews.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span className="text-gray-400 text-sm">
            Chưa có đánh giá nào.
            <br />
            Hãy là người đầu tiên đánh giá phòng này!
          </span>
        }
        className="py-12"
      />
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <ReviewCard
          key={review.reviewId}
          review={review}
          currentUserId={currentUserId}
          isOwner={isOwner}
          submitting={submitting}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onVote={onVote}
          onReply={onReply}
          onUpdateReply={onUpdateReply}
        />
      ))}

      {/* Pagination - chi hien khi co nhieu hon 1 trang */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination
            current={pagination.currentPage}
            total={pagination.totalElements}
            pageSize={pagination.pageSize}
            onChange={onPageChange}
            showSizeChanger={false}
            showTotal={(total, range) =>
              `${range[0]}–${range[1]} trong ${total} đánh giá`
            }
          />
        </div>
      )}
    </div>
  );
}