package org.rent.room.be.repository;

import org.rent.room.be.constant.WalletTxStatus;
import org.rent.room.be.constant.WalletTxType;
import org.rent.room.be.entity.Wallet;
import org.rent.room.be.entity.WalletTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, UUID>,
        JpaSpecificationExecutor<WalletTransaction> {

    Optional<WalletTransaction> findByPayosOrderCode(String payosOrderCode);

    Page<WalletTransaction> findByWalletAndCreatedAtBetween(
            Wallet wallet,
            LocalDateTime from,
            LocalDateTime to,
            Pageable pageable
    );

    Page<WalletTransaction> findByWalletAndTypeAndStatusAndCreatedAtBetween(
            Wallet wallet,
            WalletTxType type,
            WalletTxStatus status,
            LocalDateTime from,
            LocalDateTime to,
            Pageable pageable
    );

    boolean existsByBookingIdAndType(UUID bookingId, WalletTxType type);

    @Query("""
            SELECT COALESCE(SUM(tx.amount), 0)
            FROM WalletTransaction tx
            WHERE tx.wallet = :wallet
              AND tx.type = :type
              AND tx.status = :status
              AND tx.createdAt BETWEEN :from AND :to
            """)
    BigDecimal sumAmountByWalletTypeStatus(
            @Param("wallet") Wallet wallet,
            @Param("type") WalletTxType type,
            @Param("status") WalletTxStatus status,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    @Query("""
            SELECT COUNT(r)
            FROM Review r
            WHERE r.rentalArea.owner.userId = :ownerId
              AND r.status = 'APPROVED'
              AND r.deletedAt IS NULL
              AND r.createdAt BETWEEN :from AND :to
            """)
    long countNewReviewsByOwnerInPeriod(
            @Param("ownerId") UUID ownerId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    /**
     * Avg rating trong kỳ theo owner. Null nếu không có review.
     */
    @Query("""
            SELECT AVG(r.rating)
            FROM Review r
            WHERE r.rentalArea.owner.userId = :ownerId
              AND r.status = 'APPROVED'
              AND r.deletedAt IS NULL
              AND r.createdAt BETWEEN :from AND :to
            """)
    Double avgRatingByOwnerInPeriod(
            @Param("ownerId") UUID ownerId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    /**
     * Avg rating all-time theo owner. Null nếu chưa có review nào.
     */
    @Query("""
            SELECT AVG(r.rating)
            FROM Review r
            WHERE r.rentalArea.owner.userId = :ownerId
              AND r.status = 'APPROVED'
              AND r.deletedAt IS NULL
            """)
    Double avgRatingByOwner(@Param("ownerId") UUID ownerId);

    /**
     * Đếm review chưa được owner reply → hiển thị badge "Cần phản hồi".
     */
    @Query("""
            SELECT COUNT(r)
            FROM Review r
            WHERE r.rentalArea.owner.userId = :ownerId
              AND r.status = 'APPROVED'
              AND r.deletedAt IS NULL
              AND r.reply IS NULL
            """)
    long countPendingReplyByOwner(@Param("ownerId") UUID ownerId);
}

