import { useNavigate } from "react-router-dom";

export default function PostCard({ post }: any) {
  const navigate = useNavigate();

  const rental = post.rentalArea;
  const firstRoom = rental.rooms?.[0];

  const cover = firstRoom?.images?.find((img: any) => img.isCover)?.imageUrl;

  return (
    <div
      onClick={() => navigate(`/rentals/${rental.rentalAreaId}`)}
      className="border rounded-xl shadow hover:shadow-lg cursor-pointer"
    >
      {cover && (
        <img src={cover} className="h-52 w-full object-cover rounded-t-xl" />
      )}

      <div className="p-4">
        <h2 className="font-semibold text-lg">{post.title}</h2>
        <p className="text-gray-500">{rental.address}</p>

        {firstRoom && (
          <p className="text-blue-600 font-semibold mt-2">
            {firstRoom.price.toLocaleString()} VND / giờ
          </p>
        )}
      </div>
    </div>
  );
}
