import React from "react";
import { Select, Typography } from "antd";

const { Title, Text } = Typography;

type SortValue = "POPULARITY" | "PRICE_ASC" | "PRICE_DESC" | "NEWEST";

type Props = {
  total: number;
  sort: SortValue;
  onSortChange: (v: SortValue) => void;
};

const TopBar: React.FC<Props> = ({ total, sort, onSortChange }) => {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div>
        <Title level={4} style={{ margin: 0 }}>
          Phòng trống <Text type="secondary">({total})</Text>
        </Title>
      </div>

      <div className="flex items-center gap-2">
        <Text type="secondary">Sắp xếp theo:</Text>
        <Select
          value={sort}
          style={{ width: 180 }}
          onChange={onSortChange}
          options={[
            { value: "POPULARITY", label: "Phổ biến" },
            { value: "NEWEST", label: "Mới nhất" },
            { value: "PRICE_ASC", label: "Giá: Thấp → Cao" },
            { value: "PRICE_DESC", label: "Giá: Cao → Thấp" },
          ]}
        />
      </div>
    </div>
  );
};

export default TopBar;
export type { SortValue };
