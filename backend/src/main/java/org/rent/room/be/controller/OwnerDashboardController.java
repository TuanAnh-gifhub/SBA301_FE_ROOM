package org.rent.room.be.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.rent.room.be.base.ApiResponse;
import org.rent.room.be.dto.response.dashboard.OwnerReviewStatsResponse;
import org.rent.room.be.dto.response.dashboard.OwnerRoomSummaryResponse;
import org.rent.room.be.service.OwnerDashboardService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/owner/dashboard")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "19. Owner Dashboard")
public class OwnerDashboardController {

    OwnerDashboardService ownerDashboardService;

    // ----------------------------------------------------------------
    // GET /owner/dashboard/rooms-summary
    // ----------------------------------------------------------------

    @Operation(summary = "Thống kê phòng: tổng phòng, đang hoạt động, bảo trì, ngừng hoạt động")
    @GetMapping("/rooms-summary")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<OwnerRoomSummaryResponse>> getRoomSummary() {
        return ResponseEntity.ok(
                ApiResponse.<OwnerRoomSummaryResponse>builder()
                        .code(200)
                        .message("Lấy thống kê phòng thành công")
                        .result(ownerDashboardService.getRoomSummary())
                        .build()
        );
    }

    // ----------------------------------------------------------------
    // GET /owner/dashboard/review-stats?from=&to=
    // ----------------------------------------------------------------

    @Operation(summary = "Thống kê review: số mới, avg rating, số chưa reply trong kỳ")
    @GetMapping("/review-stats")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<OwnerReviewStatsResponse>> getReviewStats(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime from,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime to
    ) {
        return ResponseEntity.ok(
                ApiResponse.<OwnerReviewStatsResponse>builder()
                        .code(200)
                        .message("Lấy thống kê review thành công")
                        .result(ownerDashboardService.getReviewStats(from, to))
                        .build()
        );
    }

    // ----------------------------------------------------------------
    // Admin variants — tái sử dụng cho Admin dashboard
    // ----------------------------------------------------------------

    @Operation(summary = "[Admin] Xem thống kê phòng của một owner")
    @GetMapping("/admin/rooms-summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OwnerRoomSummaryResponse>> getRoomSummaryForAdmin(
            @RequestParam UUID userId
    ) {
        return ResponseEntity.ok(
                ApiResponse.<OwnerRoomSummaryResponse>builder()
                        .code(200)
                        .message("Lấy thống kê phòng thành công")
                        .result(ownerDashboardService.getRoomSummaryByUserId(userId))
                        .build()
        );
    }

    @Operation(summary = "[Admin] Xem thống kê review của một owner")
    @GetMapping("/admin/review-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OwnerReviewStatsResponse>> getReviewStatsForAdmin(
            @RequestParam UUID userId,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime from,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime to
    ) {
        return ResponseEntity.ok(
                ApiResponse.<OwnerReviewStatsResponse>builder()
                        .code(200)
                        .message("Lấy thống kê review thành công")
                        .result(ownerDashboardService.getReviewStatsByUserId(userId, from, to))
                        .build()
        );
    }
}