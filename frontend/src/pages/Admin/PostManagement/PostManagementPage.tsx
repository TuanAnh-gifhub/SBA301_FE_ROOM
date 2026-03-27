import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, Empty, Pagination, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

import postsService, {
  type PostStatus,
  type PostSummaryResponse,
} from "../../../services/posts/posts";

import PageHeader from "./PageHeader";
import PostFilters from "./PostFilters";
import AdminPostCardList from "./AdminPostCardList";

const PAGE_SIZE = 6;

const PostManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<PostSummaryResponse[]>([]);

  const [statusFilter, setStatusFilter] = useState<PostStatus | undefined>(
    undefined,
  );
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      message.warning("Vui lòng đăng nhập để truy cập trang quản trị");
      navigate("/");
    }
  }, [authLoading, isAuthenticated, navigate]);

  const fetchAdminPosts = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const res = await postsService.adminGetPosts(statusFilter);
      setItems(res.result || []);
    } catch (e: any) {
      console.error(e);
      message.error(
        e?.response?.data?.message || "Tải danh sách bài đăng thất bại",
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, statusFilter]);

  useEffect(() => {
    if (isAuthenticated) fetchAdminPosts();
  }, [isAuthenticated, fetchAdminPosts]);

  useEffect(() => {
    setPage(1);
  }, [keyword, statusFilter]);

  const filtered = useMemo(() => {
    let arr = [...items];
    const k = keyword.trim().toLowerCase();
    if (k) {
      arr = arr.filter(
        (x) =>
          x.title?.toLowerCase().includes(k) ||
          (x.roomName || "").toLowerCase().includes(k) ||
          (x.rentalAreaName || "").toLowerCase().includes(k) ||
          (x.address || "").toLowerCase().includes(k),
      );
    }
    return arr;
  }, [items, keyword]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      published: items.filter((x) => x.postStatus === "PUBLISHED").length,
      pending: items.filter((x) => x.postStatus === "PENDING").length,
      hidden: items.filter((x) => x.postStatus === "HIDDEN").length,
    };
  }, [items]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const handleRefresh = () => fetchAdminPosts();

  const handleApprove = async (p: PostSummaryResponse) => {
    try {
      await postsService.adminUpdatePostStatus(p.postId, "PUBLISHED");
      message.success("Duyệt bài thành công");
      await fetchAdminPosts();
    } catch (e: any) {
      console.error(e);
      message.error(e?.response?.data?.message || "Duyệt bài thất bại");
    }
  };

  const handleToggleStatus = async (
    p: PostSummaryResponse,
    next: PostStatus,
  ) => {
    try {
      await postsService.adminUpdatePostStatus(p.postId, next);
      message.success("Cập nhật trạng thái thành công");
      await fetchAdminPosts();
    } catch (e: any) {
      console.error(e);
      message.error(
        e?.response?.data?.message || "Cập nhật trạng thái thất bại",
      );
    }
  };

  const handleDelete = async (p: PostSummaryResponse) => {
    try {
      await postsService.adminDeletePost(p.postId);
      message.success("Xóa bài đăng thành công");

      const nextTotal = filtered.length - 1;
      const maxPageAfterDelete = Math.max(1, Math.ceil(nextTotal / PAGE_SIZE));
      if (page > maxPageAfterDelete) {
        setPage(maxPageAfterDelete);
      }

      await fetchAdminPosts();
    } catch (e: any) {
      console.error(e);
      message.error(e?.response?.data?.message || "Xóa bài đăng thất bại");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-4">
      <div className="px-4 md:px-6">
        <PageHeader
          onRefresh={handleRefresh}
          loading={loading}
          total={stats.total}
          published={stats.published}
          pending={stats.pending}
          hidden={stats.hidden}
        />

        <PostFilters
          loading={loading}
          status={statusFilter}
          keyword={keyword}
          onStatusChange={setStatusFilter}
          onKeywordChange={setKeyword}
          onRefresh={handleRefresh}
        />

        <Card
          className="!rounded-3xl !border-0 !shadow-sm"
          styles={{ body: { padding: 20 } }}
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Danh sách bài đăng
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Hiển thị {paginatedData.length} / {filtered.length} bài đăng
              </p>
            </div>
          </div>

          {filtered.length === 0 && !loading ? (
            <Empty
              description="Không có bài đăng nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <>
              <AdminPostCardList
                data={paginatedData}
                loading={loading}
                onApprove={handleApprove}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
              />

              <div className="mt-6 flex justify-center">
                <Pagination
                  current={page}
                  pageSize={PAGE_SIZE}
                  total={filtered.length}
                  onChange={setPage}
                  showSizeChanger={false}
                  showQuickJumper={false}
                />
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PostManagementPage;
