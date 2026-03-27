import React from "react";
import { Button, Card, Modal, Typography, Empty } from "antd";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EyeInvisibleOutlined,
  ExportOutlined,
  EyeOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  AppstoreOutlined,
  NumberOutlined,
} from "@ant-design/icons";
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

const approveColor = "#1677ff";
const hideColor = "#d97706";
const showColor = "#059669";
const deleteColor = "#dc2626";

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

const InfoPill: React.FC<{
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ icon, children }) => (
  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
    {icon}
    <span>{children}</span>
  </div>
);

const AdminPostCardList: React.FC<Props> = ({
  data,
  loading = false,
  onApprove,
  onToggleStatus,
  onDelete,
}) => {
  const onView = (rentalAreaId: string) => {
    const url = `/rentals/${rentalAreaId}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const confirmDelete = (p: PostSummaryResponse) => {
    Modal.confirm({
      centered: true,
      title: "Xóa bài đăng",
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
      okButtonProps: {
        danger: true,
        style: filledButtonStyle(deleteColor),
      },
      cancelText: "Hủy",
      onOk: async () => onDelete(p),
    });
  };

  const confirmApprove = (p: PostSummaryResponse) => {
    Modal.confirm({
      centered: true,
      title: "Duyệt bài đăng",
      icon: <ExclamationCircleOutlined style={{ color: approveColor }} />,
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
        style: filledButtonStyle(approveColor),
      },
      onOk: async () => onApprove(p),
    });
  };

  const confirmToggle = (p: PostSummaryResponse, next: PostStatus) => {
    const isHide = next === "HIDDEN";
    const actionColor = isHide ? hideColor : showColor;

    Modal.confirm({
      centered: true,
      title: isHide ? "Ẩn bài đăng" : "Hiện bài đăng",
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

  if (!loading && data.length === 0) {
    return (
      <Empty
        description="Không có bài đăng nào"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
            className="!rounded-3xl !overflow-hidden !border-0 !shadow-sm hover:!shadow-lg transition-all duration-300"
            styles={{ body: { padding: 18 } }}
            cover={
              cover ? (
                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                  <img
                    src={cover}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              ) : (
                <div className="flex h-52 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                  <div className="text-center">
                    <HomeOutlined className="text-3xl mb-2" />
                    <div>Không có ảnh</div>
                  </div>
                </div>
              )
            }
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-[18px] text-slate-800 line-clamp-2 leading-7">
                  {p.title}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {priceText ? (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-sky-100 text-sky-700">
                      {priceText}
                    </span>
                  ) : null}

                  {p.capacity != null ? (
                    <InfoPill icon={<AppstoreOutlined />}>
                      Sức chứa: <b>{p.capacity}</b>
                    </InfoPill>
                  ) : null}

                  {p.area != null ? (
                    <InfoPill icon={<NumberOutlined />}>
                      Diện tích: <b>{p.area}</b> m²
                    </InfoPill>
                  ) : null}
                </div>
              </div>

              <div className="shrink-0">
                <PostStatusTag status={p.postStatus} />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="text-slate-700">
                <Text className="!text-slate-700 !font-medium">
                  {p.roomName || "Chưa có tên phòng"}
                </Text>
                <span className="text-slate-400"> • </span>
                <Text className="!text-slate-600">
                  {p.rentalAreaName || "Chưa có khu"}
                </Text>
              </div>

              <div className="flex items-start gap-2 text-sm text-slate-500">
                <EnvironmentOutlined className="mt-1 text-slate-400" />
                <span className="line-clamp-2">{p.address}</span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Post ID: <span className="font-mono">{p.postId}</span>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
              <Button
                block
                icon={<ExportOutlined />}
                onClick={() => onView(p.rentalAreaId)}
                style={softButtonStyle("#1677ff")}
                className="!rounded-xl !font-medium !h-10 !px-4"
              >
                Xem chi tiết
              </Button>

              <Button
                block
                icon={<CheckCircleOutlined />}
                disabled={!canApprove}
                onClick={() => confirmApprove(p)}
                style={canApprove ? filledButtonStyle(approveColor) : undefined}
                className="!rounded-xl !font-medium !h-10 !px-4"
              >
                Duyệt
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
                className="!rounded-xl !font-medium !h-10 !px-4"
              >
                {canHide ? "Ẩn bài" : "Hiện bài"}
              </Button>

              <Button
                block
                danger
                icon={<DeleteOutlined />}
                onClick={() => confirmDelete(p)}
                className="!rounded-xl !font-medium !h-10 !px-4"
                style={softButtonStyle(deleteColor)}
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

export default AdminPostCardList;
