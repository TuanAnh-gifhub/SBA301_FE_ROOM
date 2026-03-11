package org.rent.room.be.serviceImpl;

import lombok.RequiredArgsConstructor;
import org.rent.room.be.constant.NotificationType;
import org.rent.room.be.dto.response.notification.NotificationResponse;
import org.rent.room.be.entity.Notification;
import org.rent.room.be.entity.User;
import org.rent.room.be.mapper.NotificationMapper;
import org.rent.room.be.repository.NotificationRepository;
import org.rent.room.be.service.NotificationService;
import org.rent.room.be.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserService userService;

    @Transactional
    @Override
    public void createAndSendNotification(
            User sender, User recipient, NotificationType type, String rawContent) {

        Notification notification = Notification.builder()
                .recipient(recipient)
                .type(type)
                .isRead(false)
                .isDeleted(false)
                .build();

        String senderName = (sender != null) ? sender.getUserName() : "Hệ thống";
        setNotificationContent(notification, senderName, rawContent);

        notificationRepository.save(notification);

        NotificationResponse response = notificationMapper.toResponse(notification);

        messagingTemplate.convertAndSendToUser(
                recipient.getUserId().toString(),
                "/queue/notifications",
                response
        );
    }

    @Override
    public Page<NotificationResponse> getMyNotification(int page, int size) {
        User currentUser = userService.getCurrentUserEntity();

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Notification> notificationPage = notificationRepository.findAllByRecipient(currentUser, pageable);

        return notificationPage.map(notificationMapper::toResponse);
    }

    private void setNotificationContent(Notification notification, String senderName, String rawContent) {
        switch (notification.getType()) {
            case CHAT:
                notification.setNotificationTitle("Tin nhắn mới");
                if (rawContent != null) {
                    String preview = rawContent.length() > 50 ? rawContent.substring(0, 47) + "..." : rawContent;
                    notification.setNotificationBody(senderName + ": " + preview);
                    notification.setLink("http://localhost:5173/chat");
                } else {
                    notification.setNotificationBody("Bạn có tin nhắn mới từ " + senderName);
                }
                break;
            case BOOKING:
                notification.setNotificationTitle("Cập nhật phòng thuê");
                notification.setNotificationBody("Yêu cầu đặt phòng của bạn đã có thay đổi mới.");
                break;

            default:
                notification.setNotificationTitle("Thông báo hệ thống");
                notification.setNotificationBody(rawContent != null ? rawContent : "Bạn có một thông báo mới.");
        }
    }
}