package org.rent.room.be.controller;

import lombok.RequiredArgsConstructor;
import org.rent.room.be.base.ApiResponse;
import org.rent.room.be.dto.request.notification.BroadcastNotificationRequest;
import org.rent.room.be.dto.response.notification.NotificationResponse;
import org.rent.room.be.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/my-notification")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getMyNotification(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(ApiResponse.<Page<NotificationResponse>>builder()
                .code(200)
                .result(notificationService.getMyNotification(page, size))
                .message("Get my notification successful")
                .build());
    }

    @PostMapping("/broadcast")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> broadcastNotification(
            @RequestBody BroadcastNotificationRequest request) {

        notificationService.sendNotificationToAllUsers(
                request.getTitle(),
                request.getMessage(),
                request.getLink()
        );

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200)
                .message("Đã gửi thông báo đến tất cả người dùng thành công")
                .build());
    }
}
