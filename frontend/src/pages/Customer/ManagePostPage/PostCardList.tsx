import React from "react";
import { Button, Card, Tag, Typography, Modal, Tooltip } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  EyeInvisibleOutlined,
  ExportOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type {
  PostSummaryResponse,
  PostStatus,
} from "../../../services/posts/posts";

const { Text } = Typography;

type Props = {
  data: PostSummaryResponse[];
  loading?: boolean;
  onEdit: (item: PostSummaryResponse) => void;
  onDelete: (item: PostSummaryResponse) => Promise<void> | void;
  onToggleStatus: (item: PostSummaryResponse, next: PostStatus) => void;
};

const brandColor = "#1677ff";
const hideColor = "#d97706";
const showColor = "#059669";
const editColor = "#7c3aed";
const deleteColor = "#dc2626";

const formatVND = (value?: number | string | null) => {
  if (value === null || value === undefined) return null;
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return null;

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(num);
};

const statusTag = (s: PostStatus) => {
  switch (s) {
    case "PENDING":
      return <Tag color="gold">Chờ duyệt</Tag>;
    case "PUBLISHED":
      return <Tag color="green">Đã đăng</Tag>;
    case "HIDDEN":
      return <Tag color="default">Đang ẩn</Tag>;
    case "DELETED":
      return <Tag color="red">Đã xóa</Tag>;
    default:
      return <Tag>{s}</Tag>;
  }
};

const filledButtonStyle = (bg: string) => ({
  background: bg,
  borderColor: bg,
  color: "#fff",
  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
});

const softButtonStyle = (color: string) => ({
  color,
  borderColor: color,
  background: "#fff",
});

const PostCardList: React.FC<Props> = ({
  data,
  loading = false,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const onView = (rentalAreaId: string) => {
    const url = `/rentals/${rentalAreaId}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const confirmDelete = (p: PostSummaryResponse) => {
    Modal.confirm({
      centered: true,
      title: "Xóa tin đăng",
      icon: <ExclamationCircleOutlined style={{ color: deleteColor }} />,
      content: (
        <div className="text-gray-600">
          Hành động này <b>không thể hoàn tác</b>. Bạn chắc chắn muốn xóa bài:
          <div className="mt-1 font-semibold text-gray-800 line-clamp-2">
            {p.title}
          </div>
        </div>
      ),
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: {
        danger: true,
        style: filledButtonStyle(deleteColor),
      },
      maskClosable: false,
      onOk: async () => {
        await onDelete(p);
      },
    });
  };

  const confirmToggle = (p: PostSummaryResponse, next: PostStatus) => {
    const isHide = next === "HIDDEN";
    const actionColor = isHide ? hideColor : showColor;

    Modal.confirm({
      centered: true,
      title: isHide ? "Ẩn tin đăng" : "Hiện tin đăng",
      icon: <ExclamationCircleOutlined style={{ color: actionColor }} />,
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
        style: filledButtonStyle(actionColor),
      },
      onOk: async () => onToggleStatus(p, next),
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {data.map((p) => {
        const cover =
          p.roomCoverImageUrl || p.rentalAreaCoverImageUrl || undefined;

        const canHide = p.postStatus === "PUBLISHED";
        const canShow = p.postStatus === "HIDDEN";

        const priceText = formatVND(p.price as any);

        return (
          <Card
            key={p.postId}
            loading={loading}
            className="shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden border border-gray-100"
            styles={{ body: { padding: 16 } }}
            cover={
              cover ? (
                <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                  <img
                    src={cover}
                    alt={p.title}
                    className="h-48 w-full object-cover transition-transform duration-500 hover:scale-105"
                  />

                  <div className="absolute top-3 left-3">
                    {statusTag(p.postStatus)}
                  </div>

                  {priceText ? (
                    <div
                      className="absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-semibold shadow"
                      style={{
                        background: "rgba(22,119,255,0.95)",
                        color: "#fff",
                      }}
                    >
                      {priceText}
                    </div>
                  ) : null}

                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">{statusTag(p.postStatus)}</div>
                    {priceText ? (
                      <div
                        className="px-3 py-1 rounded-full text-white text-sm font-semibold"
                        style={{ background: brandColor }}
                      >
                        {priceText}
                      </div>
                    ) : null}
                  </div>
                </div>
              )
            }
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Tooltip title={p.title}>
                  <div className="font-semibold text-gray-900 text-base line-clamp-2 leading-6">
                    {p.title}
                  </div>
                </Tooltip>

                <div className="mt-2 text-gray-600">
                  <Text className="text-gray-600">
                    <span className="font-medium" style={{ color: brandColor }}>
                      {p.roomName || "—"}
                    </span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="line-clamp-1">
                      {p.rentalAreaName || "—"}
                    </span>
                  </Text>
                </div>

                <div className="mt-1 text-gray-500 text-sm line-clamp-1">
                  {p.address || "—"}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-gray-50 px-3 py-2">
                <div className="text-xs text-gray-500">Sức chứa</div>
                <div className="font-semibold text-gray-900">
                  {p.capacity ?? "—"}
                </div>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-2">
                <div className="text-xs text-gray-500">Diện tích</div>
                <div className="font-semibold text-gray-900">
                  {p.area != null ? `${p.area} m²` : "—"}
                </div>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-2">
                <div className="text-xs text-gray-500">Giá</div>
                <div className="font-semibold text-gray-900">
                  {priceText ?? "—"}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
              <Button
                block
                icon={<ExportOutlined />}
                onClick={() => onView(p.rentalAreaId)}
                style={softButtonStyle(brandColor)}
                className="rounded-xl font-medium h-10"
              >
                Xem chi tiết
              </Button>

              <Button
                block
                icon={canHide ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                disabled={!canHide && !canShow}
                onClick={() =>
                  confirmToggle(p, canHide ? "HIDDEN" : "PUBLISHED")
                }
                style={
                  canHide
                    ? filledButtonStyle(hideColor)
                    : canShow
                      ? filledButtonStyle(showColor)
                      : undefined
                }
                className="rounded-xl font-medium h-10"
              >
                {canHide ? "Ẩn bài" : "Hiện bài"}
              </Button>

              <Button
                block
                icon={<EditOutlined />}
                onClick={() => onEdit(p)}
                style={softButtonStyle(editColor)}
                className="rounded-xl font-medium h-10"
              >
                Chỉnh sửa
              </Button>

              <Button
                block
                icon={<DeleteOutlined />}
                danger
                onClick={() => confirmDelete(p)}
                style={softButtonStyle(deleteColor)}
                className="rounded-xl font-medium h-10"
              >
                Xóa
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default PostCardList;
