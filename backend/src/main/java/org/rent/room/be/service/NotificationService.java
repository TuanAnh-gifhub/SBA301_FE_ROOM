package org.rent.room.be.service;

import org.rent.room.be.constant.NotificationType;
import org.rent.room.be.dto.response.notification.NotificationResponse;
import org.rent.room.be.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface NotificationService {

    @Transactional
    void createAndSendNotification(
            User sender, User recipient, NotificationType type, String rawContent);

    Page<NotificationResponse> getMyNotification(int page, int size);

    void sendNotificationToAllUsers(String title, String message, String link);
}
