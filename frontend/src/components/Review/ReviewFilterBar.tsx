// src/components/review/ReviewFilterBar.tsx
//
// Thanh filter: loc theo sao, sap xep, toggle co hinh anh
// Nhan callback tu hook, khong quan ly state

import { Button, Select, Switch } from "antd";
import { StarFilled } from "@ant-design/icons";
import type { SortOption } from "../../types/review";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest",       label: "Mới nhất" },
  { value: "oldest",       label: "Cũ nhất" },
  { value: "highest",      label: "Điểm cao nhất" },
  { value: "lowest",       label: "Điểm thấp nhất" },
  { value: "most_helpful", label: "Hữu ích nhất" },
];

interface ReviewFilterBarProps {
  filterRating: number | null;
  sort: SortOption;
  hasMedia: boolean;
  totalElements: number;
  onFilterRating: (rating: number | null) => void;
  onSort: (sort: SortOption) => void;
  onHasMedia: (v: boolean) => void;
}

export function ReviewFilterBar({
  filterRating,
  sort,
  hasMedia,
  totalElements,
  onFilterRating,
  onSort,
  onHasMedia,
}: ReviewFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Tong so */}
      <span className="text-sm text-gray-500 font-medium shrink-0">
        {totalElements} đánh giá
      </span>

      {/* Nut loc sao: Tat ca, 5⭐, 4⭐, 3⭐, 2⭐, 1⭐ */}
      <div className="flex gap-1.5 flex-wrap">
        <Button
          size="small"
          type={filterRating === null ? "primary" : "default"}
          onClick={() => onFilterRating(null)}
        >
          Tất cả
        </Button>

        {[5, 4, 3, 2, 1].map((star) => (
          <Button
            key={star}
            size="small"
            // Primary (xanh) neu dang active, default neu khong
            type={filterRating === star ? "primary" : "default"}
            icon={
              <StarFilled
                style={{
                  color: filterRating === star ? "#fff" : "#faad14",
                  fontSize: 11,
                }}
              />
            }
            // Click lan 2 vao cung 1 sao -> bo filter
            onClick={() => onFilterRating(filterRating === star ? null : star)}
          >
            {star}
          </Button>
        ))}
      </div>

      {/* Dropdown sap xep */}
      <Select<SortOption>
        value={sort}
        onChange={onSort}
        size="small"
        style={{ minWidth: 150 }}
        options={SORT_OPTIONS}
      />

      {/* Toggle co hinh anh */}
      <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer shrink-0">
        <Switch size="small" checked={hasMedia} onChange={onHasMedia} />
        <span>Có hình ảnh</span>
      </label>
    </div>
  );
}