import React, { useMemo, useState } from "react";
import { Card, Select, Slider, Tag, Typography } from "antd";

const { Text } = Typography;

type OptionNumber = { label: string; value: number };

type Props = {
  cityId?: number;
  cityOptions: OptionNumber[];
  onCityChange: (v?: number) => void;

  date: any;
  onDateChange: (v: any) => void;

  timeRange: [number, number];
  onTimeRangeChange: (v: [number, number]) => void;

  capacityRange: [number, number];
  onCapacityRangeChange: (v: [number, number]) => void;

  categoryId?: number;
  categoryOptions: OptionNumber[];
  onCategoryChange: (v?: number) => void;

  amenityIds: number[];
  amenityOptions: OptionNumber[];
  onAmenityAdd: (id: number) => void;
  onAmenityRemove: (id: number) => void;
};

const FilterSidebar: React.FC<Props> = ({
  cityId,
  cityOptions,
  onCityChange,

  capacityRange,
  onCapacityRangeChange,

  categoryId,
  categoryOptions,
  onCategoryChange,

  amenityIds,
  amenityOptions,
  onAmenityAdd,
  onAmenityRemove,
}) => {
  const [amenityPick, setAmenityPick] = useState<number | undefined>(undefined);

  const amenityMap = useMemo(() => {
    const m = new Map<number, string>();
    amenityOptions.forEach((x) => m.set(x.value, x.label));
    return m;
  }, [amenityOptions]);

  return (
    <Card className="shadow-sm rounded-xl">
      <div className="space-y-5">
        <div>
          <div className="font-semibold text-gray-800 mb-2">Bộ lọc</div>
          <Text type="secondary">Chọn tiêu chí để tìm phòng phù hợp</Text>
        </div>

        {/* Thành phố */}
        <div>
          <div className="font-medium text-gray-700 mb-2">Thành phố</div>
          <Select
            placeholder="Chọn thành phố"
            value={cityId}
            options={cityOptions}
            onChange={(v) => onCityChange(v)}
            allowClear
            style={{ width: "100%" }}
          />
        </div>

        {/* Loại phòng */}
        <div>
          <div className="font-medium text-gray-700 mb-2">Loại phòng</div>
          <Select
            placeholder="Chọn loại phòng"
            value={categoryId}
            options={categoryOptions}
            onChange={(v) => onCategoryChange(v)}
            allowClear
            style={{ width: "100%" }}
          />
        </div>

        {/* Sức chứa */}
        <div>
          <div className="font-medium text-gray-700 mb-2">Sức chứa</div>
          <div className="mb-1 text-sm text-gray-600">
            Từ <b>{capacityRange[0]}</b> đến <b>{capacityRange[1]}</b> người
          </div>
          <Slider
            range
            min={1}
            max={100}
            value={capacityRange}
            onChange={(v) => onCapacityRangeChange(v as [number, number])}
          />
        </div>

        {/* Tiện ích */}
        <div>
          <div className="font-medium text-gray-700 mb-2">Tiện ích</div>

          <Select
            placeholder="Chọn tiện ích để thêm"
            value={amenityPick}
            options={amenityOptions.filter(
              (x) => !amenityIds.includes(x.value),
            )}
            onChange={(v) => {
              setAmenityPick(undefined);
              onAmenityAdd(v);
            }}
            style={{ width: "100%" }}
            allowClear
          />

          {amenityIds.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {amenityIds.map((id) => (
                <Tag
                  key={id}
                  closable
                  onClose={(e) => {
                    e.preventDefault();
                    onAmenityRemove(id);
                  }}
                  style={{
                    borderColor: "#4da6ff",
                    color: "#1f5fbf",
                    background: "#eaf4ff",
                  }}
                >
                  {amenityMap.get(id) || `Tiện ích #${id}`}
                </Tag>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default FilterSidebar;
