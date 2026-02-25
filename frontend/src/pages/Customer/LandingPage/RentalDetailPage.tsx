import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import rentalAreasService from "../../../services/rental-areas/rentalAreas";
import RentalHeader from "./RentalHeader";
import RoomListPage from "./RoomListPage";

export default function RentalDetailPage() {
  const { id } = useParams();
  const [rental, setRental] = useState<any>(null);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    const res = await rentalAreasService.getDetail(id!);
    setRental(res.data.result);
  };

  if (!rental) return <p>Loading...</p>;

  return (
    <div className="p-8 space-y-8">
      <RentalHeader rental={rental} />
      <RoomListPage rooms={rental.rooms} />
    </div>
  );
}