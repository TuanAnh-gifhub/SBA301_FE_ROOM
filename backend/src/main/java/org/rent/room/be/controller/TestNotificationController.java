package org.rent.room.be.controller;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.rent.room.be.constant.NotificationType;
import org.rent.room.be.service.NotificationService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * TEST CONTROLLER - CHỈ DÙNG ĐỂ TEST
 * XÓA HOẶC DISABLE TRONG PRODUCTION!
 */
@RestController
@RequestMapping("/api/test/notifications")
@RequiredArgsConstructor
@Tag(name = "Test Notifications", description = "API test notifications - CHỈ DÙNG ĐỂ TEST!")
public class TestNotificationController {

    private final NotificationService notificationService;

    /**
     * TEST 1: Tạo notification đơn giản nhất
     *
     * Test: GET http://localhost:8080/api/test/notifications/simple?userId={uuid}
     */
    @GetMapping("/simple")
    @Operation(summary = "Test tạo 1 notification đơn giản")
    public ResponseEntity<Map<String, Object>> createSimpleNotification(
            @RequestParam String userId
    ) {
        try {
            UUID recipientId = UUID.fromString(userId);

            Map<String, Object> data = new HashMap<>();
            data.put("test", true);
            data.put("timestamp", LocalDateTime.now());

            var notification = notificationService.createSystemNotification(
                    recipientId,
                    NotificationType.SYSTEM_ANNOUNCEMENT,
                    "Đây là test notification đơn giản!",
                    data
            );

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Notification created successfully!",
                    "notificationId", notification.getNotificationId(),
                    "type", notification.getNotificationType(),
                    "recipientId", recipientId
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }

    /**
     * TEST 2: Tạo booking notification (giả lập booking)
     *
     * Test: GET http://localhost:8080/api/test/notifications/booking
     *       ?renterId={uuid}&ownerId={uuid}
     */
    @GetMapping("/booking")
    @Operation(summary = "Test tạo booking notifications (cho cả renter và owner)")
    public ResponseEntity<Map<String, Object>> createBookingNotification(
            @RequestParam String renterId,
            @RequestParam String ownerId
    ) {
        try {
            UUID renterUuid = UUID.fromString(renterId);
            UUID ownerUuid = UUID.fromString(ownerId);

            // Tạo notification cho RENTER
            Map<String, Object> renterData = new HashMap<>();
            renterData.put("bookingId", UUID.randomUUID().toString());
            renterData.put("roomName", "Phòng Test A101");
            renterData.put("amount", 500000);
            renterData.put("startTime", LocalDateTime.now().plusDays(1));

            var renterNotif = notificationService.createSystemNotification(
                    renterUuid,
                    NotificationType.BOOKING_CREATED,
                    "Bạn đã đặt phòng 'Phòng Test A101' thành công! Tiền đang được giữ an toàn.",
                    renterData
            );

            // Tạo notification cho OWNER
            Map<String, Object> ownerData = new HashMap<>();
            ownerData.put("bookingId", renterData.get("bookingId"));
            ownerData.put("roomName", "Phòng Test A101");
            ownerData.put("renterName", "Test Renter");
            ownerData.put("amount", 500000);

            var ownerNotif = notificationService.createSystemNotification(
                    ownerUuid,
                    NotificationType.NEW_BOOKING_REQUEST,
                    "Bạn có yêu cầu đặt phòng mới cho 'Phòng Test A101' từ Test Renter",
                    ownerData
            );

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "2 notifications created!",
                    "renterNotification", renterNotif.getNotificationId(),
                    "ownerNotification", ownerNotif.getNotificationId()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }

    /**
     * TEST 3: Tạo nhiều notifications cùng lúc
     *
     * Test: GET http://localhost:8080/api/test/notifications/multiple
     *       ?userId={uuid}&count=5
     */
    @GetMapping("/multiple")
    @Operation(summary = "Test tạo nhiều notifications cùng lúc")
    public ResponseEntity<Map<String, Object>> createMultipleNotifications(
            @RequestParam String userId,
            @RequestParam(defaultValue = "5") int count
    ) {
        try {
            UUID recipientId = UUID.fromString(userId);

            NotificationType[] types = {
                    NotificationType.BOOKING_CREATED,
                    NotificationType.WALLET_TOPPED_UP,
                    NotificationType.LISTING_PUBLISHED,
                    NotificationType.PAYMENT_RECEIVED,
                    NotificationType.SYSTEM_ANNOUNCEMENT
            };

            for (int i = 0; i < count; i++) {
                NotificationType type = types[i % types.length];

                Map<String, Object> data = new HashMap<>();
                data.put("index", i);
                data.put("timestamp", LocalDateTime.now());

                notificationService.createSystemNotification(
                        recipientId,
                        type,
                        String.format("Test notification #%d - %s", i + 1, type.getDisplayName()),
                        data
                );
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", count + " notifications created!",
                    "userId", recipientId
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }

    /**
     * TEST 4: Test tất cả notification types
     *
     * Test: GET http://localhost:8080/api/test/notifications/all-types?userId={uuid}
     */
    @GetMapping("/all-types")
    @Operation(summary = "Test tạo notification cho mọi type")
    public ResponseEntity<Map<String, Object>> createAllTypes(
            @RequestParam String userId
    ) {
        try {
            UUID recipientId = UUID.fromString(userId);
            int count = 0;

            // Test một vài types phổ biến
            NotificationType[] types = {
                    NotificationType.BOOKING_CREATED,
                    NotificationType.BOOKING_CONFIRMED,
                    NotificationType.BOOKING_REJECTED,
                    NotificationType.WALLET_TOPPED_UP,
                    NotificationType.PAYMENT_RECEIVED,
                    NotificationType.LISTING_PUBLISHED,
                    NotificationType.LISTING_PACKAGE_EXPIRING_SOON,
                    NotificationType.SYSTEM_ANNOUNCEMENT
            };

            for (NotificationType type : types) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", type.name());
                data.put("category", type.getCategory().name());

                notificationService.createSystemNotification(
                        recipientId,
                        type,
                        "Test: " + type.getDisplayName(),
                        data
                );
                count++;
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", count + " notification types created!",
                    "userId", recipientId,
                    "types", types
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }

    /**
     * TEST 5: Lấy userId từ database để test
     *
     * Test: GET http://localhost:8080/api/test/notifications/sample-users
     */
    @GetMapping("/sample-users")
    @Operation(summary = "Lấy sample user IDs để test")
    public ResponseEntity<Map<String, Object>> getSampleUsers() {
        // TODO: Lấy user IDs thật từ database
        // Tạm thời return hướng dẫn
        return ResponseEntity.ok(Map.of(
                "message", "Hãy lấy user ID từ database của bạn",
                "instruction", "SELECT user_id FROM users LIMIT 5;",
                "example", "550e8400-e29b-41d4-a716-446655440000"
        ));
    }
}
