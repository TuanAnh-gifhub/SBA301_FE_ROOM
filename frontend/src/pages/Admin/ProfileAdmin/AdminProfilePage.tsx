import { useEffect, useState } from "react";

import { userService } from "../../../services/usersService";
import AdminProfileView from "./AdminProfileView";
export default function AdminProfilePage() {
  const [data, setData] = useState({
    name: "Quang",
    phone: "099",
    email: "e@gmail.com",
    gender: "MALE",
    dateOfBirth: "09-11-2003",
    role: "ADMIN",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await userService.getMe();
        setData(res.data.result);
        console.log("User Profile:", res.data.result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <h2 className="text-center text-2xl font-semibold mb-6">Hồ sơ cá nhân</h2>
      <AdminProfileView data={data} />
    </>
  );
}
