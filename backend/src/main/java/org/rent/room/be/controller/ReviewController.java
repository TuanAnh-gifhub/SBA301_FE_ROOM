package org.rent.room.be.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.rent.room.be.base.ApiResponse;
import org.rent.room.be.base.PageResponse;
import org.rent.room.be.dto.request.review.ReviewRequest;
import org.rent.room.be.dto.response.review.ReviewResponse;
import org.rent.room.be.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/reviews")
@Tag(name = "4. Report")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    public ApiResponse<ReviewResponse> create(@Valid @RequestBody ReviewRequest request) {
        try {
            return ApiResponse.success(200,
                            "Create review successfully",
                            reviewService.create(request));
        } catch (Exception e) {
            return ApiResponse.error(500, "Create review failed");
        }
    }

    @GetMapping
    public ApiResponse<PageResponse<ReviewResponse>> getAllReviews(
            @RequestParam(defaultValue = "1", required = false) int page,
            @RequestParam(defaultValue = "10", required = false) int size,
            @RequestParam(required = false)String comment,
            @RequestParam(required = false)Integer rating,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDate fromDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDate toDate

    ) {
        try {
            return ApiResponse.success(200,
                    "Get all reviews successfully",
                    reviewService.getReviews(page,size,comment,rating,fromDate,toDate)
            );
        } catch (Exception e) {
            return ApiResponse.error(500, "Get all reviews failed");
        }
    }

    @GetMapping("/{reviewId}")
    public ApiResponse<ReviewResponse> getReview(@PathVariable UUID reviewId) {
        try {
            return ApiResponse.success(200,
                    "Get all reviews successfully",
                    reviewService.getReviewById(reviewId)
            );
        } catch (Exception e) {
            return ApiResponse.error(500, "Get review failed");
        }
    }

    @PutMapping
    public ApiResponse<?> updateReview(@PathVariable UUID reviewId,@Valid @RequestBody ReviewRequest request) {
        try {
            reviewService.update(reviewId, request);
            return ApiResponse.success(200,
                    "Update review successfully",null
            );
        } catch (Exception e) {
            return ApiResponse.error(500, "Get review failed");
        }
    }

    @DeleteMapping
    public ApiResponse<?> deleteReview(@PathVariable UUID reviewId) {
        try {
            reviewService.delete(reviewId);
            return ApiResponse.success(200,
                    "Delete review successfully",null
            );
        } catch (Exception e) {
            return ApiResponse.error(500, "Get review failed");
        }
    }

    @GetMapping("/{rentalId}/reviews")
    public ApiResponse<PageResponse<ReviewResponse>> getReviewsByRentalId(@PathVariable UUID rentalId) {
        try{
            reviewService.getReviewsByRentalAreaId(rentalId);
            return ApiResponse.success(200,"Get all review from area",null);
        }catch (Exception e){
            return ApiResponse.error(500, "Get all review failed");
        }
    }

    ///rentals/{id}/rating-summary
    @GetMapping("/rentals/{id}/rating-summary")
    public ApiResponse<?>getRatingSummary(@PathVariable UUID id) {
        try {
            return ApiResponse.success(200, "Get rating summary successfully", reviewService.getReviewsByRentalAreaId(id));
        } catch (Exception e) {
            return ApiResponse.error(500, "Get rating summary failed");
        }
    }
}
