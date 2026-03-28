package org.rent.room.be.dto.request.notification;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BroadcastNotificationRequest {
    String title;
    String message;
    String link;
}