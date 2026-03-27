import { useNavigate } from "react-router-dom";

export default function PostCard({ post }: any) {
  const navigate = useNavigate();

  const cover =
    post.roomCoverImageUrl ||
    post.rentalAreaCoverImageUrl ||
    "https://placehold.co/600x400?text=Room";

  return (
    <div
      onClick={() => navigate(`/rentals/${post.rentalAreaId}`)}
      className="border rounded-xl shadow hover:shadow-lg cursor-pointer overflow-hidden bg-white"
    >
      {cover && (
        <img
          src={cover}
          alt={post.title}
          className="h-52 w-full object-cover rounded-t-xl"
        />
      )}

      <div className="p-4">
        <h2 className="font-semibold text-lg">{post.title}</h2>
        <p className="text-gray-500">
          {post.address || "Chưa cập nhật địa chỉ"}
        </p>

        <p className="text-blue-600 font-semibold mt-2">
          {post.price != null
            ? `${Number(post.price).toLocaleString("vi-VN")} VND / giờ`
            : "Liên hệ"}
        </p>
      </div>
    </div>
  );
}
