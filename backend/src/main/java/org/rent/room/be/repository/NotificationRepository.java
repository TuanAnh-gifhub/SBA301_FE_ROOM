package org.rent.room.be.repository;


import org.rent.room.be.constant.NotificationType;
import org.rent.room.be.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    /**
     * Lấy tất cả notifications của user (chưa bị xóa), sắp xếp theo thời gian tạo
     */
    @Query("SELECT n FROM Notification n " +
            "WHERE n.recipient.userId = :userId " +
            "AND n.deleted = false " +
            "ORDER BY n.createdAt DESC")
    Page<Notification> findByRecipientIdAndNotDeleted(
            @Param("userId") UUID userId,
            Pageable pageable
    );

    /**
     * Lấy notifications chưa đọc của user
     */
    @Query("SELECT n FROM Notification n " +
            "WHERE n.recipient.userId = :userId " +
            "AND n.read = false " +
            "AND n.deleted = false " +
            "ORDER BY n.createdAt DESC")
    List<Notification> findUnreadByRecipientId(@Param("userId") UUID userId);

    /**
     * Đếm số notifications chưa đọc của user
     */
    @Query("SELECT COUNT(n) FROM Notification n " +
            "WHERE n.recipient.userId = :userId " +
            "AND n.read = false " +
            "AND n.deleted = false")
    Long countUnreadByRecipientId(@Param("userId") UUID userId);

    /**
     * Lấy notifications theo loại
     */
    @Query("SELECT n FROM Notification n " +
            "WHERE n.recipient.userId = :userId " +
            "AND n.notificationType = :type " +
            "AND n.deleted = false " +
            "ORDER BY n.createdAt DESC")
    Page<Notification> findByRecipientIdAndType(
            @Param("userId") UUID userId,
            @Param("type") NotificationType type,
            Pageable pageable
    );

    /**
     * Đánh dấu một notification là đã đọc
     */
    @Modifying
    @Query("UPDATE Notification n " +
            "SET n.read = true, n.readAt = :readAt " +
            "WHERE n.notificationId = :notificationId " +
            "AND n.recipient.userId = :userId")
    int markAsRead(
            @Param("notificationId") UUID notificationId,
            @Param("userId") UUID userId,
            @Param("readAt") LocalDateTime readAt
    );

    /**
     * Đánh dấu tất cả notifications của user là đã đọc
     */
    @Modifying
    @Query("UPDATE Notification n " +
            "SET n.read = true, n.readAt = :readAt " +
            "WHERE n.recipient.userId = :userId " +
            "AND n.read = false " +
            "AND n.deleted = false")
    int markAllAsRead(
            @Param("userId") UUID userId,
            @Param("readAt") LocalDateTime readAt
    );

    /**
     * Soft delete một notification
     */
    @Modifying
    @Query("UPDATE Notification n " +
            "SET n.deleted = true, n.deletedAt = :deletedAt " +
            "WHERE n.notificationId = :notificationId " +
            "AND n.recipient.userId = :userId")
    int softDelete(
            @Param("notificationId") UUID notificationId,
            @Param("userId") UUID userId,
            @Param("deletedAt") LocalDateTime deletedAt
    );

    /**
     * Soft delete tất cả notifications đã đọc của user
     */
    @Modifying
    @Query("UPDATE Notification n " +
            "SET n.deleted = true, n.deletedAt = :deletedAt " +
            "WHERE n.recipient.userId = :userId " +
            "AND n.read = true " +
            "AND n.deleted = false")
    int deleteAllRead(
            @Param("userId") UUID userId,
            @Param("deletedAt") LocalDateTime deletedAt
    );

    /**
     * Hard delete các notifications đã bị soft delete lâu hơn X ngày
     * (Chạy định kỳ để cleanup database)
     */
    @Modifying
    @Query("DELETE FROM Notification n " +
            "WHERE n.deleted = true " +
            "AND n.deletedAt < :beforeDate")
    int hardDeleteOldNotifications(@Param("beforeDate") LocalDateTime beforeDate);

    /**
     * Tìm notifications theo sender
     */
    @Query("SELECT n FROM Notification n " +
            "WHERE n.sender.userId = :senderId " +
            "AND n.deleted = false " +
            "ORDER BY n.createdAt DESC")
    Page<Notification> findBySenderId(
            @Param("senderId") UUID senderId,
            Pageable pageable
    );

    /**
     * Lấy recent notifications (24h gần nhất)
     */
    @Query("SELECT n FROM Notification n " +
            "WHERE n.recipient.userId = :userId " +
            "AND n.deleted = false " +
            "AND n.createdAt >= :since " +
            "ORDER BY n.createdAt DESC")
    List<Notification> findRecentNotifications(
            @Param("userId") UUID userId,
            @Param("since") LocalDateTime since
    );

    /**
     * Check xem có notification chưa đọc của type cụ thể không
     */
    @Query("SELECT CASE WHEN COUNT(n) > 0 THEN true ELSE false END " +
            "FROM Notification n " +
            "WHERE n.recipient.userId = :userId " +
            "AND n.notificationType = :type " +
            "AND n.read = false " +
            "AND n.deleted = false")
    boolean hasUnreadNotificationsOfType(
            @Param("userId") UUID userId,
            @Param("type") NotificationType type
    );

    /**
     * Lấy statistics của notifications
     */
    @Query("SELECT n.notificationType as type, COUNT(n) as count " +
            "FROM Notification n " +
            "WHERE n.recipient.userId = :userId " +
            "AND n.deleted = false " +
            "GROUP BY n.notificationType")
    List<Object[]> getNotificationStatsByRecipient(@Param("userId") UUID userId);
}
