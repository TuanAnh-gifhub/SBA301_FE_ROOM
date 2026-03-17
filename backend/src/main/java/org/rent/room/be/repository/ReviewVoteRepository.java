package org.rent.room.be.repository;

import org.rent.room.be.entity.Review;
import org.rent.room.be.entity.ReviewVote;
import org.rent.room.be.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReviewVoteRepository extends JpaRepository<ReviewVote, UUID> {

    /** Kiem tra user da vote review nay chua. */
    boolean existsByReviewAndUser(Review review, User user);

    /** Lay vote de xoa (bo vote). */
    Optional<ReviewVote> findByReviewAndUser(Review review, User user);

    /**
     * Lay tat ca reviewId ma user da vote trong 1 danh sach.
     * Dung de set hasVoted cho tung ReviewResponse khi lay danh sach
     * -> chi can 1 query thay vi N query cho N review.
     */
    @org.springframework.data.jpa.repository.Query("""
            SELECT v.review.reviewId FROM ReviewVote v
            WHERE v.review IN :reviews AND v.user = :user
            """)
    List<UUID> findVotedReviewIds(
            @org.springframework.data.repository.query.Param("reviews") List<Review> reviews,
            @org.springframework.data.repository.query.Param("user") User user
    );
}