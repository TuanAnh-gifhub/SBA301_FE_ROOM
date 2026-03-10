package org.rent.room.be.repository;

import org.rent.room.be.entity.Review;
import org.rent.room.be.entity.ReviewReply;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ReviewReplyRepository extends JpaRepository<ReviewReply, UUID> {

    /** Kiem tra review da co reply chua (de tra 409 Conflict). */
    boolean existsByReview(Review review);

    /** Lay reply theo review. */
    Optional<ReviewReply> findByReview(Review review);
}