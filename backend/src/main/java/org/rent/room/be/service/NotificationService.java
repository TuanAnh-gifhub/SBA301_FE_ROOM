package org.rent.room.be.service;


import org.rent.room.be.constant.NotificationType;
import org.rent.room.be.dto.response.NotificationDTO;
import org.rent.room.be.dto.response.NotificationResponse;
import org.rent.room.be.entity.Notification;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface NotificationService {

    /**
     * ============================================
     * CORE METHODS - Tạo notification
     * ============================================
     */

    Notification createNotification(
            UUID senderId,
            UUID recipientId,
            NotificationType type,
            String message,
            Map<String, Object> data
    );

    Notification createSystemNotification(
            UUID recipientId,
            NotificationType type,
            String message,
            Map<String, Object> data
    );

    void createBroadcastNotification(
            NotificationType type,
            String message,
            Map<String, Object> data
    );

    /**
     * ============================================
     * QUERY METHODS
     * ============================================
     */

    NotificationResponse getNotifications(UUID userId, int page, int size);

    List<NotificationDTO> getUnreadNotifications(UUID userId);

    Long getUnreadCount(UUID userId);

    NotificationResponse getNotificationsByType(
            UUID userId,
            NotificationType type,
            int page,
            int size
    );

    List<NotificationDTO> getRecentNotifications(UUID userId);

    /**
     * ============================================
     * UPDATE METHODS
     * ============================================
     */

    void markAsRead(UUID notificationId, UUID userId);

    void markAllAsRead(UUID userId);

    void deleteNotification(UUID notificationId, UUID userId);

    void deleteAllRead(UUID userId);

    /**
     * ============================================
     * ADMIN & CLEANUP METHODS
     * ============================================
     */

    void cleanupOldNotifications();

    Map<String, Object> getNotificationStatistics(UUID userId);
}
