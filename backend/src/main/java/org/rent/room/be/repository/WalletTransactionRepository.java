package org.rent.room.be.repository;

import org.rent.room.be.constant.WalletTxStatus;
import org.rent.room.be.constant.WalletTxType;
import org.rent.room.be.dto.response.dashboard.OwnerRevenueStatsResponse;
import org.rent.room.be.dto.response.dashboard.RevenueData;
import org.rent.room.be.entity.Wallet;
import org.rent.room.be.entity.WalletTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
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

    @Query("""
                SELECT NEW org.rent.room.be.dto.response.dashboard.RevenueData(
                    CAST(FUNCTION('TO_CHAR', wt.createdAt, 'DD/MM') AS string), 
                    SUM(wt.amount)
                )
                FROM WalletTransaction wt
                WHERE wt.wallet.user.userId = :userId
                AND wt.type = org.rent.room.be.constant.WalletTxType.BOOKING_INCOME
                AND wt.status = org.rent.room.be.constant.WalletTxStatus.COMPLETED
                AND wt.createdAt >= :startDate
                GROUP BY FUNCTION('TO_CHAR', wt.createdAt, 'DD/MM')
                ORDER BY MIN(wt.createdAt) ASC
            """)
    List<RevenueData> getDailyRevenue(@Param("userId") UUID userId, @Param("startDate") LocalDateTime startDate);

    @Query("""
                SELECT NEW org.rent.room.be.dto.response.dashboard.RevenueData(
                    CAST(FUNCTION('TO_CHAR', wt.createdAt, 'MM/YYYY') AS string), 
                    SUM(wt.amount)
                )
                FROM WalletTransaction wt
                WHERE wt.wallet.user.userId = :userId
                AND wt.type = org.rent.room.be.constant.WalletTxType.BOOKING_INCOME
                AND wt.status = org.rent.room.be.constant.WalletTxStatus.COMPLETED
                AND EXTRACT(YEAR FROM wt.createdAt) = :year
                GROUP BY FUNCTION('TO_CHAR', wt.createdAt, 'MM/YYYY')
                ORDER BY MIN(wt.createdAt) ASC
            """)
    List<RevenueData> getMonthlyRevenue(@Param("userId") UUID userId, @Param("year") int year);

    @Query(value = "SELECT * FROM wallet_transactions " +
            "WHERE created_at BETWEEN :startDate AND :endDate " +
            "AND status = 'COMPLETED' " +
            "AND transaction_type = 'BOOKING_INCOME'",
            nativeQuery = true)
    List<WalletTransaction> getRevenueTransactions(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query(value = "SELECT COALESCE(SUM(amount), 0) FROM wallet_transactions " +
            "WHERE status = :status AND transaction_type = :type", nativeQuery = true)
    BigDecimal sumAmountByStatusAndType(@Param("status") String status, @Param("type") String type);

    @Query(value = "SELECT COALESCE(SUM(amount), 0) FROM wallet_transactions " +
            "WHERE created_at BETWEEN :startDate AND :endDate " +
            "AND status = :status AND transaction_type = :type", nativeQuery = true)
    java.math.BigDecimal sumAmountByDateAndStatusAndType(
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate") java.time.LocalDateTime endDate,
            @Param("status") String status,
            @Param("type") String type);

    @Modifying
    @Transactional
    @Query(value = "UPDATE wallet_transactions SET created_at = :createdAt WHERE wallet_transaction_id = :id", nativeQuery = true)
    void updateCreatedAt(@Param("id") UUID id, @Param("createdAt") LocalDateTime createdAt);
}

