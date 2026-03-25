package org.rent.room.be.service;

import org.rent.room.be.dto.response.dashboard.OwnerRevenueStatsResponse;
import org.rent.room.be.dto.response.dashboard.OwnerReviewStatsResponse;
import org.rent.room.be.dto.response.dashboard.OwnerRoomSummaryResponse;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

public interface OwnerDashboardService {

    // Rooms Summary
    OwnerRoomSummaryResponse getRoomSummary();

    OwnerRoomSummaryResponse getRoomSummaryByUserId(UUID userId);

    // Review Stats
    OwnerReviewStatsResponse getReviewStats(LocalDateTime from, LocalDateTime to);

    OwnerReviewStatsResponse getReviewStatsByUserId(UUID userId, LocalDateTime from, LocalDateTime to);

    @Transactional(readOnly = true)
    OwnerRevenueStatsResponse getRevenueStats();
}