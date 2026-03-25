package org.rent.room.be.serviceImpl;

import lombok.RequiredArgsConstructor;
import org.rent.room.be.constant.RoomStatus;
import org.rent.room.be.dto.response.dashboard.OwnerRevenueStatsResponse;
import org.rent.room.be.dto.response.dashboard.OwnerReviewStatsResponse;
import org.rent.room.be.dto.response.dashboard.OwnerRoomSummaryResponse;
import org.rent.room.be.dto.response.dashboard.RevenueData;
import org.rent.room.be.entity.User;
import org.rent.room.be.repository.ReviewRepository;
import org.rent.room.be.repository.RoomRepository;
import org.rent.room.be.repository.WalletTransactionRepository;
import org.rent.room.be.service.OwnerDashboardService;
import org.rent.room.be.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OwnerDashboardServiceImpl implements OwnerDashboardService {

    private final ReviewRepository reviewRepository;
    private final RoomRepository roomRepository;
    private final UserService userService;
    private final WalletTransactionRepository walletTransactionRepository;

    // ----------------------------------------------------------------
    // Rooms Summary
    // ----------------------------------------------------------------

    /**
     * Thống kê phòng của owner đang đăng nhập.
     */
    @Transactional(readOnly = true)
    public OwnerRoomSummaryResponse getRoomSummary() {
        User currentUser = userService.getCurrentUserEntity();
        return buildRoomSummary(currentUser.getUserId());
    }

    /**
     * Thống kê phòng theo userId — dùng cho Admin xem hộ owner.
     */
    @Transactional(readOnly = true)
    public OwnerRoomSummaryResponse getRoomSummaryByUserId(UUID userId) {
        return buildRoomSummary(userId);
    }

    private OwnerRoomSummaryResponse buildRoomSummary(UUID ownerId) {
        long totalRooms       = roomRepository.countByOwnerId(ownerId);
        long activeRooms      = roomRepository.countByOwnerIdAndStatus(ownerId, RoomStatus.ACTIVE);
        long inactiveRooms    = roomRepository.countByOwnerIdAndStatus(ownerId, RoomStatus.INACTIVE);
        long maintenanceRooms = roomRepository.countByOwnerIdAndStatus(ownerId, RoomStatus.MAINTENANCE);

        return OwnerRoomSummaryResponse.builder()
                .totalRooms(totalRooms)
                .activeRooms(activeRooms)
                .maintenanceRooms(maintenanceRooms)
                .inactiveRooms(inactiveRooms)
                .build();
    }

    // ----------------------------------------------------------------
    // Review Stats
    // ----------------------------------------------------------------

    /**
     * Thống kê review của owner đang đăng nhập trong khoảng thời gian.
     * from/to null → mặc định 30 ngày gần nhất.
     */
    @Transactional(readOnly = true)
    public OwnerReviewStatsResponse getReviewStats(LocalDateTime from, LocalDateTime to) {
        User currentUser = userService.getCurrentUserEntity();
        return buildReviewStats(currentUser.getUserId(), from, to);
    }

    /**
     * Thống kê review theo userId — dùng cho Admin xem hộ owner.
     */
    @Transactional(readOnly = true)
    public OwnerReviewStatsResponse getReviewStatsByUserId(UUID userId, LocalDateTime from, LocalDateTime to) {
        return buildReviewStats(userId, from, to);
    }

    private OwnerReviewStatsResponse buildReviewStats(UUID ownerId, LocalDateTime from, LocalDateTime to) {
        if (from == null) from = LocalDateTime.now().minusDays(30);
        if (to == null)   to   = LocalDateTime.now();

        long newReviews    = reviewRepository.countNewReviewsByOwnerInPeriod(ownerId, from, to);
        Double avgInPeriod = reviewRepository.avgRatingByOwnerInPeriod(ownerId, from, to);
        Double overallAvg  = reviewRepository.avgRatingByOwner(ownerId);
        long pendingReply  = reviewRepository.countPendingReplyByOwner(ownerId);

        return OwnerReviewStatsResponse.builder()
                .newReviewsInPeriod(newReviews)
                .avgRatingInPeriod(avgInPeriod)
                .overallAvgRating(overallAvg)
                .pendingReplyCount(pendingReply)
                .build();
    }

    @Transactional(readOnly = true)
    @Override
    public OwnerRevenueStatsResponse getRevenueStats() {

        User currentUser = userService.getCurrentUserEntity();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysAgo = now.minusDays(6).withHour(0).withMinute(0).withSecond(0);

        // 1. Lấy dữ liệu thực tế từ DB
        List<RevenueData> rawDaily = walletTransactionRepository.getDailyRevenue(currentUser.getUserId(), sevenDaysAgo);
        List<RevenueData> rawMonthly = walletTransactionRepository.getMonthlyRevenue(currentUser.getUserId(), now.getYear());

        // 2. Fill đủ 7 ngày
        List<RevenueData> filledDaily = new ArrayList<>();
        DateTimeFormatter dailyFormatter = DateTimeFormatter.ofPattern("dd/MM");

        for (int i = 0; i < 7; i++) {
            String label = sevenDaysAgo.plusDays(i).format(dailyFormatter);
            // Tìm xem trong list từ DB có label này chưa
            BigDecimal amount = rawDaily.stream()
                    .filter(d -> d.getLabel().equals(label))
                    .map(RevenueData::getAmount)
                    .findFirst()
                    .orElse(BigDecimal.ZERO);

            filledDaily.add(new RevenueData(label, amount));
        }

        // 3. Fill đủ 12 tháng
        List<RevenueData> filledMonthly = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            String label = String.format("%02d/%d", i, now.getYear());
            BigDecimal amount = rawMonthly.stream()
                    .filter(m -> m.getLabel().equals(label))
                    .map(RevenueData::getAmount)
                    .findFirst()
                    .orElse(BigDecimal.ZERO);

            filledMonthly.add(new RevenueData(label, amount));
        }

        return new OwnerRevenueStatsResponse(filledDaily, filledMonthly);
    }
}