export default function RentalHeader({ rental }: any) {
  const cover = rental.rooms?.[0]?.images?.find(
    (i: any) => i.isCover,
  )?.imageUrl;

  return (
    <div>
      {cover && (
        <img src={cover} className="h-80 w-full object-contain rounded-xl" />
      )}

      <h1 className="text-2xl font-bold mt-4">{rental.rentalAreaName}</h1>

      <p className="text-gray-500">{rental.address}</p>
    </div>
  );
}
