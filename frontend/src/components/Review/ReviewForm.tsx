// src/components/review/ReviewForm.tsx
//
// Form viet review moi HOAC sua review cu
// Phan biet qua prop `editingReview`: co = sua, khong = tao moi

import { useState } from "react";
import { Alert, Button, Input } from "antd";
import type {
  CreateReviewRequest,
  ReviewResponse,
  UpdateReviewRequest,
} from "../../types/review";
import { StarRatingPicker } from "./StarRatingPicker";
import { TagSelector } from "./TagSelector"; 

const { TextArea } = Input;
const MIN_COMMENT = 10;
const MAX_COMMENT = 2000;

interface ReviewFormProps {
  bookingId?: string;            // Bat buoc khi tao moi
  editingReview?: ReviewResponse; // Truyen vao khi o che do sua
  submitting: boolean;
  onSubmit: (payload: CreateReviewRequest | UpdateReviewRequest) => Promise<void>;
  onCancel?: () => void;
}

export function ReviewForm({
  bookingId,
  editingReview,
  submitting,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const isEditing = !!editingReview;

  // Pre-fill gia tri cu khi o che do sua
  const [rating, setRating] = useState(editingReview?.rating ?? 0);
  const [comment, setComment] = useState(editingReview?.comment ?? "");
  const [tags, setTags] = useState<string[]>(editingReview?.tags ?? []);
  const [error, setError] = useState("");

  // Validate truoc khi submit
  const validate = (): boolean => {
    if (!rating) {
      setError("Vui lòng chọn số sao trước khi gửi");
      return false;
    }
    if (comment && comment.trim().length < MIN_COMMENT) {
      setError(`Nội dung phải có ít nhất ${MIN_COMMENT} ký tự nếu có nhập`);
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    // Tao payload phu hop voi tung mode
    const payload = isEditing
      ? ({
          rating,
          comment: comment.trim() || undefined,
          tags,
        } satisfies UpdateReviewRequest)
      : ({
          bookingId: bookingId!,
          rating,
          comment: comment.trim() || undefined,
          tags,
          mediaUrls: [], // Media upload se lam sau
        } satisfies CreateReviewRequest);

    await onSubmit(payload);
  };

  const commentLength = comment.length;
  const isOverLimit = commentLength > MAX_COMMENT;

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
      <h3 className="text-base font-semibold text-gray-800 mb-4">
        {isEditing ? "✏️ Chỉnh sửa đánh giá" : "📝 Viết đánh giá của bạn"}
      </h3>

      {/* Loi validation */}
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={() => setError("")}
          className="mb-4"
        />
      )}

      <div className="space-y-5">
        {/* Chon sao - bat buoc */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số sao <span className="text-red-500">*</span>
          </label>
          <StarRatingPicker
            value={rating}
            onChange={setRating}
            disabled={submitting}
          />
        </div>

        {/* Quick tags - khong bat buoc */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nhận xét nhanh{" "}
            <span className="text-gray-400 font-normal">(không bắt buộc)</span>
          </label>
          <TagSelector value={tags} onChange={setTags} disabled={submitting} />
        </div>

        {/* Noi dung - khong bat buoc */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nội dung chi tiết{" "}
            <span className="text-gray-400 font-normal">(không bắt buộc)</span>
          </label>
          <TextArea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm thực tế về phòng này để giúp người khác đưa ra quyết định tốt hơn..."
            autoSize={{ minRows: 3, maxRows: 6 }}
            disabled={submitting}
            status={isOverLimit ? "error" : undefined}
          />
          {/* Dem ky tu */}
          <div
            className={`text-right text-xs mt-1 ${
              isOverLimit ? "text-red-500" : "text-gray-400"
            }`}
          >
            {commentLength}/{MAX_COMMENT}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-1">
          {onCancel && (
            <Button onClick={onCancel} disabled={submitting}>
              Hủy
            </Button>
          )}
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={submitting}
            disabled={isOverLimit}
          >
            {isEditing ? "Lưu thay đổi" : "Gửi đánh giá"}
          </Button>
        </div>
      </div>
    </div>
  );
}