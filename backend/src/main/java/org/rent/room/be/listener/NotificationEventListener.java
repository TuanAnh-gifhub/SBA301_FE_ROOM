package org.rent.room.be.listener;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.rent.room.be.constant.NotificationType;
import org.rent.room.be.event.admin.UserReportEvent;
import org.rent.room.be.event.booking.*;
import org.rent.room.be.event.listing.ListingApprovedEvent;
import org.rent.room.be.event.listing.ListingExpiringEvent;
import org.rent.room.be.event.listing.ListingPublishedEvent;
import org.rent.room.be.event.message.MessageReceivedEvent;
import org.rent.room.be.event.payment.InsufficientBalanceEvent;
import org.rent.room.be.event.payment.PaymentReceivedEvent;
import org.rent.room.be.event.payment.WalletToppedUpEvent;
import org.rent.room.be.service.NotificationService;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Listener lắng nghe các domain events và trigger notifications tương ứng
 *
 * Các module khác chỉ cần publish events, không cần biết về NotificationService
 * → Loose coupling, dễ maintain và test
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationService notificationService;

    /**
     * ============================================
     * BOOKING EVENTS
     * ============================================
     */

    @EventListener
    @Async
    public void handleBookingCreated(BookingCreatedEvent event) {
        log.info("Handling BookingCreatedEvent for booking {}", event.getBookingId());

        try {
            // Notification cho Renter
            Map<String, Object> renterData = new HashMap<>();
            renterData.put("bookingId", event.getBookingId());
            renterData.put("roomName", event.getRoomName());
            renterData.put("amount", event.getAmount());
            renterData.put("startTime", event.getStartTime());

            notificationService.createSystemNotification(
                    event.getRenterId(),
                    NotificationType.BOOKING_CREATED,
                    String.format("Bạn đã đặt phòng '%s' thành công. Tiền đang được giữ an toàn.",
                            event.getRoomName()),
                    renterData
            );

            // Notification cho Owner
            Map<String, Object> ownerData = new HashMap<>();
            ownerData.put("bookingId", event.getBookingId());
            ownerData.put("renterName", event.getRenterName());
            ownerData.put("roomName", event.getRoomName());
            ownerData.put("amount", event.getAmount());

            notificationService.createSystemNotification(
                    event.getOwnerId(),
                    NotificationType.NEW_BOOKING_REQUEST,
                    String.format("Bạn có yêu cầu đặt phòng mới cho '%s' từ %s",
                            event.getRoomName(), event.getRenterName()),
                    ownerData
            );

        } catch (Exception e) {
            log.error("Error handling BookingCreatedEvent", e);
        }
    }

    @EventListener
    @Async
    public void handleBookingConfirmed(BookingConfirmedEvent event) {
        log.info("Handling BookingConfirmedEvent for booking {}", event.getBookingId());

        try {
            Map<String, Object> data = new HashMap<>();
            data.put("bookingId", event.getBookingId());
            data.put("roomName", event.getRoomName());
            data.put("startTime", event.getStartTime());

            notificationService.createNotification(
                    event.getOwnerId(),
                    event.getRenterId(),
                    NotificationType.BOOKING_CONFIRMED,
                    String.format("Đặt phòng '%s' đã được xác nhận bởi chủ phòng", event.getRoomName()),
                    data
            );

        } catch (Exception e) {
            log.error("Error handling BookingConfirmedEvent", e);
        }
    }

    @EventListener
    @Async
    public void handleBookingRejected(BookingRejectedEvent event) {
        log.info("Handling BookingRejectedEvent for booking {}", event.getBookingId());

        try {
            Map<String, Object> data = new HashMap<>();
            data.put("bookingId", event.getBookingId());
            data.put("roomName", event.getRoomName());
            data.put("reason", event.getReason());

            notificationService.createNotification(
                    event.getOwnerId(),
                    event.getRenterId(),
                    NotificationType.BOOKING_REJECTED,
                    String.format("Đặt phòng '%s' bị từ chối. Tiền sẽ được hoàn lại.", event.getRoomName()),
                    data
            );

        } catch (Exception e) {
            log.error("Error handling BookingRejectedEvent", e);
        }
    }

    @EventListener
    @Async
    public void handleBookingCancelled(BookingCancelledEvent event) {
        log.info("Handling BookingCancelledEvent for booking {}", event.getBookingId());

        try {
            Map<String, Object> data = new HashMap<>();
            data.put("bookingId", event.getBookingId());
            data.put("roomName", event.getRoomName());
            data.put("reason", event.getReason());

            if (event.getCancelledByOwnerId() != null) {
                // Owner cancelled → notify Renter
                notificationService.createNotification(
                        event.getCancelledByOwnerId(),
                        event.getRenterId(),
                        NotificationType.OWNER_CANCELLED_BOOKING,
                        String.format("Chủ phòng đã hủy đặt phòng '%s'. Tiền sẽ được hoàn lại.",
                                event.getRoomName()),
                        data
                );
            } else {
                // Renter cancelled → notify Owner
                notificationService.createNotification(
                        event.getRenterId(),
                        event.getOwnerId(),
                        NotificationType.RENTER_CANCELLED_BOOKING,
                        String.format("Người thuê đã hủy đặt phòng '%s'", event.getRoomName()),
                        data
                );
            }

        } catch (Exception e) {
            log.error("Error handling BookingCancelledEvent", e);
        }
    }

    @EventListener
    @Async
    public void handleBookingCompleted(BookingCompletedEvent event) {
        log.info("Handling BookingCompletedEvent for booking {}", event.getBookingId());

        try {
            Map<String, Object> data = new HashMap<>();
            data.put("bookingId", event.getBookingId());
            data.put("roomName", event.getRoomName());
            data.put("amount", event.getAmount());

            // Notify Owner - đã nhận tiền
            notificationService.createSystemNotification(
                    event.getOwnerId(),
                    NotificationType.PAYMENT_RECEIVED,
                    String.format("Bạn đã nhận %s VND từ đặt phòng '%s'",
                            event.getAmount(), event.getRoomName()),
                    data
            );

            // Notify Renter - hoàn thành booking
            notificationService.createSystemNotification(
                    event.getRenterId(),
                    NotificationType.BOOKING_COMPLETED_PAYMENT_RELEASED,
                    String.format("Đã hoàn thành đặt phòng '%s'. Tiền đã được chuyển cho chủ phòng.",
                            event.getRoomName()),
                    data
            );

        } catch (Exception e) {
            log.error("Error handling BookingCompletedEvent", e);
        }
    }

    /**
     * ============================================
     * PAYMENT EVENTS
     * ============================================
     */

    @EventListener
    @Async
    public void handleWalletToppedUp(WalletToppedUpEvent event) {
        log.info("Handling WalletToppedUpEvent for user {}", event.getUserId());

        try {
            Map<String, Object> data = new HashMap<>();
            data.put("amount", event.getAmount());
            data.put("transactionId", event.getTransactionId());
            data.put("newBalance", event.getNewBalance());

            notificationService.createSystemNotification(
                    event.getUserId(),
                    NotificationType.WALLET_TOPPED_UP,
                    String.format("Bạn đã nạp thành công %s VND vào ví", event.getAmount()),
                    data
            );

        } catch (Exception e) {
            log.error("Error handling WalletToppedUpEvent", e);
        }
    }

    @EventListener
    @Async
    public void handlePaymentReceived(PaymentReceivedEvent event) {
        log.info("Handling PaymentReceivedEvent for user {}", event.getOwnerId());

        try {
            Map<String, Object> data = new HashMap<>();
            data.put("amount", event.getAmount());
            data.put("bookingId", event.getBookingId());

            notificationService.createSystemNotification(
                    event.getOwnerId(),
                    NotificationType.PAYMENT_RECEIVED,
                    String.format("Bạn đã nhận %s VND từ booking #%s",
                            event.getAmount(), event.getBookingId()),
                    data
            );

        } catch (Exception e) {
            log.error("Error handling PaymentReceivedEvent", e);
        }
    }

    @EventListener
    @Async
    public void handleInsufficientBalance(InsufficientBalanceEvent event) {
        log.info("Handling InsufficientBalanceEvent for user {}", event.getUserId());

        try {
            Map<String, Object> data = new HashMap<>();
            data.put("requiredAmount", event.getRequiredAmount());
            data.put("currentBalance", event.getCurrentBalance());

            notificationService.createSystemNotification(
                    event.getUserId(),
                    NotificationType.INSUFFICIENT_BALANCE,
                    String.format("Số dư không đủ. Cần %s VND, hiện có %s VND",
                            event.getRequiredAmount(), event.getCurrentBalance()),
                    data
            );

        } catch (Exception e) {
            log.error("Error handling InsufficientBalanceEvent", e);
        }
    }

    /**
     * ============================================
     * LISTING EVENTS
     * ============================================
     */

    @EventListener
    @Async
    public void handleListingPublished(ListingPublishedEvent event) {
        log.info("Handling ListingPublishedEvent for listing {}", event.getListingId());

        try {
            Map<String, Object> data = new HashMap<>();
            data.put("listingId", event.getListingId());
            data.put("roomName", event.getRoomName());

            notificationService.createSystemNotification(
                    event.getOwnerId(),
                    NotificationType.LISTING_PUBLISHED,
                    String.format("Bài đăng '%s' đã được xuất bản thành công", event.getRoomName()),
                    data
            );

        } catch (Exception e) {
            log.error("Error handling ListingPublishedEvent", e);
        }
    }

    @EventListener
    @Async
    public void handleListingApproved(ListingApprovedEvent event) {
        log.info("Handling ListingApprovedEvent for listing {}", event.getListingId());

        try {
            Map<String, Object> data = new HashMap<>();
            data.put("listingId", event.getListingId());
            data.put("roomName", event.getRoomName());

            notificationService.createSystemNotification(
                    event.getOwnerId(),
                    NotificationType.LISTING_APPROVED,
                    String.format("Bài đăng '%s' đã được admin duyệt", event.getRoomName()),
                    data
            );

        } catch (Exception e) {
            log.error("Error handling ListingApprovedEvent", e);
        }
    }

    @EventListener
    @Async
    public void handleListingExpiring(ListingExpiringEvent event) {
        log.info("Handling ListingExpiringEvent for listing {}", event.getListingId());

        try {
            Map<String, Object> data = new HashMap<>();
            data.put("listingId", event.getListingId());
            data.put("roomName", event.getRoomName());
            data.put("expiresAt", event.getExpiresAt());
            data.put("daysRemaining", event.getDaysRemaining());

            NotificationType type = event.getDaysRemaining() <= 1
                    ? NotificationType.LISTING_PACKAGE_EXPIRING_TOMORROW
                    : NotificationType.LISTING_PACKAGE_EXPIRING_SOON;

            String message = event.getDaysRemaining() <= 1
                    ? String.format("Gói dịch vụ của bài đăng '%s' sẽ hết hạn trong 1 ngày", event.getRoomName())
                    : String.format("Gói dịch vụ của bài đăng '%s' sẽ hết hạn trong %d ngày",
                    event.getRoomName(), event.getDaysRemaining());

            notificationService.createSystemNotification(
                    event.getOwnerId(),
                    type,
                    message,
                    data
            );

        } catch (Exception e) {
            log.error("Error handling ListingExpiringEvent", e);
        }
    }

    /**
     * ============================================
     * MESSAGE EVENTS
     * ============================================
     */

    @EventListener
    @Async
    public void handleMessageReceived(MessageReceivedEvent event) {
        log.info("Handling MessageReceived from {} to {}", event.getSenderId(), event.getRecipientId());

        try {
            Map<String, Object> data = new HashMap<>();
            data.put("messageId", event.getMessageId());
            data.put("conversationId", event.getConversationId());
            data.put("senderName", event.getSenderName());
            data.put("preview", event.getMessagePreview());

            NotificationType type = event.isFromOwner()
                    ? NotificationType.OWNER_MESSAGE_RECEIVED
                    : NotificationType.RENTER_MESSAGE_RECEIVED;

            notificationService.createNotification(
                    event.getSenderId(),
                    event.getRecipientId(),
                    type,
                    String.format("%s đã gửi tin nhắn cho bạn", event.getSenderName()),
                    data
            );

        } catch (Exception e) {
            log.error("Error handling MessageReceivedEvent", e);
        }
    }

    /**
     * ============================================
     * ADMIN EVENTS
     * ============================================
     */

    @EventListener
    @Async
    public void handleUserReport(UserReportEvent event) {
        log.info("Handling UserReportEvent - user {} reported {}",
                event.getReporterId(), event.getReportedUserId());

        try {
            Map<String, Object> data = new HashMap<>();
            data.put("reportId", event.getReportId());
            data.put("reportedUserId", event.getReportedUserId());
            data.put("reason", event.getReason());

            // Gửi tới tất cả admins
            // TODO: Lấy danh sách admin IDs
            // List<UUID> adminIds = userService.getAllAdminIds();
            // adminIds.forEach(adminId -> {
            //     notificationService.createSystemNotification(...);
            // });

        } catch (Exception e) {
            log.error("Error handling UserReportEvent", e);
        }
    }
}
