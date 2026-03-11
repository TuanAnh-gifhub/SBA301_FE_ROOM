import api from "../../config/axios";

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export type PostStatus =
  | "PENDING"
  | "PUBLISHED"
  | "HIDDEN"
  | "DELETED"
  | string;

export type RoomStatus = "ACTIVE" | "INACTIVE" | string;
export type RoomCopyStatus =
  | "AVAILABLE"
  | "BOOKED"
  | "MAINTENANCE"
  | "INACTIVE"
  | string;

export interface PostSummaryResponse {
  postId: string;
  title: string;
  postStatus: PostStatus;

  roomId: string;
  roomName: string;
  price?: number | null;
  capacity?: number | null;
  area?: number | null;
  roomCoverImageUrl?: string | null;

  rentalAreaId: string;
  rentalAreaName: string;
  address: string;
  rentalAreaCoverImageUrl?: string | null;
}

export interface PostResponse {
  postId: string;
  roomId: string;
  userId: string;
  title: string;
  content: string;
  postStatus: PostStatus;
}

export interface AmenityItem {
  amenityId: number;
  amenityName: string;
  iconKey: string;
}

export interface RoomImageResponse {
  roomImageId: string;
  imageUrl: string;
  isCover: boolean;
  sortOrder: number;
}

export interface RoomCopyResponse {
  roomCopyId: string;
  roomCode: string;
  roomCopyStatus: RoomCopyStatus;
}

export interface RoomDetailResponse {
  roomId: string;
  rentalAreaId: string;
  roomName: string;
  description: string;
  price: number;
  roomStatus: RoomStatus;
  capacity: number;
  area: number;
  categoryId: number;
  categoryName: string;
  amenities: AmenityItem[];
  images: RoomImageResponse[];
  roomCopies: RoomCopyResponse[];
}

export interface RentalAreaImageResponse {
  rentalAreaImageId: string;
  imageUrl: string;
  isCover: boolean;
  sortOrder: number;
}

export interface RentalAreaDetailResponse {
  rentalAreaId: string;
  rentalAreaName: string;
  address: string;
  contactName: string;
  contactPhone: string;
  status: string;
  cityId: number;
  cityName: string;
  ownerId: string;
  ownerName: string;
  images: RentalAreaImageResponse[];
  rooms: RoomDetailResponse[];
}

export interface PostDetailResponse {
  postId: string;
  title: string;
  content: string;
  postStatus: PostStatus;
  room: RoomDetailResponse;
  rentalArea: RentalAreaDetailResponse;
}

export interface CreatePostRequest {
  roomId: string;
  title: string;
  content: string;
}

export interface UpdatePostRequest {
  title: string;
  content: string;
}

export interface RentalAreaResponse {
  rentalAreaId: string;
  rentalAreaName: string;
  address: string;
  rentalAreaCoverImageUrl?: string;
}

export interface PostDTOResponse {
  postId: string;
  userId: string;
  ownerName: string;
  ownerPhone: string;
  title: string;
  content: string;
  postStatus: PostStatus;
  rentalArea: RentalAreaResponse;
}

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

export interface PageResponse<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  data: T[];
}

export interface PublicPostQuery {
  page?: number;
  size?: number;
  city?: number;
  categoryId?: number;
  amenityIds?: number[];
  keyword?: string;
  sort?: string;
}


const postsService = {
  createPost: async (
    payload: CreatePostRequest,
  ): Promise<ApiResponse<PostResponse>> => {
    const response = await api.post<ApiResponse<PostResponse>>(
      "/posts",
      payload,
    );
    return response.data;
  },

  getMyPosts: async (
    status?: PostStatus,
  ): Promise<ApiResponse<PostSummaryResponse[]>> => {
    const response = await api.get<ApiResponse<PostSummaryResponse[]>>(
      "/posts/me",
      {
        params: status ? { status } : undefined,
      },
    );
    return response.data;
  },

  getMyPostDetail: async (
    postId: string,
  ): Promise<ApiResponse<PostDetailResponse>> => {
    const response = await api.get<ApiResponse<PostDetailResponse>>(
      `/posts/me/${postId}`,
    );
    return response.data;
  },

  getPublicPostDetail: async (
    postId: string,
  ): Promise<ApiResponse<PostDetailResponse>> => {
    const response = await api.get<ApiResponse<PostDetailResponse>>(
      `/posts/${postId}`,
    );
    return response.data;
  },

  updateMyPost: async (
    postId: string,
    payload: UpdatePostRequest,
  ): Promise<ApiResponse<PostResponse>> => {
    const response = await api.put<ApiResponse<PostResponse>>(
      `/posts/${postId}`,
      payload,
    );
    return response.data;
  },

  updateMyPostStatus: async (
    postId: string,
    status: PostStatus,
  ): Promise<ApiResponse<PostResponse>> => {
    const response = await api.patch<ApiResponse<PostResponse>>(
      `/posts/${postId}/status`,
      null,
      {
        params: { status },
      },
    );
    return response.data;
  },

  deleteMyPost: async (postId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/posts/${postId}`);
    return response.data;
  },

  getAllPosts: async (
    page = 1,
    size = 10,
  ): Promise<ApiResponse<PageResponse<PostDTOResponse>>> => {
    const response = await api.get<ApiResponse<PageResponse<PostDTOResponse>>>(
      "/posts/all/customer",
      {
        params: { page, size },
      },
    );

    return response.data;
  },

  adminGetPosts: async (status?: PostStatus) => {
    const res = await api.get<ApiResponse<PostSummaryResponse[]>>(`/posts/admin`, {
      params: status ? { status } : undefined,
    });
    return res.data;
  },

  adminUpdatePostStatus: async (postId: string, status: PostStatus) => {
    const res = await api.patch<ApiResponse<any>>(
      `/posts/admin/${postId}/status`,
      null,
      { params: { status } },
    );
    return res.data;
  },

  adminDeletePost: async (postId: string) => {
    const res = await api.delete<ApiResponse<void>>(`/posts/admin/${postId}`);
    return res.data;
  },

  getPostIdByRoomId: async (roomId: string) => {
    const res = await api.get(`/posts/detail/${roomId}`);
    return res.data;
  },

  getPublicPosts: async (params: {
  page: number;
  size: number;
  cityId?: number;
  categoryId?: number;
  amenityIds?: number[];
}) => {
  const cleanParams: any = {};
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v) && v.length === 0) return;
    cleanParams[k] = v;
  });

  const res = await api.get<ApiResponse<PageResponse<PostSummaryResponse>>>(
    "/posts",
    {
      params: cleanParams,
      paramsSerializer: {
        serialize: (p) => {
          const sp = new URLSearchParams();
          Object.entries(p).forEach(([k, v]) => {
            if (Array.isArray(v)) v.forEach((x) => sp.append(k, String(x)));
            else sp.append(k, String(v));
          });
          return sp.toString();
        },
      },
    },
  );

  return res.data;
},
};



export default postsService;
