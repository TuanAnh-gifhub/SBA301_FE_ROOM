import { createContext, useContext, useState } from "react";

const BookingContext = createContext<any>(null);

export const BookingProvider = ({ children }: any) => {
  const [selectedRooms, setSelectedRooms] = useState({});

  const updateRoomQuantity = (roomId: string, quantity: number) => {
    setSelectedRooms((prev: any) => ({
      ...prev,
      [roomId]: quantity,
    }));
  };

  return (
    <BookingContext.Provider value={{ selectedRooms, updateRoomQuantity }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
