package org.rent.room.be.service;

import org.rent.room.be.base.PageResponse;
import org.rent.room.be.constant.ReviewStatus;
import org.rent.room.be.dto.request.review.CreateReviewRequest;
import org.rent.room.be.dto.request.review.ReplyReviewRequest;
import org.rent.room.be.dto.request.review.UpdateReviewRequest;
import org.rent.room.be.dto.response.review.ReviewResponse;
import org.rent.room.be.dto.response.review.ReviewSummaryResponse;

import java.util.UUID;

public interface ReviewService {

    /**
     * Tao review moi. Chi nguoi thue da COMPLETED booking moi duoc goi.
     * Moi booking chi duoc review 1 lan.
     */
    ReviewResponse createReview(CreateReviewRequest request);

    /**
     * Lay danh sach review cua 1 rental area (co phan trang + filter).
     *
     * @param rentalAreaId  ID cua rental area
     * @param page          trang (bat dau tu 1 - FE truyen vao)
     * @param size          so phan tu moi trang (mac dinh 10, max 50)
     * @param rating        loc theo so sao (null = tat ca)
     * @param sort          newest | oldest | highest | lowest | most_helpful
     * @param hasMedia      true = chi lay review co anh/video
     */
    PageResponse<ReviewResponse> getReviews(
            UUID rentalAreaId,
            int page,
            int size,
            Integer rating,
            String sort,
            Boolean hasMedia
    );

    /**
     * Lay tong hop diem danh gia cua 1 rental area:
     * diem trung binh, tong so luot, phan bo theo tung muc sao.
     */
    ReviewSummaryResponse getReviewSummary(UUID rentalAreaId);

    /**
     * Sua review. Chi chinh chu review va con trong 7 ngay ke tu ngay tao.
     */
    ReviewResponse updateReview(UUID reviewId, UpdateReviewRequest request);

    /**
     * Xoa review (soft delete). Chinh chu review hoac Admin.
     */
    void deleteReview(UUID reviewId);

    /**
     * Toggle vote "Huu ich":
     * - Chua vote -> them vote, tang helpfulCount
     * - Da vote roi -> xoa vote, giam helpfulCount
     * Khong the vote review cua chinh minh.
     */
    void toggleVote(UUID reviewId);

    /**
     * Chu phong tao phan hoi cho review.
     * Moi review chi co 1 reply. Chi owner cua rental area moi goi duoc.
     */
    ReviewResponse replyReview(UUID reviewId, ReplyReviewRequest request);

    /**
     * Chu phong cap nhat noi dung phan hoi da tao.
     */
    ReviewResponse updateReply(UUID reviewId, ReplyReviewRequest request);

    /**
     * Admin doi trang thai review (APPROVED / REJECTED / HIDDEN).
     */
    ReviewResponse updateReviewStatus(UUID reviewId, ReviewStatus status);

    PageResponse<ReviewResponse> getAllReviewsForAdmin(int page, int size, String sort);
}