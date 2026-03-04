package org.rent.room.be.service;

import org.rent.room.be.base.PageResponse;
import org.rent.room.be.dto.request.post.CreatePostRequest;
import org.rent.room.be.dto.request.post.UpdatePostRequest;
import org.rent.room.be.dto.response.post.PostDetailResponse;
import org.rent.room.be.dto.response.post.PostResponse;
import org.rent.room.be.dto.response.post.PostSummaryResponse;

import java.util.List;
import java.util.UUID;

public interface PostService {

    PostResponse createPost(CreatePostRequest request, UUID currentUserId);

    // public
    PageResponse<PostSummaryResponse> getPublicFeed(
            int page,
            int size,
            Long cityId,
            Long categoryId,
            List<Long> amenityIds
    );

    PostDetailResponse getPostDetail(UUID postId);

    // for owner manage
    List<PostSummaryResponse> getMyPosts(UUID currentUserId, String status);

    PostDetailResponse getMyPostDetail(UUID postId, UUID currentUserId);

    PostResponse updateMyPost(UUID postId, UpdatePostRequest request, UUID currentUserId);

    PostResponse updateMyPostStatus(UUID postId, String status, UUID currentUserId);

    void deleteMyPost(UUID postId, UUID currentUserId);

    // check theo room
    PostResponse getMyPostByRoom(UUID roomId, UUID currentUserId);

    // Admin
    List<PostSummaryResponse> adminGetPosts(String status);
    PostResponse adminUpdatePostStatus(UUID postId, String status);
    void adminDeletePost(UUID postId);
}
