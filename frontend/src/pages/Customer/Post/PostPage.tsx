import { useEffect, useState } from "react";
import type {
  PostDTOResponse,
  PageResponse,
  ApiResponse,
} from "../../../services/posts/posts";
import postsService from "../../../services/posts/posts";
export default function PostPage() {
  const [posts, setPosts] = useState<PostDTOResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = async (pageNumber: number) => {
    try {
      setLoading(true);

      const response: ApiResponse<PageResponse<PostDTOResponse>> =
        await postsService.getAllPosts(pageNumber, 10);

      setPosts(response.result?.data || []);
      setTotalPages(response.result.totalPages);
    } catch (error) {
      console.error("Lỗi khi lấy bài đăng", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Trang tin đăng</h1>

      {loading && (
        <div className="flex justify-center py-10">
          <p className="text-gray-500 animate-pulse">Đang tải...</p>
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          Không có bài đăng nào.
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div
            key={post.postId}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
          >
            {/* Content */}
            <div className="p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition">
                {post.title}
              </h2>

              <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                {post.content}
              </p>

              {/* Info */}
              <div className="text-sm text-gray-600 space-y-1 mb-3">
                <p>
                  👤 <span className="font-medium">{post.ownerName}</span>
                </p>
                <p> {post.ownerPhone}</p>
                <p> {post.rentalArea.address}</p>
                <p className="text-purple-600 font-semibold">
                  {post.rentalArea.rooms.price} / giờ
                </p>
              </div>

              {/* Rental Area */}
              <div className="bg-gray-50 p-3 rounded-xl border">
                <p className="font-medium text-gray-700">
                  {post.rentalArea.rentalAreaName}
                </p>
                <p className="text-gray-500 text-sm">
                  {post.rentalArea.address}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-10">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-100 disabled:opacity-40 transition"
        >
          ⬅ Prev
        </button>

        <span className="text-gray-700 font-medium">
          Trang {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-100 disabled:opacity-40 transition"
        >
          Next ➡
        </button>
      </div>
    </div>
  );
}
