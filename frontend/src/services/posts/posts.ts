import api from "../../config/axios";

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export type PostStatus = "PENDING" | "PUBLISHED" | "HIDDEN" | "DELETED" | string;

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

export interface PostDetailResponse {
  postId: string;
  title: string;
  content: string;
  postStatus: PostStatus;

  room?: any; 
  rentalArea?: any;
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
  createPost: async (payload: CreatePostRequest): Promise<ApiResponse<PostResponse>> => {
    const response = await api.post<ApiResponse<PostResponse>>("/posts", payload);
    return response.data;
  },

  getMyPosts: async (status?: PostStatus): Promise<ApiResponse<PostSummaryResponse[]>> => {
    const response = await api.get<ApiResponse<PostSummaryResponse[]>>("/posts/me", {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  getMyPostDetail: async (postId: string): Promise<ApiResponse<PostDetailResponse>> => {
    const response = await api.get<ApiResponse<PostDetailResponse>>(`/posts/me/${postId}`);
    return response.data;
  },

  updateMyPost: async (postId: string, payload: UpdatePostRequest): Promise<ApiResponse<PostResponse>> => {
    const response = await api.put<ApiResponse<PostResponse>>(`/posts/${postId}`, payload);
    return response.data;
  },

  updateMyPostStatus: async (postId: string, status: PostStatus): Promise<ApiResponse<PostResponse>> => {
    const response = await api.patch<ApiResponse<PostResponse>>(`/posts/${postId}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  deleteMyPost: async (postId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/posts/${postId}`);
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
