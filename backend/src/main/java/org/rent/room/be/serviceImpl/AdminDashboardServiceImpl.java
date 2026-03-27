package org.rent.room.be.serviceImpl;

import lombok.RequiredArgsConstructor;
import org.rent.room.be.dto.response.dashboard.AdminChartResponse;
import org.rent.room.be.entity.Booking;
import org.rent.room.be.entity.User;
import org.rent.room.be.entity.WalletTransaction;
import org.rent.room.be.repository.BookingRepository;
import org.rent.room.be.repository.PostRepository;
import org.rent.room.be.repository.UserRepository;
import org.rent.room.be.repository.WalletTransactionRepository;
import org.rent.room.be.service.AdminDashboardService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final BookingRepository bookingRepository;
    private final WalletTransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    @Override
    public AdminChartResponse getChartData() {
        LocalDateTime now = LocalDateTime.now();

        LocalDateTime endOfDay = now.with(LocalTime.MAX);

        // 1. Mốc thời gian
        LocalDateTime start7Days = now.minusDays(6).with(LocalTime.MIN);
        LocalDateTime startOfYear = now.withDayOfYear(1).with(LocalTime.MIN);

        // 2. Query Data 7 ngày
        List<Booking> bookings7Days = bookingRepository.findByCreatedAtBetween(start7Days, now);
        List<WalletTransaction> tx7Days = transactionRepository.getRevenueTransactions(start7Days, endOfDay);
        List<User> users7Days = userRepository.findByCreatedAtBetween(start7Days, now);

        // 3. Query Data 12 tháng
        List<Booking> bookingsYear = bookingRepository.findByCreatedAtBetween(startOfYear, now);
        List<WalletTransaction> txYear = transactionRepository.getRevenueTransactions(startOfYear, endOfDay);
        List<User> usersYear = userRepository.findByCreatedAtBetween(startOfYear, now);

        List<AdminChartResponse.StatusDataDTO> revenueStatus = List.of(
                new AdminChartResponse.StatusDataDTO("Hoàn tất (Net)",
                        transactionRepository.sumAmountByStatusAndType("COMPLETED", "BOOKING_INCOME"), "#10b981"),
                new AdminChartResponse.StatusDataDTO("Đang giữ (Escrow)",
                        transactionRepository.sumAmountByStatusAndType("PENDING", "BOOKING_INCOME"), "#f59e0b"),
                new AdminChartResponse.StatusDataDTO("Đã hủy/Lỗi",
                        transactionRepository.sumAmountByStatusAndType("CANCELLED", "BOOKING_INCOME"), "#ef4444")
        );

        List<AdminChartResponse.StatusDataDTO> bookingStatus = List.of(
                new AdminChartResponse.StatusDataDTO("Thành công", bookingRepository.countByNativeStatus("COMPLETED"), "#10b981"),
                new AdminChartResponse.StatusDataDTO("Chờ xác nhận", bookingRepository.countByNativeStatus("PENDING"), "#3b82f6"),
                new AdminChartResponse.StatusDataDTO("Đã hủy", bookingRepository.countByNativeStatus("CANCELLED"), "#ef4444")
        );

        List<AdminChartResponse.StatusDataDTO> roomStatus = List.of(
                new AdminChartResponse.StatusDataDTO("Đang hiển thị",
                        postRepository.countByNativeStatus("PUBLISHED"), "#10b981"), // Xanh lá: PUBLISHED
                new AdminChartResponse.StatusDataDTO("Chờ duyệt",
                        postRepository.countByNativeStatus("PENDING"), "#3b82f6"),   // Xanh dương: PENDING
                new AdminChartResponse.StatusDataDTO("Đã ẩn/Khóa",
                        postRepository.countByNativeStatus("HIDDEN"), "#ef4444")     // Đỏ: HIDDEN (Bạn có thể cộng thêm DELETED nếu muốn)
        );

        // 1. TÍNH MỐC THỜI GIAN
        LocalDateTime startOfThisMonth = now.withDayOfMonth(1).with(LocalTime.MIN);
        LocalDateTime startOfLastMonth = now.minusMonths(1).withDayOfMonth(1).with(LocalTime.MIN);
        LocalDateTime endOfLastMonth = now.minusMonths(1).with(java.time.temporal.TemporalAdjusters.lastDayOfMonth()).with(LocalTime.MAX);

        // 2. QUERY TỔNG DOANH THU
        BigDecimal currentMonthRev = transactionRepository.sumAmountByDateAndStatusAndType(
                startOfThisMonth, endOfDay, "COMPLETED", "BOOKING_INCOME"); // ⚠️ Thay Enum nếu cần

        BigDecimal lastMonthRev = transactionRepository.sumAmountByDateAndStatusAndType(
                startOfLastMonth, endOfLastMonth, "COMPLETED", "BOOKING_INCOME");

        // 3. TÍNH % TĂNG TRƯỞNG
        double growth = 0.0;
        if (lastMonthRev.compareTo(BigDecimal.ZERO) > 0) {
            growth = currentMonthRev.subtract(lastMonthRev)
                    .divide(lastMonthRev, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100))
                    .doubleValue();
        } else if (currentMonthRev.compareTo(BigDecimal.ZERO) > 0) {
            growth = 100.0; // Nếu tháng trước = 0 mà tháng này có tiền -> Tăng 100%
        }

        long pendingCount = postRepository.countByNativeStatus("PENDING");

        return AdminChartResponse.builder()
                .bookingDaily(buildBookingDaily(now, bookings7Days))
                .revenueDaily(buildRevenueDaily(now, tx7Days))
                .bookingMonthly(buildBookingMonthly(bookingsYear))
                .revenueMonthly(buildRevenueMonthly(txYear))
                .usersDaily(buildUsersDaily(now, users7Days))
                .usersMonthly(buildUsersMonthly(usersYear))
                .revenueByStatus(revenueStatus)
                .bookingByStatus(bookingStatus)
                .roomByStatus(roomStatus)
                .currentMonthRevenue(currentMonthRev)
                .currentMonthGMV(currentMonthRev)
                .revenueGrowth(growth)
                .pendingPosts(pendingCount)
                .build();
    }

    // --- CÁC HÀM GOM NHÓM THEO NGÀY (7 NGÀY QUA) ---

    private List<AdminChartResponse.ChartDataDTO> buildBookingDaily(LocalDateTime now, List<Booking> bookings) {
        List<AdminChartResponse.ChartDataDTO> result = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = now.toLocalDate().minusDays(i);
            long count = bookings.stream()
                    .filter(b -> b.getCreatedAt().toLocalDate().equals(date))
                    .count();
            result.add(new AdminChartResponse.ChartDataDTO("Ngày " + date.getDayOfMonth(), count));
        }
        return result;
    }

    private List<AdminChartResponse.ChartDataDTO> buildRevenueDaily(LocalDateTime now, List<WalletTransaction> txs) {
        List<AdminChartResponse.ChartDataDTO> result = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = now.toLocalDate().minusDays(i);
            BigDecimal sum = txs.stream()
                    .filter(t -> t.getCreatedAt().toLocalDate().equals(date))
                    .map(WalletTransaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            result.add(new AdminChartResponse.ChartDataDTO("Ngày " + date.getDayOfMonth(), sum));
        }
        return result;
    }

    // --- CÁC HÀM GOM NHÓM THEO THÁNG (12 THÁNG TRONG NĂM) ---

    private List<AdminChartResponse.ChartDataDTO> buildBookingMonthly(List<Booking> bookings) {
        List<AdminChartResponse.ChartDataDTO> result = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            int month = i;
            long count = bookings.stream()
                    .filter(b -> b.getCreatedAt().getMonthValue() == month)
                    .count();
            result.add(new AdminChartResponse.ChartDataDTO("Tháng " + month, count));
        }
        return result;
    }

    private List<AdminChartResponse.ChartDataDTO> buildRevenueMonthly(List<WalletTransaction> txs) {
        List<AdminChartResponse.ChartDataDTO> result = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            int month = i;
            BigDecimal sum = txs.stream()
                    .filter(t -> t.getCreatedAt().getMonthValue() == month)
                    .map(WalletTransaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            result.add(new AdminChartResponse.ChartDataDTO("Tháng " + month, sum));
        }
        return result;
    }

    private List<AdminChartResponse.ChartDataDTO> buildUsersDaily(LocalDateTime now, List<User> users) {
        List<AdminChartResponse.ChartDataDTO> result = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = now.toLocalDate().minusDays(i);
            long count = users.stream()
                    .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().toLocalDate().equals(date))
                    .count();
            result.add(new AdminChartResponse.ChartDataDTO("Ngày " + date.getDayOfMonth(), count));
        }
        return result;
    }

    private List<AdminChartResponse.ChartDataDTO> buildUsersMonthly(List<User> users) {
        List<AdminChartResponse.ChartDataDTO> result = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            int month = i;
            long count = users.stream()
                    .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().getMonthValue() == month)
                    .count();
            result.add(new AdminChartResponse.ChartDataDTO("Tháng " + month, count));
        }
        return result;
    }
}