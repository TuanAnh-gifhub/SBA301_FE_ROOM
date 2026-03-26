package org.rent.room.be.serviceImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.rent.room.be.base.PageResponse;
import org.rent.room.be.constant.BookingStatus;
import org.rent.room.be.constant.MediaType;
import org.rent.room.be.constant.ReviewStatus;
import org.rent.room.be.constant.ReviewTagConstant;
import org.rent.room.be.dto.request.review.CreateReviewRequest;
import org.rent.room.be.dto.request.review.ReplyReviewRequest;
import org.rent.room.be.dto.request.review.UpdateReviewRequest;
import org.rent.room.be.dto.response.review.ReviewResponse;
import org.rent.room.be.dto.response.review.ReviewSummaryResponse;
import org.rent.room.be.entity.*;
import org.rent.room.be.exception.AppException;
import org.rent.room.be.exception.ErrorCode;
import org.rent.room.be.mapper.ReviewMapper;
import org.rent.room.be.repository.*;
import org.rent.room.be.service.ReviewService;
import org.rent.room.be.service.UserService;
import org.rent.room.be.specification.ReviewSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewVoteRepository reviewVoteRepository;
    private final ReviewReplyRepository reviewReplyRepository;
    private final BookingRepository bookingRepository;
    private final RentalAreaRepository rentalAreaRepository;
    private final UserService userService;
    private final ReviewMapper reviewMapper;

    // ================================================================
    // CREATE REVIEW
    // ================================================================

    @Override
    @Transactional
    public ReviewResponse createReview(CreateReviewRequest request) {
        User reviewer = userService.getCurrentUserEntity();

        // 1. Tim booking va kiem tra quyen
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        validateBookingForReview(booking, reviewer);

        // 2. Kiem tra booking nay da duoc review chua
        if (reviewRepository.existsByBookingAndDeletedAtIsNull(booking)) {
            throw new AppException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }

        // 3. Validate tags
        validateTags(request.getTags());

        // 4. Quyet dinh status dua vao profanity filter
        ReviewStatus status = checkProfanity(request.getComment())
                ? ReviewStatus.PENDING_MODERATION
                : ReviewStatus.APPROVED;

        // 5. Build Review entity
        Review review = Review.builder()
                .reviewer(reviewer)
                .booking(booking)
                .rentalArea(booking.getRentalArea())
                .rating(request.getRating())
                .comment(request.getComment())
                .status(status)
                .helpfulCount(0)
                .build();

        // 6. Them tags
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            List<ReviewTag> tags = request.getTags().stream()
                    .map(tagName -> ReviewTag.builder()
                            .review(review)
                            .tagName(tagName)
                            .build())
                    .collect(Collectors.toList());
            review.getTags().addAll(tags);
        }

        // 7. Them media
        if (request.getMediaUrls() != null && !request.getMediaUrls().isEmpty()) {
            List<ReviewMedia> mediaList = buildMediaList(review, request.getMediaUrls());
            review.getMediaList().addAll(mediaList);
        }

        Review saved = reviewRepository.save(review);

        // 8. Cap nhat stats cua RentalArea neu review duoc duyet
        if (status == ReviewStatus.APPROVED) {
            updateRentalAreaStats(booking.getRentalArea());
        }

        log.info("Review created: reviewId={}, bookingId={}, status={}",
                saved.getReviewId(), booking.getBookingId(), status);

        ReviewResponse response = reviewMapper.toResponse(saved);
        response.setCanEdit(true); // Vua tao -> con trong 7 ngay
        return response;
    }

    // ================================================================
    // GET REVIEWS (DANH SACH)
    // ================================================================

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getReviews(
            UUID rentalAreaId,
            int page,
            int size,
            Integer rating,
            String sort,
            Boolean hasMedia
    ) {
        // Gioi han size toi da 50
        int safeSize = Math.min(size, 50);
        Pageable pageable = PageRequest.of(page - 1, safeSize, buildSort(sort));

        var spec = ReviewSpecification.filterForRentalArea(rentalAreaId, rating, hasMedia);
        Page<Review> pageData = reviewRepository.findAll(spec, pageable);

        List<Review> reviews = pageData.getContent();

        // Lay voted review IDs cua current user (1 query cho ca page)
        Set<UUID> votedIds = getVotedReviewIds(reviews);

        // Lay current user de check canEdit
        User currentUser = getCurrentUserSafely();

        // Map -> response va set hasVoted, canEdit
        List<ReviewResponse> responses = reviews.stream()
                .map(review -> {
                    ReviewResponse response = reviewMapper.toResponse(review);
                    response.setHasVoted(votedIds.contains(review.getReviewId()));
                    response.setCanEdit(canUserEdit(review, currentUser));
                    return response;
                })
                .toList();

        return PageResponse.<ReviewResponse>builder()
                .currentPage(page)
                .totalPages(pageData.getTotalPages())
                .pageSize(safeSize)
                .totalElements(pageData.getTotalElements())
                .data(responses)
                .build();
    }

    // ================================================================
    // GET SUMMARY
    // ================================================================

    @Override
    @Transactional(readOnly = true)
    public ReviewSummaryResponse getReviewSummary(UUID rentalAreaId) {
        RentalArea rentalArea = rentalAreaRepository.findById(rentalAreaId)
                .orElseThrow(() -> new AppException(ErrorCode.RENTAL_AREA_NOT_FOUND));

        // Lay phan bo sao tu DB
        List<Object[]> rawDist = reviewRepository.countByRatingForRentalArea(rentalArea);

        // Build map: star -> count
        Map<Integer, Long> countByStar = new HashMap<>();
        for (Object[] row : rawDist) {
            countByStar.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());
        }

        long total = rentalArea.getTotalReviews() == null ? 0 : rentalArea.getTotalReviews();

        // Build distribution cho tat ca 5 muc sao (ke ca muc = 0)
        List<ReviewSummaryResponse.StarDistribution> distribution = new ArrayList<>();
        for (int star = 5; star >= 1; star--) {
            long count = countByStar.getOrDefault(star, 0L);
            double percentage = total > 0 ? (count * 100.0 / total) : 0.0;
            distribution.add(ReviewSummaryResponse.StarDistribution.builder()
                    .star(star)
                    .count(count)
                    .percentage(Math.round(percentage * 10.0) / 10.0) // 1 chu so thap phan
                    .build());
        }

        return ReviewSummaryResponse.builder()
                .averageRating(rentalArea.getAverageRating())
                .totalReviews((int) total)
                .distribution(distribution)
                .build();
    }

    // ================================================================
    // UPDATE REVIEW
    // ================================================================

    @Override
    @Transactional
    public ReviewResponse updateReview(UUID reviewId, UpdateReviewRequest request) {
        User currentUser = userService.getCurrentUserEntity();
        Review review = findActiveReviewById(reviewId);

        // Kiem tra quyen: phai la chinh chu
        if (!review.getReviewer().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.REVIEW_NOT_OWNER);
        }

        // Kiem tra con trong thoi han 7 ngay
        if (review.getCreatedAt().isBefore(LocalDateTime.now().minusDays(ReviewTagConstant.EDIT_WINDOW_DAYS))) {
            throw new AppException(ErrorCode.REVIEW_EDIT_EXPIRED);
        }

        // Cap nhat cac field neu co gia tri moi
        if (request.getRating() != null) {
            review.setRating(request.getRating());
        }

        // Comment: null = giu nguyen, empty string = xoa comment
        if (request.getComment() != null) {
            review.setComment(request.getComment().isBlank() ? null : request.getComment());
            // Kiem tra profanity lai neu thay doi comment
            if (checkProfanity(request.getComment())) {
                review.setStatus(ReviewStatus.PENDING_MODERATION);
            }
        }

        // Tags: null = giu nguyen, empty list = xoa het tags
        if (request.getTags() != null) {
            validateTags(request.getTags());
            review.getTags().clear();
            request.getTags().forEach(tagName ->
                    review.getTags().add(ReviewTag.builder()
                            .review(review)
                            .tagName(tagName)
                            .build()));
        }

        // Media: null = giu nguyen, empty list = xoa het media
        if (request.getMediaUrls() != null) {
            review.getMediaList().clear();
            if (!request.getMediaUrls().isEmpty()) {
                review.getMediaList().addAll(buildMediaList(review, request.getMediaUrls()));
            }
        }

        Review saved = reviewRepository.save(review);

        // Neu rating thay doi va review dang APPROVED -> cap nhat stats
        if (request.getRating() != null && saved.getStatus() == ReviewStatus.APPROVED) {
            updateRentalAreaStats(review.getRentalArea());
        }

        ReviewResponse response = reviewMapper.toResponse(saved);
        response.setCanEdit(true);
        response.setHasVoted(reviewVoteRepository.existsByReviewAndUser(saved, currentUser));
        return response;
    }

    // ================================================================
    // DELETE REVIEW (SOFT DELETE)
    // ================================================================

    @Override
    @Transactional
    public void deleteReview(UUID reviewId) {
        User currentUser = userService.getCurrentUserEntity();
        Review review = findActiveReviewById(reviewId);

        boolean isOwner = review.getReviewer().getUserId().equals(currentUser.getUserId());
        boolean isAdmin = currentUser.getRole() != null
                && "ADMIN".equals(currentUser.getRole().getRoleName());

        if (!isOwner && !isAdmin) {
            throw new AppException(ErrorCode.REVIEW_NOT_OWNER);
        }

        review.setDeletedAt(LocalDateTime.now());
        reviewRepository.save(review);

        // Cap nhat lai stats sau khi xoa
        if (review.getStatus() == ReviewStatus.APPROVED) {
            updateRentalAreaStats(review.getRentalArea());
        }

        log.info("Review soft-deleted: reviewId={}, deletedBy={}",
                reviewId, currentUser.getUserId());
    }

    // ================================================================
    // TOGGLE VOTE "HUU ICH"
    // ================================================================

    @Override
    @Transactional
    public void toggleVote(UUID reviewId) {
        User currentUser = userService.getCurrentUserEntity();
        Review review = findActiveReviewById(reviewId);

        // Khong the vote review cua chinh minh
        if (review.getReviewer().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.CANNOT_VOTE_OWN_REVIEW);
        }

        Optional<ReviewVote> existingVote = reviewVoteRepository.findByReviewAndUser(review, currentUser);

        if (existingVote.isPresent()) {
            // Da vote roi -> bo vote
            reviewVoteRepository.delete(existingVote.get());
            review.setHelpfulCount(Math.max(0, review.getHelpfulCount() - 1));
        } else {
            // Chua vote -> them vote
            ReviewVote vote = ReviewVote.builder()
                    .review(review)
                    .user(currentUser)
                    .build();
            reviewVoteRepository.save(vote);
            review.setHelpfulCount(review.getHelpfulCount() + 1);
        }

        reviewRepository.save(review);
    }

    // ================================================================
    // REPLY CUA CHU PHONG
    // ================================================================

    @Override
    @Transactional
    public ReviewResponse replyReview(UUID reviewId, ReplyReviewRequest request) {
        User currentUser = userService.getCurrentUserEntity();
        Review review = findActiveReviewById(reviewId);

        // Chi owner cua rental area moi duoc reply
        validateIsRentalAreaOwner(review.getRentalArea(), currentUser);

        // Moi review chi co 1 reply
        if (reviewReplyRepository.existsByReview(review)) {
            throw new AppException(ErrorCode.REPLY_ALREADY_EXISTS);
        }

        ReviewReply reply = ReviewReply.builder()
                .review(review)
                .owner(currentUser)
                .content(request.getContent())
                .build();

        reviewReplyRepository.save(reply);
        review.setReply(reply);

        return reviewMapper.toResponse(review);
    }

    @Override
    @Transactional
    public ReviewResponse updateReply(UUID reviewId, ReplyReviewRequest request) {
        User currentUser = userService.getCurrentUserEntity();
        Review review = findActiveReviewById(reviewId);

        validateIsRentalAreaOwner(review.getRentalArea(), currentUser);

        ReviewReply reply = reviewReplyRepository.findByReview(review)
                .orElseThrow(() -> new AppException(ErrorCode.REPLY_NOT_FOUND));

        reply.setContent(request.getContent());
        reviewReplyRepository.save(reply);
        review.setReply(reply);

        return reviewMapper.toResponse(review);
    }

    // ================================================================
    // ADMIN: DOI STATUS
    // ================================================================

    @Override
    @Transactional
    public ReviewResponse updateReviewStatus(UUID reviewId, ReviewStatus newStatus) {
        Review review = reviewRepository.findActiveById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        ReviewStatus oldStatus = review.getStatus();
        review.setStatus(newStatus);
        Review saved = reviewRepository.save(review);

        // Cap nhat stats neu chuyen tu/sang APPROVED
        boolean wasApproved = oldStatus == ReviewStatus.APPROVED;
        boolean nowApproved = newStatus == ReviewStatus.APPROVED;
        if (wasApproved != nowApproved) {
            updateRentalAreaStats(review.getRentalArea());
        }

        log.info("Review status changed: reviewId={}, {} -> {}", reviewId, oldStatus, newStatus);
        return reviewMapper.toResponse(saved);
    }

    // ================================================================
    // PRIVATE HELPERS
    // ================================================================

    private Review findActiveReviewById(UUID reviewId) {
        return reviewRepository.findActiveById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));
    }

    private void validateBookingForReview(Booking booking, User reviewer) {
        // Booking phai thuoc ve nguoi dang dang nhap
        if (!booking.getRenter().getUserId().equals(reviewer.getUserId())) {
            throw new AppException(ErrorCode.BOOKING_NOT_BELONG_TO_USER);
        }
        // Booking phai co trang thai COMPLETED
        if (booking.getBookingStatus() != BookingStatus.COMPLETED) {
            throw new AppException(ErrorCode.BOOKING_NOT_COMPLETED);
        }
    }

    private void validateTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) return;
        for (String tag : tags) {
            if (!ReviewTagConstant.VALID_TAGS.contains(tag)) {
                throw new AppException(ErrorCode.INVALID_TAG);
            }
        }
    }

    private void validateIsRentalAreaOwner(RentalArea rentalArea, User user) {
        if (rentalArea.getOwner() == null
                || !rentalArea.getOwner().getUserId().equals(user.getUserId())) {
            throw new AppException(ErrorCode.REPLY_NOT_OWNER);
        }
    }

    /**
     * Kiem tra co tu ngu khong phu hop khong.
     * TODO: Tich hop thu vien profanity filter thuc su (vd: bad-words + custom blacklist tieng Viet).
     * Hien tai dung placeholder don gian.
     */
    private boolean checkProfanity(String text) {
        if (text == null || text.isBlank()) return false;
        // Placeholder - thay bang thu vien thuc su sau
        List<String> blacklist = List.of("từ_cấm_1", "từ_cấm_2");
        String lower = text.toLowerCase();
        return blacklist.stream().anyMatch(lower::contains);
    }

    /**
     * Cap nhat average_rating va total_reviews tren RentalArea.
     * Goi sau moi su kien: create/delete/status change.
     *
     * Luu y: Trong moi truong load cao nen chuyen sang Message Queue
     * (buoc 10 trong ke hoach implementation). Hien tai goi truc tiep.
     */
    private void updateRentalAreaStats(RentalArea rentalArea) {
        long count = reviewRepository.countApprovedByRentalArea(rentalArea);
        Double avg = reviewRepository.avgRatingByRentalArea(rentalArea);

        rentalArea.setTotalReviews((int) count);
        rentalArea.setAverageRating(
                avg != null
                        ? BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP)
                        : null
        );
        rentalAreaRepository.save(rentalArea);
    }

    /**
     * Lay set cac reviewId ma current user da vote trong list reviews.
     * Chi thuc hien 1 query DB cho ca page.
     */
    private Set<UUID> getVotedReviewIds(List<Review> reviews) {
        if (reviews.isEmpty()) return Set.of();
        try {
            User currentUser = userService.getCurrentUserEntity();
            return new HashSet<>(reviewVoteRepository.findVotedReviewIds(reviews, currentUser));
        } catch (AppException e) {
            // Chua dang nhap hoac token khong hop le -> khong co vote nao
            return Set.of();
        }
    }

    /**
     * Lay current user an toan (khong throw exception neu chua dang nhap).
     * Dung cho getReviews de check canEdit.
     */
    private User getCurrentUserSafely() {
        try {
            return userService.getCurrentUserEntity();
        } catch (AppException e) {
            return null;
        }
    }

    /**
     * Kiem tra user co the sua review nay khong:
     * phai la chinh chu VA con trong vong 7 ngay ke tu tao.
     */
    private boolean canUserEdit(Review review, User user) {
        if (user == null) return false;
        boolean isOwner = review.getReviewer().getUserId().equals(user.getUserId());
        boolean withinWindow = review.getCreatedAt()
                .isAfter(LocalDateTime.now().minusDays(ReviewTagConstant.EDIT_WINDOW_DAYS));
        return isOwner && withinWindow;
    }

    /**
     * Build Sort object tu sort string cua FE.
     * Cac gia tri hop le: newest | oldest | highest | lowest | most_helpful
     */
    private Sort buildSort(String sort) {
        if (sort == null) return Sort.by("createdAt").descending();
        return switch (sort.toLowerCase()) {
            case "oldest"      -> Sort.by("createdAt").ascending();
            case "highest"     -> Sort.by("rating").descending().and(Sort.by("createdAt").descending());
            case "lowest"      -> Sort.by("rating").ascending().and(Sort.by("createdAt").descending());
            case "most_helpful"-> Sort.by("helpfulCount").descending().and(Sort.by("createdAt").descending());
            default            -> Sort.by("createdAt").descending(); // newest
        };
    }

    /**
     * Build danh sach ReviewMedia tu list URL.
     * Phan loai IMAGE/VIDEO dua vao extension cua URL.
     */
    private List<ReviewMedia> buildMediaList(Review review, List<String> urls) {
        List<ReviewMedia> result = new ArrayList<>();
        for (int i = 0; i < urls.size(); i++) {
            String url = urls.get(i);
            result.add(ReviewMedia.builder()
                    .review(review)
                    .url(url)
                    .mediaType(detectMediaType(url))
                    .displayOrder(i)
                    .build());
        }
        return result;
    }

    private MediaType detectMediaType(String url) {
        if (url == null) return MediaType.IMAGE;
        String lower = url.toLowerCase();
        return lower.endsWith(".mp4") || lower.endsWith(".mov") || lower.endsWith(".webm")
                ? MediaType.VIDEO
                : MediaType.IMAGE;
    }

    @Override
    public PageResponse<ReviewResponse> getAllReviewsForAdmin(int page, int size, String sort) {
        // 1. Cấu hình sắp xếp (dựa vào trường createdAt ở BaseEntity)
        Sort sortObj = sort.equalsIgnoreCase("oldest") ?
                Sort.by("createdAt").ascending() :
                Sort.by("createdAt").descending();

        // 2. Cấu hình phân trang (Spring Boot mặc định page bắt đầu từ 0)
        Pageable pageable = PageRequest.of(page - 1, size, sortObj);

        // 3. Query toàn bộ trong Database
        Page<Review> reviewPage = reviewRepository.findAll(pageable);

        // 4. Map từ Entity (Review) sang DTO (ReviewResponse)
        List<ReviewResponse> reviewResponses = reviewPage.getContent().stream()
                .map(review -> {
                    // Map thông tin người dùng (ReviewerInfo)
                    ReviewResponse.ReviewerInfo reviewerInfo = null;
                    if (review.getReviewer() != null) {
                        reviewerInfo = ReviewResponse.ReviewerInfo.builder()
                                .userId(review.getReviewer().getUserId())
                                // LƯU Ý: Sửa lại getFullName() cho khớp với hàm lấy tên trong Entity User của bạn
                                .userName(review.getReviewer().getUserName())
                                .build();
                    }

                    // Build DTO chính
                    return ReviewResponse.builder()
                            .reviewId(review.getReviewId())
                            .reviewer(reviewerInfo)
                            .rating(review.getRating())
                            .comment(review.getComment()) // Entity dùng "comment"
                            .status(review.getStatus())   // Trực tiếp dùng Enum ReviewStatus
                            .helpfulCount(review.getHelpfulCount())
                            .createdAt(review.getCreatedAt())
                            .updatedAt(review.getUpdatedAt())
                            // Các trường dưới đây cho Admin quản lý nhanh thì không cần map để tránh nặng query (Lazy Loading)
                            // Nếu cần hiển thị ảnh/tags ở trang Admin thì mới map tiếp nhé.
                            .hasVoted(false)
                            .canEdit(false)
                            .build();
                })
                .collect(Collectors.toList());

        // 5. Trả về format PageResponse
        return PageResponse.<ReviewResponse>builder()
                .currentPage(page)
                .totalPages(reviewPage.getTotalPages())
                .pageSize(size)
                .totalElements(reviewPage.getTotalElements())
                .data(reviewResponses)
                .build();
    }
}