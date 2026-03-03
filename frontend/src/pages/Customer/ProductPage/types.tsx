export type CapacityLevel = "SMALL" | "MEDIUM" | "LARGE";

export type RoomCardItem = {
  postId: string;
  title: string;

  roomName: string;
  price?: number | null;
  capacity?: number | null;

  rentalAreaName?: string | null;
  city?: string | null;

  coverImageUrl?: string | null;
};
