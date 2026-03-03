import React from "react";
import { Button, Card, Dropdown, Modal, Typography } from "antd";
import type { MenuProps } from "antd";
import { EllipsisOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import type {
  PostSummaryResponse,
  PostStatus,
} from "../../../services/posts/posts";
import PostStatusTag from "./PostStatusTag";

const { Text } = Typography;

const formatVND = (value?: number | null) => {
  if (value == null) return null;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
};

type Props = {
  data: PostSummaryResponse[];
  loading?: boolean;
  onApprove: (item: PostSummaryResponse) => void;
  onToggleStatus: (item: PostSummaryResponse, next: PostStatus) => void;
  onDelete: (item: PostSummaryResponse) => void;
};

const AdminPostCardList: React.FC<Props> = ({
  data,
  loading = false,
  onApprove,
  onToggleStatus,
  onDelete,
}) => {
  const confirmDelete = (p: PostSummaryResponse) => {
    Modal.confirm({
      centered: true,
      title: "Xóa bài đăng",
      icon: <ExclamationCircleOutlined />,
      content: (
        <div className="text-gray-600">
          Hành động này <b>không thể hoàn tác</b>. Bạn chắc chắn muốn xóa bài:
          <div className="mt-1 font-semibold text-gray-800 line-clamp-2">
            {p.title}
          </div>
        </div>
      ),
      okText: "Xóa",
      okButtonProps: { danger: true },
      cancelText: "Hủy",
      onOk: async () => onDelete(p),
    });
  };

  const confirmApprove = (p: PostSummaryResponse) => {
    Modal.confirm({
      centered: true,
      title: "Duyệt bài đăng",
      icon: <ExclamationCircleOutlined />,
      content: (
        <div className="text-gray-600">
          Bạn chắc chắn muốn <b>duyệt</b> bài đăng:
          <div className="mt-1 font-semibold text-gray-800 line-clamp-2">
            {p.title}
          </div>
        </div>
      ),
      okText: "Duyệt",
      cancelText: "Hủy",
      okButtonProps: {
        style: { background: "#4da6ff", borderColor: "#4da6ff" },
      },
      onOk: async () => onApprove(p),
    });
  };

  const confirmToggle = (p: PostSummaryResponse, next: PostStatus) => {
    const isHide = next === "HIDDEN";

    Modal.confirm({
      centered: true,
      title: isHide ? "Ẩn bài đăng" : "Hiện bài đăng",
      icon: <ExclamationCircleOutlined />,
      content: (
        <div className="text-gray-600">
          Bạn chắc chắn muốn <b>{isHide ? "ẩn" : "hiện"}</b> bài đăng:
          <div className="mt-1 font-semibold text-gray-800 line-clamp-2">
            {p.title}
          </div>
        </div>
      ),
      okText: isHide ? "Ẩn bài" : "Hiện bài",
      cancelText: "Hủy",
      okButtonProps: {
        style: { background: "#4da6ff", borderColor: "#4da6ff" },
      },
      onOk: async () => onToggleStatus(p, next),
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {data.map((p) => {
        const cover =
          p.roomCoverImageUrl || p.rentalAreaCoverImageUrl || undefined;

        const canApprove = p.postStatus === "PENDING";
        const canHide = p.postStatus === "PUBLISHED";
        const canShow = p.postStatus === "HIDDEN";

        const priceText = formatVND(p.price as any);

        return (
          <Card
            key={p.postId}
            loading={loading}
            className="shadow-sm"
            cover={
              cover ? (
                <div className="h-44 w-full overflow-hidden bg-gray-100">
                  <img
                    src={cover}
                    alt={p.title}
                    className="h-44 w-full object-cover"
                  />
                </div>
              ) : null
            }
            actions={[
              <Button
                type="link"
                key="approve"
                disabled={!canApprove}
                onClick={() => confirmApprove(p)}
                style={{ color: canApprove ? "#4da6ff" : undefined }}
              >
                Duyệt
              </Button>,
              <Button
                type="link"
                key="toggle"
                disabled={!canHide && !canShow}
                onClick={() =>
                  confirmToggle(p, canHide ? "HIDDEN" : "PUBLISHED")
                }
                style={{ color: canHide || canShow ? "#4da6ff" : undefined }}
              >
                {canHide ? "Ẩn" : "Hiện"}
              </Button>,
              <Button
                type="link"
                key="delete"
                danger
                onClick={() => confirmDelete(p)}
              >
                Xóa
              </Button>,
              <Button
                type="link"
                key="delete"
                danger
                onClick={() => confirmDelete(p)}
              >
                Xem chi tiết
              </Button>,
            ]}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-gray-800 line-clamp-2">
                  {p.title}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {priceText ? (
                    <span
                      className="px-2 py-1 rounded-lg text-sm font-semibold"
                      style={{
                        background: "rgba(77,166,255,0.12)",
                        color: "#4da6ff",
                      }}
                    >
                      {priceText}
                    </span>
                  ) : null}

                  {p.capacity != null ? (
                    <span className="text-sm text-gray-600">
                      Sức chứa: <b>{p.capacity}</b>
                    </span>
                  ) : null}

                  {p.area != null ? (
                    <span className="text-sm text-gray-600">
                      Diện tích: <b>{p.area}</b> m²
                    </span>
                  ) : null}
                </div>

                <div className="mt-2 text-gray-700">
                  <Text className="text-gray-700">
                    <b>{p.roomName}</b> • {p.rentalAreaName}
                  </Text>
                </div>

                <div className="mt-1 text-gray-500 text-sm line-clamp-2">
                  {p.address}
                </div>
              </div>

              <div className="shrink-0">
                <PostStatusTag status={p.postStatus} />
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-500">
              Post ID: <span className="font-mono">{p.postId}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default AdminPostCardList;
