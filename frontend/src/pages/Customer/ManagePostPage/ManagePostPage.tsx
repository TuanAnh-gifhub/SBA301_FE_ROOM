import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, Empty, Pagination, message } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeInvisibleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

import postsService, {
  type PostStatus,
  type PostSummaryResponse,
} from "../../../services/posts/posts";

import PageHeader from "./PageHeader";
import PostFilters from "./PostFilters";
import PostCardList from "./PostCardList";
import CreatePostModal from "./CreatePostModal";
import UpdatePostModal from "./UpdatePostModal";

const ManagePostPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<PostSummaryResponse[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  const [statusFilter, setStatusFilter] = useState<PostStatus | undefined>(
    undefined,
  );
  const [keywordFilter, setKeywordFilter] = useState("");

  const [createOpen, setCreateOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<PostSummaryResponse | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      message.warning("Vui lòng đăng nhập để quản lý tin đăng");
      navigate("/");
    }
  }, [authLoading, isAuthenticated, navigate]);

  const fetchMyPosts = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const res = await postsService.getMyPosts(statusFilter);
      setItems(res.result || []);
    } catch (e) {
      console.error(e);
      message.error("Đã xảy ra lỗi khi tải danh sách tin đăng");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, statusFilter]);

  useEffect(() => {
    if (isAuthenticated) fetchMyPosts();
  }, [isAuthenticated, fetchMyPosts]);

  const filtered = useMemo(() => {
    let arr = [...items];
    const k = keywordFilter.trim().toLowerCase();

    if (k) {
      arr = arr.filter(
        (x) =>
          x.title.toLowerCase().includes(k) ||
          (x.roomName || "").toLowerCase().includes(k) ||
          (x.address || "").toLowerCase().includes(k),
      );
    }

    return arr;
  }, [items, keywordFilter]);

  const total = filtered.length;

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, keywordFilter]);

  const stats = useMemo(() => {
    const pending = items.filter((x) => x.postStatus === "PENDING").length;
    const published = items.filter((x) => x.postStatus === "PUBLISHED").length;
    const hidden = items.filter((x) => x.postStatus === "HIDDEN").length;

    return {
      total: items.length,
      pending,
      published,
      hidden,
    };
  }, [items]);

  const handleRefresh = () => fetchMyPosts();

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleOpenCreate = () => setCreateOpen(true);
  const handleCloseCreate = () => setCreateOpen(false);

  const handleCreated = async () => {
    setCreateOpen(false);
    await fetchMyPosts();
  };

  const handleEdit = (item: PostSummaryResponse) => {
    setEditing(item);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setEditing(null);
  };

  const handleUpdated = async () => {
    setEditOpen(false);
    setEditing(null);
    await fetchMyPosts();
  };

  const handleDelete = async (item: PostSummaryResponse) => {
    try {
      await postsService.deleteMyPost(item.postId);
      message.success("Xóa tin đăng thành công");
      await fetchMyPosts();
    } catch (e: any) {
      console.error(e);
      message.error(e?.response?.data?.message || "Xóa tin đăng thất bại");
    }
  };

  const handleToggleStatus = async (
    item: PostSummaryResponse,
    next: PostStatus,
  ) => {
    try {
      await postsService.updateMyPostStatus(item.postId, next);
      message.success("Cập nhật trạng thái thành công");
      await fetchMyPosts();
    } catch (e: any) {
      console.error(e);
      message.error(
        e?.response?.data?.message || "Cập nhật trạng thái thất bại",
      );
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Đang tải dữ liệu tin đăng...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const statCards = [
    {
      title: "Tổng tin đăng",
      value: stats.total,
      icon: <FileTextOutlined className="text-sky-600 text-xl" />,
      bg: "from-sky-50 to-cyan-50",
    },
    {
      title: "Chờ duyệt",
      value: stats.pending,
      icon: <ClockCircleOutlined className="text-amber-500 text-xl" />,
      bg: "from-amber-50 to-yellow-50",
    },
    {
      title: "Đã đăng",
      value: stats.published,
      icon: <CheckCircleOutlined className="text-emerald-600 text-xl" />,
      bg: "from-emerald-50 to-green-50",
    },
    {
      title: "Đang ẩn",
      value: stats.hidden,
      icon: <EyeInvisibleOutlined className="text-slate-600 text-xl" />,
      bg: "from-slate-50 to-gray-100",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-5">
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-6">
        <PageHeader onCreate={handleOpenCreate} />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {statCards.map((card) => (
            <div
              key={card.title}
              className={`rounded-2xl bg-gradient-to-br ${card.bg} p-5 shadow-sm border border-white/70`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{card.title}</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-800">
                    {card.value}
                  </h3>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <PostFilters
          keyword={keywordFilter}
          status={statusFilter}
          loading={loading}
          onKeywordChange={setKeywordFilter}
          onStatusChange={setStatusFilter}
          onRefresh={handleRefresh}
          onClearFilters={() => {
            setKeywordFilter("");
            setStatusFilter(undefined);
          }}
        />

        <Card className="rounded-3xl border-0 shadow-sm">
          <div className="mb-5 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Danh sách tin đăng
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Theo dõi trạng thái và thao tác nhanh với toàn bộ tin đăng của
                bạn
              </p>
            </div>

            <div className="text-sm text-slate-500">
              Hiển thị{" "}
              <span className="font-semibold text-slate-700">{total}</span> kết
              quả
            </div>
          </div>

          {paginated.length === 0 && !loading ? (
            <div className="py-12">
              <Empty
                description={
                  <div className="text-slate-500">
                    <div className="font-medium text-slate-700 mb-1">
                      Chưa có tin đăng phù hợp
                    </div>
                    <div>
                      Hãy tạo tin đăng mới hoặc thử thay đổi bộ lọc tìm kiếm
                    </div>
                  </div>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : (
            <>
              <PostCardList
                data={paginated}
                loading={loading}
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
              />

              {total > 0 && (
                <div className="mt-6 flex justify-end">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={total}
                    onChange={handlePageChange}
                    onShowSizeChange={handlePageChange}
                    showSizeChanger
                    showTotal={(t, range) =>
                      `${range[0]}-${range[1]} của ${t} tin đăng`
                    }
                    pageSizeOptions={["6", "9", "12", "18"]}
                  />
                </div>
              )}
            </>
          )}
        </Card>

        <CreatePostModal
          open={createOpen}
          onClose={handleCloseCreate}
          onCreated={handleCreated}
        />

        <UpdatePostModal
          open={editOpen}
          initial={editing}
          onClose={handleCloseEdit}
          onUpdated={handleUpdated}
        />
      </div>
    </div>
  );
};

export default ManagePostPage;
