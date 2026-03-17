// src/components/review/ReviewSummary.tsx
//
// Hien thi tong hop: diem trung binh lon + progress bar phan bo sao
// Nhan du lieu tu useReviews hook, khong tu goi API

import { Skeleton } from "antd";
import { StarFilled } from "@ant-design/icons";
import type { ReviewSummaryResponse } from "../../types/review";

interface ReviewSummaryProps {
  summary: ReviewSummaryResponse | null;
  loading: boolean;
}

export function ReviewSummary({ summary, loading }: ReviewSummaryProps) {
  // Dang tai -> hien skeleton
  if (loading) {
    return <Skeleton active paragraph={{ rows: 5 }} className="p-4" />;
  }

  // Chua co du lieu
  if (!summary) return null;

  const avg = summary.averageRating;
  const total = summary.totalReviews;
  const hasReviews = total > 0;

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-center bg-white rounded-xl border border-gray-100 p-5 shadow-sm">

      {/* Phan trai: Diem trung binh */}
      <div className="flex flex-col items-center min-w-[110px]">
        <span className="text-5xl font-bold text-gray-900 leading-none">
          {hasReviews && avg != null ? avg.toFixed(1) : "—"}
        </span>
        <div className="flex gap-0.5 mt-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <StarFilled
              key={s}
              style={{
                fontSize: 16,
                color: hasReviews && avg != null && s <= Math.round(avg)
                  ? "#faad14"
                  : "#e5e7eb",
              }}
            />
          ))}
        </div>
        <span className="text-sm text-gray-400 mt-1.5 text-center">
          {hasReviews ? `${total} đánh giá` : "Chưa có đánh giá"}
        </span>
      </div>

      {/* Duong ngan */}
      <div className="hidden sm:block w-px h-20 bg-gray-100" />

      {/* Phan phai: Phan bo sao 5 -> 1 */}
      <div className="flex-1 w-full space-y-2">
        {summary.distribution.map(({ star, count, percentage }) => (
          <div key={star} className="flex items-center gap-2 text-sm">
            {/* So sao */}
            <span className="w-3 text-right text-gray-500 shrink-0 font-medium">
              {star}
            </span>
            <StarFilled style={{ fontSize: 12, color: "#faad14" }} />

            {/* Progress bar */}
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* So luong */}
            <span className="w-5 text-right text-gray-400 shrink-0 text-xs">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}