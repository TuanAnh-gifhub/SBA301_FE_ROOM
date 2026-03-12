package org.rent.room.be.serviceImpl;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.rent.room.be.base.PageResponse;
import org.rent.room.be.constant.PostStatus;
import org.rent.room.be.dto.request.post.CreatePostRequest;
import org.rent.room.be.dto.request.post.UpdatePostRequest;
import org.rent.room.be.dto.response.amenity.AmenityResponse;
import org.rent.room.be.dto.response.post.*;
import org.rent.room.be.dto.response.rental_area.RentalAreaImageResponse;
import org.rent.room.be.dto.response.rental_area.RentalAreaResponse;
import org.rent.room.be.dto.response.room.RoomImageResponse;
import org.rent.room.be.dto.response.room.RoomResponse;
import org.rent.room.be.entity.*;
import org.rent.room.be.exception.AppException;
import org.rent.room.be.exception.ErrorCode;
import org.rent.room.be.repository.*;
import org.rent.room.be.service.PostService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.rent.room.be.specification.PostSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;


import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostServiceImpl implements PostService {

    PostRepository postRepository;
    RoomRepository roomRepository;
    UserRepository userRepository;
    RoomImageRepository roomImageRepository;
    RentalAreaImageRepository rentalAreaImageRepository;

    @Override
    @Transactional
    public PostResponse createPost(CreatePostRequest request, UUID currentUserId) {

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new NoSuchElementException("Room not found"));

        RentalArea rentalArea = room.getRentalArea();

        // check owner (owner là rentalArea.owner)
        UUID ownerId = room.getRentalArea().getOwner().getUserId();
        if (ownerId == null || !ownerId.equals(currentUserId)) {
            throw new RuntimeException("Forbidden: not owner of this room");
        }

        // IMPORTANT: 1 room chỉ được 1 post
        if (postRepository.existsByRoom_RoomId(room.getRoomId())) {
            throw new IllegalArgumentException("This room already has a post");
        }

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .postStatus(PostStatus.PENDING)
                .room(room)
                .rentalArea(rentalArea)
                .user(user)
                .build();

        post = postRepository.save(post);

        return PostResponse.builder()
                .postId(post.getPostId())
                .roomId(room.getRoomId())
                .userId(user.getUserId())
                .title(post.getTitle())
                .content(post.getContent())
                .postStatus(post.getPostStatus() != null ? post.getPostStatus().name() : null)
                .build();
    }

    @Override
    public PageResponse<PostDTOResponse> getAllPostsForCustomer(int page, int size, String title, String content, LocalDate fromDate, LocalDate toDate) {
        Pageable pageable = PageRequest.of(page -1, size);
        Specification<Post> spec = PostSpecification.filter(title, content, fromDate, toDate);

        Page<Post> posts = postRepository.findAll(spec, pageable);

        List<PostDTOResponse> data = posts.stream().map(post -> {
            List<RoomResponse> roomResponses = post.getRentalArea().getRoom().stream().map(room -> {
                List<RoomImageResponse> roomImageResponses =  room.getImages().stream().map( img -> RoomImageResponse.builder()
                        .roomImageId(img.getRoomImageId())
                        .imageUrl(img.getImageUrl())
                        .isCover(img.getIsCover())
                        .sortOrder(img.getSortOrder())
                        .build()).toList();

                Set<RoomResponse.AmenityItem> amenityItems = (room.getAmenities() == null ? Set.<Amenity>of() : room.getAmenities())
                        .stream()
                        .map(a -> RoomResponse.AmenityItem.builder()
                                .amenityId(a.getAmenityId())
                                .amenityName(a.getAmenityName())
                                .build())
                        .collect(Collectors.toSet());

                return RoomResponse.builder()
                        .roomId(room.getRoomId())
                        .roomName(room.getRoomName())
                        .price(room.getPrice())
                        .capacity(room.getCapacity())
                        .roomStatus(room.getRoomStatus())
                        .area(room.getArea())
                        .description(room.getDescription())
                        .categoryId(room.getCategory().getCategoryId())
                        .categoryName(room.getCategory().getCategoryName())
                        .images(roomImageResponses)
                        .amenities(amenityItems)
                        .build();
            }).toList();

            RentalAreaResponse rentalAreaResponse = RentalAreaResponse
                    .builder()
                    .rentalAreaId(post.getRentalArea().getRentalAreaId())
                    .rentalAreaName(post.getRentalArea().getRentalAreaName())
                    .cityName(post.getRentalArea().getCity().getCityName())
                    .address(post.getRentalArea().getAddress())
                    .rooms(roomResponses)
                    .build();

            return PostDTOResponse.builder()
                    .postId(post.getPostId())
                    .title(post.getTitle())
                    .content(post.getContent())
                    .postStatus(post.getPostStatus())
                    .rentalArea(rentalAreaResponse)
                    .userId(post.getUser().getUserId())
                    .ownerName(post.getUser().getUserName())
                    .ownerPhone(post.getUser().getPhone())
                    .build();
        }).toList();

        return PageResponse.<PostDTOResponse>builder()
                .currentPage(posts.getNumber() + 1)
                .totalPages(posts.getTotalPages())
                .pageSize(posts.getSize())
                .totalElements(posts.getTotalElements())
                .data(data)
                .build();
    }

    @Override
    public PageResponse<PostSummaryResponse> getPublicFeed(
            int page,
            int size,
            Long cityId,
            Long categoryId,
            List<Long> amenityIds
    ) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 50);

        Pageable pageable = PageRequest.of(safePage - 1, safeSize);

        List<Long> amenityParam =
                (amenityIds == null || amenityIds.isEmpty()) ? null : amenityIds;

        long amenityCount = (amenityParam == null) ? 0L : amenityParam.size();

        Page<Post> postPage = postRepository.findPublicFeed(
                PostStatus.PUBLISHED,
                cityId,
                categoryId,
                amenityParam,
                amenityCount,
                pageable
        );

        List<PostSummaryResponse> data = postPage.getContent()
                .stream()
                .map(this::mapToSummary)
                .toList();

        return PageResponse.<PostSummaryResponse>builder()
                .currentPage(safePage)
                .totalPages(postPage.getTotalPages())
                .pageSize(safeSize)
                .totalElements(postPage.getTotalElements())
                .data(data)
                .build();
    }

    @Override
    public PostDetailResponse getPostDetail(UUID postId) {
        Post post = postRepository
                .findByPostIdAndPostStatus(postId, PostStatus.PUBLISHED)
                .orElseThrow(() -> new NoSuchElementException("Post not found"));

        Room room = post.getRoom();
        RentalArea rentalArea = room != null ? room.getRentalArea() : null;

        RoomResponse roomResponse = room != null ? mapRoomToResponse(room) : null;
        RentalAreaResponse rentalAreaResponse = rentalArea != null ? mapRentalAreaToResponse(rentalArea) : null;

        return PostDetailResponse.builder()
                .postId(post.getPostId())
                .title(post.getTitle())
                .content(post.getContent())
                .postStatus(post.getPostStatus() != null ? post.getPostStatus().name() : null)
                .room(roomResponse)
                .rentalArea(rentalAreaResponse)
                .build();
    }

    // =========================
    // Owner manage
    // =========================

    @Override
    public List<PostSummaryResponse> getMyPosts(UUID currentUserId, String status) {
        List<Post> posts;

        if (status == null || status.isBlank()) {
            posts = postRepository.findByUser_UserIdOrderByCreatedAtDesc(currentUserId);
        } else {
            PostStatus st;
            try {
                st = PostStatus.valueOf(status);
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid post status: " + status);
            }
            posts = postRepository.findByUser_UserIdAndPostStatusOrderByCreatedAtDesc(currentUserId, st);
        }

        posts = posts.stream().filter(p -> p.getPostStatus() != PostStatus.DELETED).toList();

        return posts.stream().map(this::mapToSummary).toList();
    }

    @Override
    public PostDetailResponse getMyPostDetail(UUID postId, UUID currentUserId) {
        Post post = postRepository.findByPostIdAndUser_UserId(postId, currentUserId)
                .orElseThrow(() -> new NoSuchElementException("Post not found"));

        if (post.getPostStatus() == PostStatus.DELETED) {
            throw new NoSuchElementException("Post not found");
        }

        Room room = post.getRoom();
        RentalArea rentalArea = room != null ? room.getRentalArea() : null;

        return PostDetailResponse.builder()
                .postId(post.getPostId())
                .title(post.getTitle())
                .content(post.getContent())
                .postStatus(post.getPostStatus() != null ? post.getPostStatus().name() : null)
                .room(room != null ? mapRoomToResponse(room) : null)
                .rentalArea(rentalArea != null ? mapRentalAreaToResponse(rentalArea) : null)
                .build();
    }

    @Override
    @Transactional
    public PostResponse updateMyPost(UUID postId, UpdatePostRequest request, UUID currentUserId) {
        Post post = postRepository.findByPostIdAndUser_UserId(postId, currentUserId)
                .orElseThrow(() -> new NoSuchElementException("Post not found"));

        if (post.getPostStatus() == PostStatus.DELETED) {
            throw new NoSuchElementException("Post not found");
        }

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());

        // Rule tuỳ business: sửa bài đang PUBLISHED có cần về PENDING để duyệt lại không?
        // Nếu cần duyệt lại:
        // if (post.getPostStatus() == PostStatus.PUBLISHED) post.setPostStatus(PostStatus.PENDING);

        postRepository.save(post);

        return PostResponse.builder()
                .postId(post.getPostId())
                .roomId(post.getRoom() != null ? post.getRoom().getRoomId() : null)
                .userId(post.getUser() != null ? post.getUser().getUserId() : null)
                .title(post.getTitle())
                .content(post.getContent())
                .postStatus(post.getPostStatus() != null ? post.getPostStatus().name() : null)
                .build();
    }

    @Override
    @Transactional
    public PostResponse updateMyPostStatus(UUID postId, String status, UUID currentUserId) {
        Post post = postRepository
                .findByPostIdAndRoom_RentalArea_Owner_UserId(postId, currentUserId)
                .orElseThrow(() -> new NoSuchElementException("Post not found"));

        PostStatus newStatus;
        try {
            newStatus = PostStatus.valueOf(status);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid post status: " + status);
        }

        if (newStatus != PostStatus.PUBLISHED && newStatus != PostStatus.HIDDEN) {
            throw new IllegalArgumentException("User can only switch between PUBLISHED and HIDDEN");
        }

        post.setPostStatus(newStatus);
        postRepository.save(post);

        return PostResponse.builder()
                .postId(post.getPostId())
                .roomId(post.getRoom().getRoomId())
                .userId(post.getUser().getUserId())
                .title(post.getTitle())
                .content(post.getContent())
                .postStatus(post.getPostStatus() != null ? post.getPostStatus().name() : null)
                .build();
    }

    @Override
    @Transactional
    public void deleteMyPost(UUID postId, UUID currentUserId) {
        Post post = postRepository.findByPostIdAndUser_UserId(postId, currentUserId)
                .orElseThrow(() -> new NoSuchElementException("Post not found"));

        // soft delete
        if (post.getPostStatus() == PostStatus.DELETED) return;

        post.setPostStatus(PostStatus.DELETED);
        postRepository.save(post);
    }

    @Override
    public PostResponse getMyPostByRoom(UUID roomId, UUID currentUserId) {
        Post post = postRepository.findByRoom_RoomIdAndUser_UserId(roomId, currentUserId)
                .orElseThrow(() -> new NoSuchElementException("Post not found"));

        if (post.getPostStatus() == PostStatus.DELETED) {
            throw new NoSuchElementException("Post not found");
        }

        return PostResponse.builder()
                .postId(post.getPostId())
                .roomId(post.getRoom() != null ? post.getRoom().getRoomId() : null)
                .userId(post.getUser() != null ? post.getUser().getUserId() : null)
                .title(post.getTitle())
                .content(post.getContent())
                .postStatus(post.getPostStatus() != null ? post.getPostStatus().name() : null)
                .build();
    }



    private PostSummaryResponse mapToSummary(Post post) {
        Room room = post.getRoom();
        RentalArea rentalArea = room != null ? room.getRentalArea() : null;

        String roomCover = null;
        if (room != null) {
            roomCover = roomImageRepository.findByRoom(room).stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsCover()))
                    .findFirst()
                    .map(RoomImage::getImageUrl)
                    .orElse(null);
        }

        String rentalCover = null;
        if (rentalArea != null) {
            rentalCover = rentalAreaImageRepository.findByRentalArea(rentalArea).stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsCover()))
                    .findFirst()
                    .map(RentalAreaImage::getImageUrl)
                    .orElse(null);
        }

        return PostSummaryResponse.builder()
                .postId(post.getPostId())
                .title(post.getTitle())
                .postStatus(post.getPostStatus() != null ? post.getPostStatus().name() : null)
                .roomId(room != null ? room.getRoomId() : null)
                .roomName(room != null ? room.getRoomName() : null)
                .price(room != null ? room.getPrice() : null)
                .capacity(room != null ? room.getCapacity() : null)
                .area(room != null ? room.getArea() : null)
                .roomCoverImageUrl(roomCover)
                .rentalAreaId(rentalArea != null ? rentalArea.getRentalAreaId() : null)
                .rentalAreaName(rentalArea != null ? rentalArea.getRentalAreaName() : null)
                .address(rentalArea != null ? rentalArea.getAddress() : null)
                .rentalAreaCoverImageUrl(rentalCover)
                .build();
    }

    private RoomResponse mapRoomToResponse(Room room) {
        List<RoomImageResponse> imageResponses = roomImageRepository.findByRoom(room)
                .stream()
                .sorted(Comparator.comparing(RoomImage::getSortOrder, Comparator.nullsLast(Integer::compareTo)))
                .map(img -> RoomImageResponse.builder()
                        .roomImageId(img.getRoomImageId())
                        .imageUrl(img.getImageUrl())
                        .isCover(img.getIsCover())
                        .sortOrder(img.getSortOrder())
                        .build())
                .collect(Collectors.toList());

        Set<RoomResponse.AmenityItem> amenityItems = (room.getAmenities() == null ? Set.<Amenity>of() : room.getAmenities())
                .stream()
                .map(a -> RoomResponse.AmenityItem.builder()
                        .amenityId(a.getAmenityId())
                        .amenityName(a.getAmenityName())
                        .iconKey(a.getIconKey())
                        .build())
                .collect(Collectors.toSet());

        Category category = room.getCategory();

        return RoomResponse.builder()
                .roomId(room.getRoomId())
                .rentalAreaId(room.getRentalArea() != null ? room.getRentalArea().getRentalAreaId() : null)
                .roomName(room.getRoomName())
                .description(room.getDescription())
                .price(room.getPrice())
                .roomStatus(room.getRoomStatus() != null ? room.getRoomStatus() : null)
                .capacity(room.getCapacity())
                .area(room.getArea())
                .categoryId(category != null ? category.getCategoryId() : null)
                .categoryName(category != null ? category.getCategoryName() : null)
                .amenities(amenityItems)
                .images(imageResponses)
                .build();
    }

    private RentalAreaResponse mapRentalAreaToResponse(RentalArea rentalArea) {
        List<RentalAreaImageResponse> images = rentalAreaImageRepository.findByRentalArea(rentalArea).stream()
                .sorted(Comparator.comparing(RentalAreaImage::getSortOrder, Comparator.nullsLast(Integer::compareTo)))
                .map(img -> RentalAreaImageResponse.builder()
                        .rentalAreaImageId(img.getRentalAreaImageId())
                        .imageUrl(img.getImageUrl())
                        .isCover(img.getIsCover())
                        .sortOrder(img.getSortOrder())
                        .build())
                .collect(Collectors.toList());

        return RentalAreaResponse.builder()
                .rentalAreaId(rentalArea.getRentalAreaId())
                .rentalAreaName(rentalArea.getRentalAreaName())
                .address(rentalArea.getAddress())
                .contactName(rentalArea.getContactName())
                .contactPhone(rentalArea.getContactPhone())
                .status(rentalArea.getStatus() != null ? rentalArea.getStatus().name() : null)
                .images(images)
                .build();
    }

    @Override
    public List<PostSummaryResponse> adminGetPosts(String status) {
        List<Post> posts;

        if (status == null || status.isBlank()) {
            posts = postRepository.findAllByPostStatusIn(
                    List.of(PostStatus.PENDING, PostStatus.PUBLISHED, PostStatus.HIDDEN)
            );
        } else {
            PostStatus s = PostStatus.valueOf(status.trim().toUpperCase());
            if (s != PostStatus.PENDING && s != PostStatus.PUBLISHED && s != PostStatus.HIDDEN) {
                throw new IllegalArgumentException("Invalid status filter");
            }
            posts = postRepository.findAllByPostStatus(s);
        }

        return posts.stream().map(this::mapToSummary).toList();
    }

    @Override
    @Transactional
    public PostResponse adminUpdatePostStatus(UUID postId, String status) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("Post not found"));

        PostStatus next = PostStatus.valueOf(status.trim().toUpperCase());

        if (next != PostStatus.PENDING && next != PostStatus.PUBLISHED && next != PostStatus.HIDDEN) {
            throw new IllegalArgumentException("Status not allowed");
        }

        post.setPostStatus(next);
        post = postRepository.save(post);

        return PostResponse.builder()
                .postId(post.getPostId())
                .roomId(post.getRoom() != null ? post.getRoom().getRoomId() : null)
                .userId(post.getUser() != null ? post.getUser().getUserId() : null)
                .title(post.getTitle())
                .content(post.getContent())
                .postStatus(post.getPostStatus() != null ? post.getPostStatus().name() : null)
                .build();
    }

    @Override
    @Transactional
    public void adminDeletePost(UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("Post not found"));
         post.setPostStatus(PostStatus.DELETED);
         postRepository.save(post);
    }

    @Override
    public PostIdResponse getPostIdByRoomId(UUID roomId) {
        UUID post = postRepository.findPostIdByRoomId(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        return PostIdResponse.builder()
                .postId(post)
                .build();
    }
}
