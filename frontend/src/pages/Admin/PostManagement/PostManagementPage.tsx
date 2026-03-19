import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, Empty, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

import postsService, {
  type PostStatus,
  type PostSummaryResponse,
} from "../../../services/posts/posts";

import PageHeader from "./PageHeader";
import PostFilters from "./PostFilters";
import AdminPostCardList from "./AdminPostCardList";

const PostManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<PostSummaryResponse[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<PostStatus | undefined>(
    undefined,
  );
  const [keyword, setKeyword] = useState("");

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
      await fetchAdminPosts();
    } catch (e: any) {
      console.error(e);
      message.error(e?.response?.data?.message || "Xóa bài đăng thất bại");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4da6ff] mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="bg-gray-50 py-4">
      <div className="px-4">
        <PageHeader onRefresh={handleRefresh} loading={loading} />

        <PostFilters
          loading={loading}
          status={statusFilter}
          keyword={keyword}
          onStatusChange={setStatusFilter}
          onKeywordChange={setKeyword}
          onRefresh={handleRefresh}
        />

        <Card className="shadow-sm">
          {filtered.length === 0 && !loading ? (
            <Empty
              description="Không có bài đăng nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <AdminPostCardList
              data={filtered}
              loading={loading}
              onApprove={handleApprove}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default PostManagementPage;
