package org.rent.room.be.repository;

import org.rent.room.be.constant.ReviewStatus;
import org.rent.room.be.entity.Booking;
import org.rent.room.be.entity.RentalArea;
import org.rent.room.be.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID>,
        JpaSpecificationExecutor<Review> {

    /** Kiem tra booking nay da co review chua (de tra 409 Conflict ro rang). */
    boolean existsByBookingAndDeletedAtIsNull(Booking booking);

    /**
     * Lay review theo id, chi lay neu chua bi soft delete.
     * Dung cho tat ca operation (sua, xoa, vote, reply).
     */
    @Query("""
            SELECT r FROM Review r
            LEFT JOIN FETCH r.reviewer
            LEFT JOIN FETCH r.rentalArea
            LEFT JOIN FETCH r.tags
            LEFT JOIN FETCH r.mediaList
            LEFT JOIN FETCH r.reply rp
            LEFT JOIN FETCH rp.owner
            WHERE r.reviewId = :id AND r.deletedAt IS NULL
            """)
    Optional<Review> findActiveById(@Param("id") UUID id);

    /**
     * Lay danh sach review cho trang rental area (co phan trang).
     * Chi lay APPROVED va chua xoa.
     * FetchType.LAZY nen phai LEFT JOIN FETCH de tranh N+1 query.
     */
    @Query(value = """
            SELECT DISTINCT r FROM Review r
            LEFT JOIN FETCH r.reviewer
            LEFT JOIN FETCH r.tags
            LEFT JOIN FETCH r.reply rp
            LEFT JOIN FETCH rp.owner
            WHERE r.rentalArea = :rentalArea
              AND r.status = :status
              AND r.deletedAt IS NULL
            """,
            countQuery = """
            SELECT COUNT(r) FROM Review r
            WHERE r.rentalArea = :rentalArea
              AND r.status = :status
              AND r.deletedAt IS NULL
            """)
    Page<Review> findByRentalAreaAndStatus(
            @Param("rentalArea") RentalArea rentalArea,
            @Param("status") ReviewStatus status,
            Pageable pageable
    );

    /**
     * Dem so review APPROVED cua 1 rental area.
     * Dung de cap nhat totalReviews tren RentalArea.
     */
    @Query("""
            SELECT COUNT(r) FROM Review r
            WHERE r.rentalArea = :rentalArea
              AND r.status = 'APPROVED'
              AND r.deletedAt IS NULL
            """)
    long countApprovedByRentalArea(@Param("rentalArea") RentalArea rentalArea);

    /**
     * Tinh diem trung binh cua 1 rental area.
     * Tra ve null neu chua co review nao.
     */
    @Query("""
            SELECT AVG(r.rating) FROM Review r
            WHERE r.rentalArea = :rentalArea
              AND r.status = 'APPROVED'
              AND r.deletedAt IS NULL
            """)
    Double avgRatingByRentalArea(@Param("rentalArea") RentalArea rentalArea);

    /**
     * Dem so review theo tung muc sao cho 1 rental area.
     * Dung de build StarDistribution trong ReviewSummaryResponse.
     * Tra ve List<Object[]> voi [0]=rating(Integer), [1]=count(Long).
     */
    @Query("""
            SELECT r.rating, COUNT(r) FROM Review r
            WHERE r.rentalArea = :rentalArea
              AND r.status = 'APPROVED'
              AND r.deletedAt IS NULL
            GROUP BY r.rating
            ORDER BY r.rating
            """)
    java.util.List<Object[]> countByRatingForRentalArea(@Param("rentalArea") RentalArea rentalArea);
}