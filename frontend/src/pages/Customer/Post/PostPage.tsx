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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Trang tin đăng</h1>

      {loading && <p>Đang tải...</p>}

      {!loading && posts.length === 0 && <p>Không có bài đăng nào.</p>}

      <div className="grid gap-4">
        {posts.map((post) => (
          <div
            key={post.postId}
            className="border rounded-xl p-4 shadow-sm bg-white"
          >
            <h2 className="text-lg font-semibold mb-2">{post.title}</h2>

            <p className="text-gray-600 mb-2 line-clamp-2">{post.content}</p>

            <div className="text-sm text-gray-500 mb-2">
              <p>Chủ sỡ hữu: {post.ownerName}</p>
              <p>SĐT: {post.ownerPhone}</p>
              <p>Địa chỉ: {post.rentalArea.address}</p>
              <p>Giá Phòng :{post.rentalArea.rooms.price} /Giờ</p>
            </div>

            <div className="bg-gray-100 p-3 rounded-lg text-sm">
              <p className="font-medium">{post.rentalArea.rentalAreaName}</p>
              <p>{post.rentalArea.address}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span>
          Trang {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
