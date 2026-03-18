package org.rent.room.be.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.rent.room.be.base.ApiResponse;
import org.rent.room.be.base.PageResponse;
import org.rent.room.be.constant.ReviewStatus;
import org.rent.room.be.dto.request.review.CreateReviewRequest;
import org.rent.room.be.dto.request.review.ReplyReviewRequest;
import org.rent.room.be.dto.request.review.UpdateReviewRequest;
import org.rent.room.be.dto.response.review.ReviewResponse;
import org.rent.room.be.dto.response.review.ReviewSummaryResponse;
import org.rent.room.be.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RequiredArgsConstructor
@RestController
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/reviews")
@Tag(name = "16. Review")
public class ReviewController {

    ReviewService reviewService;

    // ----------------------------------------------------------------
    // PUBLIC ENDPOINTS (khong can dang nhap)
    // ----------------------------------------------------------------

    @Operation(summary = "Lay danh sach review cua mot rental area")
    @GetMapping("/rental-area/{rentalAreaId}")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getReviews(
            @PathVariable UUID rentalAreaId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer rating,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(required = false) Boolean hasMedia
    ) {
        return ResponseEntity.ok(
                ApiResponse.<PageResponse<ReviewResponse>>builder()
                        .code(200)
                        .message("Lay danh sach review thanh cong")
                        .result(reviewService.getReviews(rentalAreaId, page, size, rating, sort, hasMedia))
                        .build()
        );
    }

    @Operation(summary = "Lay tong hop diem danh gia cua mot rental area")
    @GetMapping("/rental-area/{rentalAreaId}/summary")
    public ResponseEntity<ApiResponse<ReviewSummaryResponse>> getReviewSummary(
            @PathVariable UUID rentalAreaId
    ) {
        return ResponseEntity.ok(
                ApiResponse.<ReviewSummaryResponse>builder()
                        .code(200)
                        .message("Lay tong hop danh gia thanh cong")
                        .result(reviewService.getReviewSummary(rentalAreaId))
                        .build()
        );
    }

    // ----------------------------------------------------------------
    // USER ENDPOINTS (can dang nhap)
    // ----------------------------------------------------------------

    @Operation(summary = "Tao review moi (chi nguoi thue da COMPLETED booking)")
    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @Valid @RequestBody CreateReviewRequest request
    ) {
        ReviewResponse result = reviewService.createReview(request);
        return ResponseEntity.status(201).body(
                ApiResponse.<ReviewResponse>builder()
                        .code(201)
                        .message("Dang review thanh cong")
                        .result(result)
                        .build()
        );
    }

    @Operation(summary = "Sua review (chinh chu, trong 7 ngay)")
    @PatchMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @PathVariable UUID reviewId,
            @Valid @RequestBody UpdateReviewRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.<ReviewResponse>builder()
                        .code(200)
                        .message("Cap nhat review thanh cong")
                        .result(reviewService.updateReview(reviewId, request))
                        .build()
        );
    }

    @Operation(summary = "Xoa review (chinh chu hoac Admin)")
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable UUID reviewId
    ) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .code(200)
                        .message("Xoa review thanh cong")
                        .build()
        );
    }

    @Operation(summary = "Toggle vote 'Huu ich' (bam lan 2 = bo vote)")
    @PostMapping("/{reviewId}/vote")
    public ResponseEntity<ApiResponse<Void>> toggleVote(
            @PathVariable UUID reviewId
    ) {
        reviewService.toggleVote(reviewId);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .code(200)
                        .message("Cap nhat vote thanh cong")
                        .build()
        );
    }

    // ----------------------------------------------------------------
    // OWNER ENDPOINTS (chu phong)
    // ----------------------------------------------------------------

    @Operation(summary = "Chu phong tao phan hoi cho review")
    @PostMapping("/{reviewId}/reply")
    public ResponseEntity<ApiResponse<ReviewResponse>> replyReview(
            @PathVariable UUID reviewId,
            @Valid @RequestBody ReplyReviewRequest request
    ) {
        return ResponseEntity.status(201).body(
                ApiResponse.<ReviewResponse>builder()
                        .code(201)
                        .message("Phan hoi thanh cong")
                        .result(reviewService.replyReview(reviewId, request))
                        .build()
        );
    }

    @Operation(summary = "Chu phong cap nhat phan hoi")
    @PatchMapping("/{reviewId}/reply")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReply(
            @PathVariable UUID reviewId,
            @Valid @RequestBody ReplyReviewRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.<ReviewResponse>builder()
                        .code(200)
                        .message("Cap nhat phan hoi thanh cong")
                        .result(reviewService.updateReply(reviewId, request))
                        .build()
        );
    }

    // ----------------------------------------------------------------
    // ADMIN ENDPOINTS
    // ----------------------------------------------------------------

    @Operation(summary = "[Admin] Doi trang thai review")
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{reviewId}/status")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReviewStatus(
            @PathVariable UUID reviewId,
            @RequestParam ReviewStatus status
    ) {
        return ResponseEntity.ok(
                ApiResponse.<ReviewResponse>builder()
                        .code(200)
                        .message("Cap nhat trang thai review thanh cong")
                        .result(reviewService.updateReviewStatus(reviewId, status))
                        .build()
        );
    }
}