export default function RentalInfo({ rental }: any) {
  const amenities =
    rental.rooms?.[0]?.amenities?.slice(0, 6) || [];

  return (
    <div className="bg-white rounded-xl shadow-md rounded-2xl p-6 space-y-5">

    
      <div>
        <h1 className="text-2xl font-bold">
          {rental.rentalAreaName}
        </h1>

        <p className="text-gray-500 mt-1">
           {rental.address}
        </p>
      </div>

      <hr />

    
      <div>
        <h3 className="font-semibold mb-3">
          Tiện ích
        </h3>

        <div className="flex gap-6 flex-wrap text-gray-600">
          {amenities.map((a: any) => (
            <div
              key={a.amenityId}
              className="flex items-center gap-2"
            >
              ⭐
              <span>{a.amenityName}</span>
            </div>
          ))}
        </div>
      </div>

      <hr />

     
      <div>
        <h3 className="font-semibold mb-2">
          Mô tả
        </h3>

        <p className="text-gray-600 leading-relaxed">
          Không gian học tập hiện đại, đầy đủ tiện nghi,
          phù hợp cho nhóm học tập, workshop và meeting.
        </p>
      </div>

    </div>
  );
}