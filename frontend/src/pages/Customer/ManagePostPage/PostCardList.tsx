import React from "react";
import { Button, Card, Tag, Typography, Modal, Tooltip } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  EyeInvisibleOutlined,
  ExportOutlined,
  EyeOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  TeamOutlined,
  AppstoreOutlined,
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

const brandColor = "#0ea5e9";
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
      return (
        <Tag className="!rounded-full !border-0 !bg-amber-100 !px-3 !py-1 !text-amber-700">
          Chờ duyệt
        </Tag>
      );
    case "PUBLISHED":
      return (
        <Tag className="!rounded-full !border-0 !bg-emerald-100 !px-3 !py-1 !text-emerald-700">
          Đã đăng
        </Tag>
      );
    case "HIDDEN":
      return (
        <Tag className="!rounded-full !border-0 !bg-slate-200 !px-3 !py-1 !text-slate-700">
          Đang ẩn
        </Tag>
      );
    case "DELETED":
      return (
        <Tag className="!rounded-full !border-0 !bg-rose-100 !px-3 !py-1 !text-rose-700">
          Đã xóa
        </Tag>
      );
    default:
      return <Tag>{s}</Tag>;
  }
};

const filledButtonStyle = (bg: string) => ({
  background: bg,
  borderColor: bg,
  color: "#fff",
  boxShadow: "0 8px 18px rgba(15, 23, 42, 0.08)",
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
        <div className="text-slate-600">
          Hành động này <b>không thể hoàn tác</b>. Bạn chắc chắn muốn xóa bài:
          <div className="mt-2 font-semibold text-slate-800 line-clamp-2">
            {p.title}
          </div>
        </div>
      ),
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: {
        danger: true,
        className: "!rounded-xl !font-semibold !h-10",
        style: filledButtonStyle(deleteColor),
      },
      cancelButtonProps: {
        className: "!rounded-xl !h-10",
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
        <div className="text-slate-600">
          Bạn chắc chắn muốn <b>{isHide ? "ẩn" : "hiện"}</b> bài đăng:
          <div className="mt-2 font-semibold text-slate-800 line-clamp-2">
            {p.title}
          </div>
        </div>
      ),
      okText: isHide ? "Ẩn bài" : "Hiện bài",
      cancelText: "Hủy",
      okButtonProps: {
        className: "!rounded-xl !font-semibold !h-10",
        style: filledButtonStyle(actionColor),
      },
      cancelButtonProps: {
        className: "!rounded-xl !h-10",
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
            className="group overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            styles={{ body: { padding: 18 } }}
            cover={
              cover ? (
                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                  <img
                    src={cover}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute left-3 top-3">
                    {statusTag(p.postStatus)}
                  </div>

                  {priceText ? (
                    <div className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-sky-600 shadow">
                      {priceText}
                    </div>
                  ) : null}

                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900/55 via-slate-900/10 to-transparent" />
                </div>
              ) : (
                <div className="bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>{statusTag(p.postStatus)}</div>
                    {priceText ? (
                      <div className="rounded-full bg-sky-500 px-3 py-1 text-sm font-semibold text-white shadow-sm">
                        {priceText}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <HomeOutlined className="text-xl text-sky-500" />
                  </div>
                </div>
              )
            }
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Tooltip title={p.title}>
                  <div className="line-clamp-2 text-lg font-bold leading-7 text-slate-800">
                    {p.title}
                  </div>
                </Tooltip>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-sky-700">
                    <HomeOutlined />
                    {p.roomName || "—"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-violet-700">
                    <AppstoreOutlined />
                    {p.rentalAreaName || "—"}
                  </span>
                </div>

                <div className="mt-3 flex items-start gap-2 text-sm text-slate-500">
                  <EnvironmentOutlined className="mt-0.5 text-slate-400" />
                  <span className="line-clamp-2">{p.address || "—"}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-slate-50 px-3 py-3">
                <div className="mb-1 flex items-center gap-1 text-xs text-slate-500">
                  <TeamOutlined />
                  Sức chứa
                </div>
                <div className="font-semibold text-slate-800">
                  {p.capacity ?? "—"}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 px-3 py-3">
                <div className="mb-1 flex items-center gap-1 text-xs text-slate-500">
                  <AppstoreOutlined />
                  Diện tích
                </div>
                <div className="font-semibold text-slate-800">
                  {p.area != null ? `${p.area} m²` : "—"}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 px-3 py-3">
                <div className="mb-1 text-xs text-slate-500">Giá thuê</div>
                <div className="font-semibold text-slate-800">
                  {priceText ?? "—"}
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4 grid grid-cols-2 gap-2.5">
              <Button
                block
                icon={<ExportOutlined />}
                onClick={() => onView(p.rentalAreaId)}
                style={softButtonStyle(brandColor)}
                className="!h-10 !rounded-xl !font-medium"
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
                className="!h-10 !rounded-xl !font-medium"
              >
                {canHide ? "Ẩn bài" : "Hiện bài"}
              </Button>

              <Button
                block
                icon={<EditOutlined />}
                onClick={() => onEdit(p)}
                style={softButtonStyle(editColor)}
                className="!h-10 !rounded-xl !font-medium"
              >
                Chỉnh sửa
              </Button>

              <Button
                block
                icon={<DeleteOutlined />}
                danger
                onClick={() => confirmDelete(p)}
                style={softButtonStyle(deleteColor)}
                className="!h-10 !rounded-xl !font-medium"
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
