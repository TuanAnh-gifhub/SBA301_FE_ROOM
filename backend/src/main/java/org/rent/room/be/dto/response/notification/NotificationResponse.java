package org.rent.room.be.dto.response.notification;

import lombok.*;
import org.rent.room.be.constant.NotificationType;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class NotificationResponse {
    UUID notificationId;
    String notificationTitle;
    String notificationBody;
    NotificationType type;
    String link;
    boolean isRead;
    UUID recipientId;
    LocalDateTime createdAt;
}
