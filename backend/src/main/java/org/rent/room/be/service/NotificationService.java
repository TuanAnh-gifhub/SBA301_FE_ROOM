package org.rent.room.be.service;

import org.rent.room.be.constant.NotificationType;
import org.rent.room.be.entity.User;
import org.springframework.transaction.annotation.Transactional;

public interface NotificationService {

    @Transactional
    void createAndSendNotification(
            User sender, User recipient, NotificationType type, String rawContent);

}
