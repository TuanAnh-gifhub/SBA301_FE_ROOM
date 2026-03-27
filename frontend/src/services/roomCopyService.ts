import api from "./../config/axios";


export const roomCopyService = {
  getRoomCopiesByRentalArea: async (rentalAreaId: string) => {
    const response = await api.get(`/room-copies/rental-area/${rentalAreaId}`);
    return response.data;
  },
};