import React from "react";
import { Button, Card, Dropdown, Tag, Typography, Modal, Tooltip } from "antd";
import type { MenuProps } from "antd";
import { EllipsisOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import type {
  PostSummaryResponse,
  PostStatus,
} from "../../../services/posts/posts";

const { Text } = Typography;

type Props = {
  data: PostSummaryResponse[];
  loading?: boolean;

  onView: (postId: string) => void;
  onEdit: (item: PostSummaryResponse) => void;
  onDelete: (item: PostSummaryResponse) => Promise<void> | void;
  onToggleStatus: (item: PostSummaryResponse, next: PostStatus) => void;
};

const ACCENT = "#4da6ff";

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
      return <Tag>Đang ẩn</Tag>;
    case "DELETED":
      return <Tag color="red">Đã xóa</Tag>;
    default:
      return <Tag>{s}</Tag>;
  }
};

const PostCardList: React.FC<Props> = ({
  data,
  loading = false,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {data.map((p) => {
        const cover =
          p.roomCoverImageUrl || p.rentalAreaCoverImageUrl || undefined;

        const canHide = p.postStatus === "PUBLISHED";
        const canShow = p.postStatus === "HIDDEN";

        const priceText = formatVND(p.price as any);

        const items: MenuProps["items"] = [
          {
            key: "view",
            label: "Xem chi tiết",
            onClick: () => onView(p.postId),
          },
          {
            key: "edit",
            label: "Chỉnh sửa",
            onClick: () => onEdit(p),
          },
          ...(canHide
            ? [
                {
                  key: "hide",
                  label: "Ẩn bài",
                  onClick: () => onToggleStatus(p, "HIDDEN"),
                },
              ]
            : []),
          ...(canShow
            ? [
                {
                  key: "show",
                  label: "Hiện bài",
                  onClick: () => onToggleStatus(p, "PUBLISHED"),
                },
              ]
            : []),
          {
            key: "delete",
            label: <span className="text-red-500">Xóa</span>,
            onClick: () => {
              Modal.confirm({
                title: "Xóa tin đăng",
                icon: <ExclamationCircleOutlined />,
                content: (
                  <div>
                    <div className="font-medium text-gray-800 line-clamp-2">
                      {p.title}
                    </div>
                    <div className="text-gray-500 mt-1">
                      Hành động này không thể hoàn tác.
                    </div>
                  </div>
                ),
                okText: "Xóa",
                cancelText: "Hủy",
                okButtonProps: { danger: true },
                centered: true,
                maskClosable: false,
                onOk: async () => {
                  await onDelete(p);
                },
              });
            },
          },
        ];

        return (
          <Card
            key={p.postId}
            loading={loading}
            className="shadow-sm overflow-hidden"
            styles={{ body: { padding: 16 } }}
            cover={
              cover ? (
                <div className="relative h-44 w-full overflow-hidden bg-gray-100">
                  <img
                    src={cover}
                    alt={p.title}
                    className="h-44 w-full object-cover"
                  />

                  {/* status pill */}
                  <div className="absolute top-3 left-3">
                    {statusTag(p.postStatus)}
                  </div>

                  {/* price pill */}
                  {priceText ? (
                    <div
                      className="absolute top-3 right-3 px-3 py-1 rounded-full text-white text-sm font-semibold shadow"
                      style={{ background: ACCENT }}
                    >
                      {priceText}
                      <span className="opacity-90 font-normal"> / giờ</span>
                    </div>
                  ) : null}

                  {/* subtle overlay for readability */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">{statusTag(p.postStatus)}</div>
                    {priceText ? (
                      <div
                        className="px-3 py-1 rounded-full text-white text-sm font-semibold"
                        style={{ background: ACCENT }}
                      >
                        {priceText}
                        <span className="opacity-90 font-normal"> / giờ</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              )
            }
            actions={[
              <Button
                type="link"
                onClick={() => onView(p.postId)}
                key="view"
                style={{ color: ACCENT }}
              >
                Xem
              </Button>,
              <Button
                type="link"
                onClick={() => onEdit(p)}
                key="edit"
                style={{ color: ACCENT }}
              >
                Sửa
              </Button>,
              <Dropdown menu={{ items }} trigger={["click"]} key="more">
                <Button type="text" icon={<EllipsisOutlined />} />
              </Dropdown>,
            ]}
          >
            {/* Title */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Tooltip title={p.title}>
                  <div className="font-semibold text-gray-900 text-base line-clamp-2">
                    {p.title}
                  </div>
                </Tooltip>

                {/* room + rentalArea */}
                <div className="mt-1 text-gray-600">
                  <Text className="text-gray-600">
                    <span className="font-medium" style={{ color: ACCENT }}>
                      {p.roomName || "—"}
                    </span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="line-clamp-1">
                      {p.rentalAreaName || "—"}
                    </span>
                  </Text>
                </div>

                {/* address */}
                <div className="mt-1 text-gray-500 text-sm line-clamp-1">
                  {p.address || "—"}
                </div>
              </div>
            </div>

            {/* Specs */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <div className="text-xs text-gray-500">Sức chứa</div>
                <div className="font-semibold text-gray-900">
                  {p.capacity ?? "—"}
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <div className="text-xs text-gray-500">Diện tích</div>
                <div className="font-semibold text-gray-900">
                  {p.area != null ? `${p.area} m²` : "—"}
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <div className="text-xs text-gray-500">Giá/giờ</div>
                <div className="font-semibold text-gray-900">
                  {priceText ?? "—"}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default PostCardList;
