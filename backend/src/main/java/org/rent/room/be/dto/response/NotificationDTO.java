package org.rent.room.be.dto.response;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import org.rent.room.be.constant.NotificationType;
import org.rent.room.be.entity.Notification;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationDTO {

    private UUID notificationId;
    private NotificationType type;
    private String typeName;  // Tên hiển thị của type
    private String title;
    private String message;
    private String icon;
    private Map<String, Object> data;

    // Sender info (null nếu là system notification)
    private UserBasicDTO sender;

    private Boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;

    // Computed fields
    private String timeAgo;  // "2 phút trước", "1 giờ trước"
    private String category; // Từ NotificationType.Category

    /**
     * Convert từ Entity sang DTO
     */
    public static NotificationDTO fromEntity(Notification notification) {
        if (notification == null) {
            return null;
        }

        return NotificationDTO.builder()
                .notificationId(notification.getNotificationId())
                .type(notification.getNotificationType())
                .typeName(notification.getNotificationType().getDisplayName())
                .title(notification.getNotificationTitle())
                .message(notification.getNotificationBody())
                .icon(notification.getIcon())
                .data(notification.getNotificationData())
                .sender(notification.getSender() != null ?
                        UserBasicDTO.fromEntity(notification.getSender()) : null)
                .isRead(notification.isRead())
                .readAt(notification.getReadAt())
                .createdAt(notification.getCreatedAt())
                .timeAgo(calculateTimeAgo(notification.getCreatedAt()))
                .category(notification.getNotificationType().getCategory().name())
                .build();
    }

    /**
     * Tính thời gian "... trước" từ createdAt
     */
    private static String calculateTimeAgo(LocalDateTime createdAt) {
        if (createdAt == null) {
            return "";
        }

        Duration duration = Duration.between(createdAt, LocalDateTime.now());
        long seconds = duration.getSeconds();

        if (seconds < 60) {
            return "Vừa xong";
        }

        long minutes = seconds / 60;
        if (minutes < 60) {
            return minutes + " phút trước";
        }

        long hours = minutes / 60;
        if (hours < 24) {
            return hours + " giờ trước";
        }

        long days = hours / 24;
        if (days < 7) {
            return days + " ngày trước";
        }

        if (days < 30) {
            long weeks = days / 7;
            return weeks + " tuần trước";
        }

        // Nếu quá lâu, hiển thị ngày tháng
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        return createdAt.format(formatter);
    }

    /**
     * DTO đơn giản cho sender info
     */
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserBasicDTO {
        private UUID userId;
        private String fullName;
        private String avatarUrl;

        public static UserBasicDTO fromEntity(org.rent.room.be.entity.User user) {
            if (user == null) {
                return null;
            }
            return UserBasicDTO.builder()
                    .userId(user.getUserId()) // Giả sử User entity có getId()
                    .fullName(user.getUserName()) // Adjust theo entity của bạn
                    .avatarUrl(user.getEmail()) // Adjust theo entity của bạn
                    .build();
        }
    }
}
