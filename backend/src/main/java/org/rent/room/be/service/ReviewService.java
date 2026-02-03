package org.rent.room.be.service;

import org.rent.room.be.base.PageResponse;
import org.rent.room.be.dto.request.review.ReviewRequest;
import org.rent.room.be.dto.response.review.ReviewResponse;

import java.time.LocalDate;
import java.util.UUID;

public interface ReviewService {
    PageResponse<ReviewResponse> getReviews(int page, int size,
                                            String comment,
                                            Integer rating,
                                            LocalDate startDate,
                                            LocalDate endDate);
    ReviewResponse create(ReviewRequest request);
    void update(UUID reviewId,ReviewRequest request);
    ReviewResponse getReviewById(UUID reviewId);
    void delete(UUID id);

}
