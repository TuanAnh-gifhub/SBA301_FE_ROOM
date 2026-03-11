// src/components/review/StarRatingPicker.tsx
//
// Component chon so sao (1-5), co hover effect
// Dung trong ReviewForm khi tao/sua review

import { useState } from "react";
import { StarFilled, StarOutlined } from "@ant-design/icons";

interface StarRatingPickerProps {
  value: number;
  onChange: (star: number) => void;
  disabled?: boolean;
  size?: number; // font-size cua icon (default: 30)
}

// Label hien thi khi hover/chon
const STAR_LABELS = ["", "Tệ", "Không tốt", "Bình thường", "Tốt", "Xuất sắc"];

export function StarRatingPicker({
  value,
  onChange,
  disabled = false,
  size = 30,
}: StarRatingPickerProps) {
  // hovered: sao dang duoc hover (0 = khong hover)
  const [hovered, setHovered] = useState(0);

  // Hien thi theo sao dang hover, fallback ve sao da chon
  const displayValue = hovered || value;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Hang sao */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            className={[
              "transition-transform duration-100",
              disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:scale-110",
            ].join(" ")}
            onMouseEnter={() => !disabled && setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => !disabled && onChange(star)}
          >
            {star <= displayValue ? (
              <StarFilled style={{ fontSize: size, color: "#faad14" }} />
            ) : (
              <StarOutlined style={{ fontSize: size, color: "#d9d9d9" }} />
            )}
          </button>
        ))}
      </div>

      {/* Label "Xuất sắc", "Tốt", ... */}
      <span
        className="text-sm font-medium h-5 transition-all duration-150"
        style={{ color: displayValue ? "#faad14" : "#bfbfbf" }}
      >
        {STAR_LABELS[displayValue] || "Chọn số sao đánh giá"}
      </span>
    </div>
  );
}