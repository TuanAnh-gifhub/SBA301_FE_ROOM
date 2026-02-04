package org.rent.room.be.scheduler;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.rent.room.be.service.NotificationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Scheduled tasks cho các notifications định kỳ
 * - Booking reminders
 * - Listing expiration warnings
 * - Cleanup old notifications
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationScheduler {

    private final NotificationService notificationService;
    // TODO: Inject các repository cần thiết (BookingRepository, ListingRepository...)

    /**
     * ============================================
     * BOOKING REMINDERS
     * ============================================
     */

    /**
     * Nhắc nhở trước 24h về booking sắp tới
     * Chạy mỗi giờ
     */
    @Scheduled(cron = "0 0 * * * *") // Mỗi giờ vào đầu giờ
    public void sendBookingReminders24h() {
        log.info("Running 24h booking reminders...");

        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime tomorrow = now.plusHours(24);

            // TODO: Query bookings trong khoảng 23-25h nữa
            // List<Booking> upcomingBookings = bookingRepository
            //     .findUpcomingBookingsBetween(now.plusHours(23), now.plusHours(25));

            // Example:
            // for (Booking booking : upcomingBookings) {
            //     if (booking không có reminder 24h) {
            //         notificationService.createSystemNotification(
            //             booking.getRenterId(),
            //             NotificationType.BOOKING_REMINDER,
            //             String.format("Nhắc nhở: Bạn có booking '%s' vào ngày mai lúc %s",
            //                 booking.getRoom().getName(),
            //                 booking.getStartTime().format(...)
            //             ),
            //             Map.of(
            //                 "bookingId", booking.getId(),
            //                 "roomName", booking.getRoom().getName(),
            //                 "startTime", booking.getStartTime(),
            //                 "reminderType", "24h"
            //             )
            //         );
            //         // Mark đã gửi reminder
            //     }
            // }

            log.info("Completed 24h booking reminders");
        } catch (Exception e) {
            log.error("Error sending 24h booking reminders", e);
        }
    }

    /**
     * Nhắc nhở trước 3h về booking sắp tới
     * Chạy mỗi 30 phút
     */
    @Scheduled(cron = "0 */30 * * * *") // Mỗi 30 phút
    public void sendBookingReminders3h() {
        log.info("Running 3h booking reminders...");

        try {
            LocalDateTime now = LocalDateTime.now();

            // TODO: Query bookings trong khoảng 2.5-3.5h nữa
            // Similar logic như trên

            log.info("Completed 3h booking reminders");
        } catch (Exception e) {
            log.error("Error sending 3h booking reminders", e);
        }
    }

    /**
     * Nhắc nhở confirm hoàn thành booking
     * Chạy mỗi 2 giờ
     */
    @Scheduled(cron = "0 0 */2 * * *") // Mỗi 2 giờ
    public void sendBookingCompletionReminders() {
        log.info("Running booking completion reminders...");

        try {
            LocalDateTime now = LocalDateTime.now();

            // TODO: Query bookings đã qua thời gian end nhưng chưa confirm hoàn thành
            // List<Booking> pendingCompletions = bookingRepository
            //     .findPendingCompletions(now.minusHours(24), now);

            // for (Booking booking : pendingCompletions) {
            //     notificationService.createSystemNotification(
            //         booking.getRenterId(),
            //         NotificationType.BOOKING_COMPLETION_REMINDER,
            //         String.format("Bạn chưa xác nhận hoàn thành booking '%s'. Vui lòng xác nhận để giải phóng tiền.",
            //             booking.getRoom().getName()
            //         ),
            //         Map.of(
            //             "bookingId", booking.getId(),
            //             "roomName", booking.getRoom().getName()
            //         )
            //     );
            // }

            log.info("Completed booking completion reminders");
        } catch (Exception e) {
            log.error("Error sending booking completion reminders", e);
        }
    }

    /**
     * ============================================
     * LISTING EXPIRATION WARNINGS
     * ============================================
     */

    /**
     * Cảnh báo listings sắp hết hạn (7 ngày)
     * Chạy mỗi ngày lúc 9:00 AM
     */
    @Scheduled(cron = "0 0 9 * * *") // 9:00 AM mỗi ngày
    public void sendListingExpirationWarnings7Days() {
        log.info("Running 7-day listing expiration warnings...");

        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime expirationDate = now.plusDays(7);

            // TODO: Query listings expire trong 7 ngày
            // List<Listing> expiringListings = listingRepository
            //     .findExpiringBetween(expirationDate.minusHours(12), expirationDate.plusHours(12));

            // for (Listing listing : expiringListings) {
            //     if (!listing.hasReceivedWarning7Days()) {
            //         notificationService.createSystemNotification(
            //             listing.getOwner().getId(),
            //             NotificationType.LISTING_PACKAGE_EXPIRING_SOON,
            //             String.format("Gói dịch vụ của bài đăng '%s' sẽ hết hạn trong 7 ngày",
            //                 listing.getRoom().getName()
            //             ),
            //             Map.of(
            //                 "listingId", listing.getId(),
            //                 "roomName", listing.getRoom().getName(),
            //                 "expiresAt", listing.getPackageExpiresAt(),
            //                 "daysRemaining", 7
            //             )
            //         );
            //         // Mark đã gửi warning
            //     }
            // }

            log.info("Completed 7-day listing expiration warnings");
        } catch (Exception e) {
            log.error("Error sending 7-day listing expiration warnings", e);
        }
    }

    /**
     * Cảnh báo listings sắp hết hạn (1 ngày)
     * Chạy mỗi ngày lúc 10:00 AM
     */
    @Scheduled(cron = "0 0 10 * * *") // 10:00 AM mỗi ngày
    public void sendListingExpirationWarnings1Day() {
        log.info("Running 1-day listing expiration warnings...");

        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime expirationDate = now.plusDays(1);

            // Similar logic như trên
            // NotificationType.LISTING_PACKAGE_EXPIRING_TOMORROW

            log.info("Completed 1-day listing expiration warnings");
        } catch (Exception e) {
            log.error("Error sending 1-day listing expiration warnings", e);
        }
    }

    /**
     * Đánh dấu listings đã hết hạn
     * Chạy mỗi ngày lúc 1:00 AM
     */
    @Scheduled(cron = "0 0 1 * * *") // 1:00 AM mỗi ngày
    public void markExpiredListings() {
        log.info("Marking expired listings...");

        try {
            LocalDateTime now = LocalDateTime.now();

            // TODO: Query và update expired listings
            // List<Listing> expiredListings = listingRepository.findExpiredListings(now);

            // for (Listing listing : expiredListings) {
            //     listing.setStatus(ListingStatus.EXPIRED);
            //     listingRepository.save(listing);
            //     
            //     notificationService.createSystemNotification(
            //         listing.getOwner().getId(),
            //         NotificationType.LISTING_EXPIRED,
            //         String.format("Bài đăng '%s' đã hết hạn", listing.getRoom().getName()),
            //         Map.of("listingId", listing.getId())
            //     );
            // }

            log.info("Marked expired listings");
        } catch (Exception e) {
            log.error("Error marking expired listings", e);
        }
    }

    /**
     * ============================================
     * CLEANUP TASKS
     * ============================================
     */

    /**
     * Cleanup old soft-deleted notifications
     * Chạy mỗi tuần vào Chủ nhật lúc 3:00 AM
     */
    @Scheduled(cron = "0 0 3 * * SUN") // 3:00 AM mỗi Chủ nhật
    public void cleanupOldNotifications() {
        log.info("Running cleanup of old notifications...");

        try {
            notificationService.cleanupOldNotifications();
            log.info("Completed cleanup of old notifications");
        } catch (Exception e) {
            log.error("Error cleaning up old notifications", e);
        }
    }

    /**
     * ============================================
     * ADMIN REMINDERS
     * ============================================
     */

    /**
     * Nhắc admin về listings chờ duyệt
     * Chạy mỗi ngày lúc 8:00 AM
     */
    @Scheduled(cron = "0 0 8 * * *") // 8:00 AM mỗi ngày
    public void remindAdminPendingListings() {
        log.info("Reminding admin about pending listings...");

        try {
            // TODO: Query số lượng listings chờ duyệt
            // Long pendingCount = listingRepository.countByStatus(ListingStatus.PENDING);

            // if (pendingCount > 0) {
            //     List<UUID> adminIds = userService.getAllAdminIds();
            //     for (UUID adminId : adminIds) {
            //         notificationService.createSystemNotification(
            //             adminId,
            //             NotificationType.NEW_LISTING_PENDING_APPROVAL,
            //             String.format("Có %d bài đăng chờ duyệt", pendingCount),
            //             Map.of("pendingCount", pendingCount)
            //         );
            //     }
            // }

            log.info("Completed admin pending listings reminder");
        } catch (Exception e) {
            log.error("Error reminding admin about pending listings", e);
        }
    }
}

/**
 * ============================================
 * CRON EXPRESSION REFERENCE
 * ============================================
 *
 * Format: second minute hour day month weekday
 *
 * Examples:
 * - "0 0 * * * *"        → Mỗi giờ vào đầu giờ
 * - "0 */30 * * * *"     → Mỗi 30 phút
        * - "0 0 9 * * *"        → 9:00 AM mỗi ngày
 * - "0 0 1 * * *"        → 1:00 AM mỗi ngày
 * - "0 0 3 * * SUN"      → 3:00 AM mỗi Chủ nhật
 * - "0 0 0 1 * *"        → Đầu tháng (00:00 ngày 1)
 * - "0 0 12 * * MON-FRI" → 12:00 PM các ngày trong tuần
         * ============================================
         */
