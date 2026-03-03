import React from "react";
import { Empty, Skeleton } from "antd";
import RoomCard from "./RoomCard";
import type { RoomCardItem } from "./types";

type Props = {
  loading?: boolean;
  data: RoomCardItem[];
  onView: (postId: string) => void;
};

const RoomGrid: React.FC<Props> = ({ loading = false, data, onView }) => {
  if (!loading && data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-10 shadow-sm">
        <Empty description="Không có phòng phù hợp" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {loading
        ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-3">
              <Skeleton.Image active style={{ width: "100%", height: 176 }} />
              <Skeleton active paragraph={{ rows: 3 }} className="mt-3" />
            </div>
          ))
        : data.map((item) => (
            <RoomCard key={item.postId} item={item} onView={onView} />
          ))}
    </div>
  );
};

export default RoomGrid;
