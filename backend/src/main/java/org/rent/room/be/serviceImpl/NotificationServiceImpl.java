package org.rent.room.be.serviceImpl;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.rent.room.be.constant.NotificationType;
import org.rent.room.be.dto.response.NotificationDTO;
import org.rent.room.be.dto.response.NotificationResponse;
import org.rent.room.be.entity.Notification;
import org.rent.room.be.entity.User;
import org.rent.room.be.exception.ResourceNotFoundException;
import org.rent.room.be.repository.NotificationRepository;
import org.rent.room.be.repository.UserRepository;
import org.rent.room.be.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate; // WebSocket

    /**
     * ============================================
     * CORE METHOD - Tạo notification
     * ============================================
     */

    /**
     * Tạo notification từ user khác (có sender)
     */
    @Transactional
    public Notification createNotification(
            UUID senderId,
            UUID recipientId,
            NotificationType type,
            String message,
            Map<String, Object> data
    ) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipient not found"));

        Notification notification = Notification.builder()
                .notificationType(type)
                .notificationTitle(type.getDisplayName())
                .notificationBody(message)
                .sender(sender)
                .recipient(recipient)
                .notificationData(data)
                .read(false)
                .deleted(false)
                .build();

        notification = notificationRepository.save(notification);
        log.info("Created notification {} from user {} to user {}", type, senderId, recipientId);

        // Gửi real-time notification
        sendRealtimeNotification(recipientId, notification);

        return notification;
    }

    /**
     * Tạo system notification (không có sender)
     */
    @Transactional
    public Notification createSystemNotification(
            UUID recipientId,
            NotificationType type,
            String message,
            Map<String, Object> data
    ) {
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipient not found"));

        Notification notification = Notification.builder()
                .notificationType(type)
                .notificationTitle(type.getDisplayName())
                .notificationBody(message)
                .sender(null) // System notification
                .recipient(recipient)
                .notificationData(data)
                .read(false)
                .deleted(false)
                .build();

        notification = notificationRepository.save(notification);
        log.info("Created system notification {} for user {}", type, recipientId);

        sendRealtimeNotification(recipientId, notification);

        return notification;
    }

    /**
     * Tạo broadcast notification cho tất cả users (admin feature)
     */
    @Transactional
    public void createBroadcastNotification(
            NotificationType type,
            String message,
            Map<String, Object> data
    ) {
        List<User> allUsers = userRepository.findAll();

        List<Notification> notifications = allUsers.stream()
                .map(user -> Notification.builder()
                        .notificationType(type)
                        .notificationTitle(type.getDisplayName())
                        .notificationBody(message)
                        .sender(null)
                        .recipient(user)
                        .notificationData(data)
                        .read(false)
                        .deleted(false)
                        .build())
                .collect(Collectors.toList());

        notificationRepository.saveAll(notifications);
        log.info("Created broadcast notification {} for {} users", type, allUsers.size());

        // Gửi real-time cho tất cả users
        notifications.forEach(n -> sendRealtimeNotification(n.getRecipient().getUserId(), n));
    }

    /**
     * ============================================
     * REAL-TIME NOTIFICATION
     * ============================================
     */

    /**
     * Gửi notification real-time qua WebSocket
     */
    private void sendRealtimeNotification(UUID userId, Notification notification) {
        try {
            NotificationDTO dto = NotificationDTO.fromEntity(notification);

            // Gửi notification detail
            messagingTemplate.convertAndSendToUser(
                    userId.toString(),
                    "/queue/notifications",
                    dto
            );

            // Gửi updated unread count
            Long unreadCount = getUnreadCount(userId);
            messagingTemplate.convertAndSendToUser(
                    userId.toString(),
                    "/queue/unread-count",
                    Map.of("count", unreadCount)
            );

            log.debug("Sent real-time notification to user {}", userId);
        } catch (Exception e) {
            log.error("Failed to send real-time notification to user {}", userId, e);
        }
    }

    /**
     * ============================================
     * QUERY METHODS
     * ============================================
     */

    /**
     * Lấy danh sách notifications của user với pagination
     */
    @Transactional(readOnly = true)
    public NotificationResponse getNotifications(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notificationPage = notificationRepository
                .findByRecipientIdAndNotDeleted(userId, pageable);

        List<NotificationDTO> dtos = notificationPage.getContent().stream()
                .map(NotificationDTO::fromEntity)
                .collect(Collectors.toList());

        Long unreadCount = notificationRepository.countUnreadByRecipientId(userId);

        return NotificationResponse.builder()
                .notifications(dtos)
                .unreadCount(unreadCount)
                .pagination(NotificationResponse.PaginationInfo.builder()
                        .currentPage(page)
                        .pageSize(size)
                        .totalPages(notificationPage.getTotalPages())
                        .totalElements(notificationPage.getTotalElements())
                        .hasNext(notificationPage.hasNext())
                        .hasPrevious(notificationPage.hasPrevious())
                        .build())
                .build();
    }

    /**
     * Lấy notifications chưa đọc
     */
    @Transactional(readOnly = true)
    public List<NotificationDTO> getUnreadNotifications(UUID userId) {
        List<Notification> notifications = notificationRepository
                .findUnreadByRecipientId(userId);

        return notifications.stream()
                .map(NotificationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Đếm số notifications chưa đọc
     */
    @Transactional(readOnly = true)
    public Long getUnreadCount(UUID userId) {
        return notificationRepository.countUnreadByRecipientId(userId);
    }

    /**
     * Lấy notifications theo type
     */
    @Transactional(readOnly = true)
    public NotificationResponse getNotificationsByType(
            UUID userId,
            NotificationType type,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notificationPage = notificationRepository
                .findByRecipientIdAndType(userId, type, pageable);

        List<NotificationDTO> dtos = notificationPage.getContent().stream()
                .map(NotificationDTO::fromEntity)
                .collect(Collectors.toList());

        return NotificationResponse.builder()
                .notifications(dtos)
                .pagination(NotificationResponse.PaginationInfo.builder()
                        .currentPage(page)
                        .pageSize(size)
                        .totalPages(notificationPage.getTotalPages())
                        .totalElements(notificationPage.getTotalElements())
                        .hasNext(notificationPage.hasNext())
                        .hasPrevious(notificationPage.hasPrevious())
                        .build())
                .build();
    }

    /**
     * Lấy recent notifications (24h gần nhất)
     */
    @Transactional(readOnly = true)
    public List<NotificationDTO> getRecentNotifications(UUID userId) {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        List<Notification> notifications = notificationRepository
                .findRecentNotifications(userId, since);

        return notifications.stream()
                .map(NotificationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * ============================================
     * UPDATE METHODS
     * ============================================
     */

    /**
     * Đánh dấu notification là đã đọc
     */
    @Transactional
    public void markAsRead(UUID notificationId, UUID userId) {
        int updated = notificationRepository.markAsRead(
                notificationId,
                userId,
                LocalDateTime.now()
        );

        if (updated > 0) {
            log.info("Marked notification {} as read for user {}", notificationId, userId);
            sendUnreadCountUpdate(userId);
        } else {
            throw new ResourceNotFoundException("Notification not found or access denied");
        }
    }

    /**
     * Đánh dấu tất cả notifications là đã đọc
     */
    @Transactional
    public void markAllAsRead(UUID userId) {
        int updated = notificationRepository.markAllAsRead(userId, LocalDateTime.now());
        log.info("Marked {} notifications as read for user {}", updated, userId);
        sendUnreadCountUpdate(userId);
    }

    /**
     * Soft delete một notification
     */
    @Transactional
    public void deleteNotification(UUID notificationId, UUID userId) {
        int deleted = notificationRepository.softDelete(
                notificationId,
                userId,
                LocalDateTime.now()
        );

        if (deleted > 0) {
            log.info("Deleted notification {} for user {}", notificationId, userId);
        } else {
            throw new ResourceNotFoundException("Notification not found or access denied");
        }
    }

    /**
     * Xóa tất cả notifications đã đọc
     */
    @Transactional
    public void deleteAllRead(UUID userId) {
        int deleted = notificationRepository.deleteAllRead(userId, LocalDateTime.now());
        log.info("Deleted {} read notifications for user {}", deleted, userId);
    }

    /**
     * Gửi updated unread count qua WebSocket
     */
    private void sendUnreadCountUpdate(UUID userId) {
        Long unreadCount = getUnreadCount(userId);
        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/unread-count",
                Map.of("count", unreadCount)
        );
    }

    /**
     * ============================================
     * ADMIN & CLEANUP METHODS
     * ============================================
     */

    /**
     * Cleanup old deleted notifications (chạy scheduled)
     * Xóa vĩnh viễn những notification đã bị soft delete > 30 ngày
     */
    @Transactional
    public void cleanupOldNotifications() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        int deleted = notificationRepository.hardDeleteOldNotifications(cutoffDate);
        log.info("Cleaned up {} old notifications", deleted);
    }

    /**
     * Lấy statistics của notifications (admin dashboard)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getNotificationStatistics(UUID userId) {
        List<Object[]> stats = notificationRepository.getNotificationStatsByRecipient(userId);

        Map<String, Long> typeStats = new HashMap<>();
        for (Object[] row : stats) {
            NotificationType type = (NotificationType) row[0];
            Long count = (Long) row[1];
            typeStats.put(type.name(), count);
        }

        return Map.of(
                "byType", typeStats,
                "totalUnread", getUnreadCount(userId),
                "total", stats.stream().mapToLong(row -> (Long) row[1]).sum()
        );
    }
}
