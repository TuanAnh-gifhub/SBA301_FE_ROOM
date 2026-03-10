// src/components/review/TagSelector.tsx
//
// Component chon quick tags khi viet review
// Toi da 5 tags, tags du 5 roi thi disable cac tag chua chon

import { REVIEW_TAGS } from "../../types/review";

const MAX_TAGS = 5;

interface TagSelectorProps {
  value: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
}

export function TagSelector({ value, onChange, disabled = false }: TagSelectorProps) {
  const toggle = (key: string) => {
    if (disabled) return;

    if (value.includes(key)) {
      // Dang chon -> bo chon
      onChange(value.filter((t) => t !== key));
    } else {
      // Chua chon -> them vao (neu chua day)
      if (value.length >= MAX_TAGS) return;
      onChange([...value, key]);
    }
  };

  const isMaxed = value.length >= MAX_TAGS;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {REVIEW_TAGS.map(({ key, label, icon }) => {
          const isSelected = value.includes(key);
          const isDisabled = disabled || (!isSelected && isMaxed);

          return (
            <button
              key={key}
              type="button"
              disabled={isDisabled}
              onClick={() => toggle(key)}
              className={[
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm",
                "font-medium transition-all duration-150 select-none",
                isSelected
                  ? "bg-blue-500 border-blue-500 text-white shadow-sm scale-105"
                  : "bg-white border-gray-200 text-gray-600",
                !isDisabled && !isSelected
                  ? "hover:border-blue-300 hover:text-blue-500 cursor-pointer"
                  : "",
                isDisabled ? "opacity-40 cursor-not-allowed" : "",
              ].join(" ")}
            >
              <span role="img" aria-label={label}>{icon}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Counter */}
      <p className="text-xs text-gray-400">
        Đã chọn {value.length}/{MAX_TAGS} nhận xét nhanh
        {isMaxed && (
          <span className="text-orange-500 ml-1">· Đã đạt tối đa</span>
        )}
      </p>
    </div>
  );
}