// src/components/review/ReviewCard.tsx
//
// Hien thi 1 review: avatar, ten, ngay, sao, tags, noi dung,
// nut sua/xoa (neu la chu review), vote, reply cua chu phong

import { useState } from "react";
import {
  Avatar, Button, Popconfirm, Rate, Tag, Tooltip,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  LikeFilled,
  LikeOutlined,
  MessageOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type {
  ReplyReviewRequest,
  ReviewResponse,
  UpdateReviewRequest,
} from "../../types/review";
import { REVIEW_TAGS } from "../../types/review";
import { ReviewForm } from "./ReviewForm";

// Map tu key -> { label, icon } de hien thi tag dep
const TAG_MAP = Object.fromEntries(REVIEW_TAGS.map((t) => [t.key, t]));

// Format ngay "3 ngay truoc", "2 tuan truoc", v.v.
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (mins < 60) return `${mins} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  if (weeks < 5) return `${weeks} tuần trước`;
  if (months < 12) return `${months} tháng trước`;
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

interface ReviewCardProps {
  review: ReviewResponse;
  currentUserId?: string; // ID user dang dang nhap
  isOwner?: boolean;      // User dang dang nhap co phai chu phong khong
  submitting: boolean;
  onUpdate: (reviewId: string, payload: UpdateReviewRequest) => Promise<void>;
  onDelete: (reviewId: string) => Promise<void>;
  onVote: (reviewId: string) => Promise<void>;
  onReply: (reviewId: string, payload: ReplyReviewRequest) => Promise<void>;
  onUpdateReply: (reviewId: string, payload: ReplyReviewRequest) => Promise<void>;
}

export function ReviewCard({
  review,
  currentUserId,
  isOwner,
  submitting,
  onUpdate,
  onDelete,
  onVote,
  onReply,
  onUpdateReply,
}: ReviewCardProps) {
  // Local UI state - chi anh huong cai card nay, khong can dua len hook
  const [isEditing, setIsEditing] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [isEditingReply, setIsEditingReply] = useState(false);
  const [replyContent, setReplyContent] = useState(review.reply?.content ?? "");

  const isMyReview = currentUserId === review.reviewer.userId;

  const handleUpdateSubmit = async (payload: UpdateReviewRequest) => {
    await onUpdate(review.reviewId, payload);
    setIsEditing(false); // Dong form sau khi sua thanh cong
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;
    if (isEditingReply) {
      await onUpdateReply(review.reviewId, { content: replyContent });
      setIsEditingReply(false);
    } else {
      await onReply(review.reviewId, { content: replyContent });
      setShowReplyInput(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">

      {/* ── Header: Avatar + Ten + Ngay + Nut sua/xoa ── */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <Avatar
            icon={<UserOutlined />}
            className="bg-blue-100 text-blue-600 shrink-0"
          />
          <div>
            <p className="font-semibold text-gray-800 text-sm leading-tight">
              {review.reviewer.userName}
            </p>
            <Tooltip
              title={new Date(review.createdAt).toLocaleString("vi-VN")}
            >
              <span className="text-xs text-gray-400 cursor-default">
                {timeAgo(review.createdAt)}
                {review.updatedAt !== review.createdAt && " · đã chỉnh sửa"}
              </span>
            </Tooltip>
          </div>
        </div>

        {/* Nut sua/xoa - chi hien voi chinh chu review va con trong 7 ngay */}
        {isMyReview && review.canEdit && !isEditing && (
          <div className="flex gap-0.5">
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => setIsEditing(true)}
              />
            </Tooltip>
            <Popconfirm
              title="Xóa đánh giá này?"
              description="Bạn không thể hoàn tác sau khi xóa."
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={() => onDelete(review.reviewId)}
            >
              <Tooltip title="Xóa">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          </div>
        )}
      </div>

      {/* ── Rating ── */}
      <Rate disabled value={review.rating} className="text-sm mb-2" />

      {/* ── Tags ── */}
      {review.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {review.tags.map((key) => {
            const tag = TAG_MAP[key];
            return tag ? (
              <Tag key={key} color="blue" className="text-xs rounded-full m-0">
                {tag.icon} {tag.label}
              </Tag>
            ) : null;
          })}
        </div>
      )}

      {/* ── Noi dung: Form sua HOAC text binh thuong ── */}
      {isEditing ? (
        <ReviewForm
          editingReview={review}
          submitting={submitting}
          onSubmit={handleUpdateSubmit}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        review.comment && (
          <p className="text-gray-700 text-sm leading-relaxed mb-3 whitespace-pre-line">
            {review.comment}
          </p>
        )
      )}

      {/* ── Footer: Vote + Nut reply ── */}
      {!isEditing && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          {/* Vote huu ich */}
          <Tooltip title={isMyReview ? "Không thể vote đánh giá của chính mình" : ""}>
            <button
              type="button"
              onClick={() => !isMyReview && onVote(review.reviewId)}
              disabled={isMyReview}
              className={[
                "flex items-center gap-1.5 text-sm transition-colors",
                isMyReview
                  ? "text-gray-300 cursor-not-allowed"
                  : review.hasVoted
                    ? "text-blue-500 font-medium hover:text-blue-600"
                    : "text-gray-400 hover:text-blue-500 cursor-pointer",
              ].join(" ")}
            >
              {review.hasVoted ? <LikeFilled /> : <LikeOutlined />}
              <span>Hữu ích ({review.helpfulCount})</span>
            </button>
          </Tooltip>

          {/* Nut reply - chi hien voi chu phong, chi khi chua co reply */}
          {isOwner && !review.reply && !showReplyInput && (
            <Button
              type="text"
              size="small"
              icon={<MessageOutlined />}
              className="text-gray-500 hover:text-blue-500"
              onClick={() => setShowReplyInput(true)}
            >
              Phản hồi
            </Button>
          )}
        </div>
      )}

      {/* ── Reply hien thi (da co reply) ── */}
      {review.reply && !isEditingReply && (
        <div className="mt-3 ml-4 pl-4 border-l-2 border-blue-100 bg-blue-50/50 rounded-r-lg py-2.5 px-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-blue-600">
              💬 Phản hồi từ chủ phòng · {review.reply.ownerName}
            </span>
            {/* Cho phep chu phong sua reply */}
            {isOwner && (
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                className="text-gray-400 text-xs"
                onClick={() => {
                  setReplyContent(review.reply!.content);
                  setIsEditingReply(true);
                }}
              >
                Sửa
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-700">{review.reply.content}</p>
        </div>
      )}

      {/* ── Input nhap reply moi HOAC sua reply ── */}
      {(showReplyInput || isEditingReply) && (
        <div className="mt-3 ml-4 pl-4 border-l-2 border-blue-200">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Nhập phản hồi của bạn..."
            rows={3}
            maxLength={1000}
            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
          />
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs text-gray-400">
              {replyContent.length}/1000
            </span>
            <div className="flex gap-2">
              <Button
                size="small"
                onClick={() => {
                  setShowReplyInput(false);
                  setIsEditingReply(false);
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                size="small"
                loading={submitting}
                disabled={!replyContent.trim()}
                onClick={handleReplySubmit}
              >
                {isEditingReply ? "Lưu" : "Gửi"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}