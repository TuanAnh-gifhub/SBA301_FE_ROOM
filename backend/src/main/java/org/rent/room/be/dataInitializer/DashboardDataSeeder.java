//package org.rent.room.be.dataInitializer;
//
//import lombok.AccessLevel;
//import lombok.RequiredArgsConstructor;
//import lombok.experimental.FieldDefaults;
//import lombok.extern.slf4j.Slf4j;
//import org.rent.room.be.constant.*;
//import org.rent.room.be.entity.*;
//import org.rent.room.be.repository.*;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.core.annotation.Order;
//import org.springframework.stereotype.Component;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.math.BigDecimal;
//import java.math.RoundingMode;
//import java.time.LocalDateTime;
//import java.util.ArrayList;
//import java.util.List;
//import java.util.Random;
//
///**
// * Seed data giả lập để dashboard trông đẹp.
// * - KHÔNG xóa data cũ.
// * - Chạy sau DataInitializer (@Order(2)).
// * - Có guard: nếu đã seed rồi thì bỏ qua.
// */
//@Component
//@Order(2)
//@RequiredArgsConstructor
//@Slf4j
//@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
//public class DashboardDataSeeder implements CommandLineRunner {
//
//    UserRepository userRepository;
//    RentalAreaRepository rentalAreaRepository;
//    BookingRepository bookingRepository;
//    WalletRepository walletRepository;
//    WalletTransactionRepository walletTransactionRepository;
//    ReviewRepository reviewRepository;
//    CommissionConfigRepository commissionConfigRepository;
//
//    // Tỉ lệ hoa hồng mặc định nếu chưa có config
//    static final BigDecimal DEFAULT_COMMISSION_RATE = new BigDecimal("0.10");
//
//    // Guard: chỉ seed khi số booking < 10 (tức là chưa seed dashboard data)
//    static final int MIN_BOOKINGS_TO_SKIP = 10;
//
//    @Override
//    @Transactional
//    public void run(String... args) {
//        long bookingCount = bookingRepository.count();
//        if (bookingCount >= MIN_BOOKINGS_TO_SKIP) {
//            log.info("[DashboardDataSeeder] Đã có {} bookings — bỏ qua seed.", bookingCount);
//            return;
//        }
//
//        log.info("[DashboardDataSeeder] Bắt đầu seed dashboard data...");
//
//        User owner  = userRepository.findByEmail("owner@gmail.com").orElse(null);
//        User renter = userRepository.findByEmail("renter@gmail.com").orElse(null);
//
//        if (owner == null || renter == null) {
//            log.warn("[DashboardDataSeeder] Không tìm thấy owner/renter — chạy DataInitializer trước.");
//            return;
//        }
//
//        List<RentalArea> areas = rentalAreaRepository.findByOwnerId(owner.getUserId());
//        if (areas.isEmpty()) {
//            log.warn("[DashboardDataSeeder] Owner chưa có RentalArea.");
//            return;
//        }
//        RentalArea rentalArea = areas.getFirst();
//
//        // Lấy commission rate
//        BigDecimal commissionRate = commissionConfigRepository
//                .findByOwner(owner)
//                .or(() -> commissionConfigRepository.findByIsDefaultTrue())
//                .map(CommissionConfig::getRate)
//                .orElse(DEFAULT_COMMISSION_RATE);
//
//        // Lấy hoặc tạo wallet cho owner
//        Wallet ownerWallet = walletRepository.findByUser(owner)
//                .orElseGet(() -> {
//                    Wallet w = Wallet.builder()
//                            .user(owner)
//                            .balance(BigDecimal.ZERO)
//                            .frozenAmount(BigDecimal.ZERO)
//                            .walletStatus(WalletStatus.ACTIVE)
//                            .build();
//                    return walletRepository.save(w);
//                });
//
//        // ----------------------------------------------------------------
//        // SEED BOOKINGS + WALLET TRANSACTIONS + REVIEWS
//        // ----------------------------------------------------------------
//        Random rng = new Random(42); // seed cố định → data nhất quán
//        List<Booking>           bookings     = new ArrayList<>();
//        List<WalletTransaction> transactions = new ArrayList<>();
//        List<Review>            reviews      = new ArrayList<>();
//
//        BigDecimal runningBalance = ownerWallet.getBalance();
//
//        // 45 bookings trải đều trong 60 ngày gần nhất
//        // Phân bổ: 30 COMPLETED, 10 BOOKED, 5 CANCELLED
//        int[][] plan = {
//                // {daysAgo, durationHours, priceK, status}
//                // status: 0=COMPLETED, 1=BOOKED, 2=CANCELLED
//                {60,4,200,0},{58,6,300,0},{56,3,150,0},{54,4,200,0},{52,5,250,0},
//                {50,4,200,0},{48,6,300,0},{46,3,150,0},{44,4,200,0},{42,8,400,0},
//                {40,4,200,0},{38,6,300,0},{36,3,150,0},{34,4,200,0},{32,5,250,0},
//                {30,4,200,0},{28,6,300,0},{26,3,150,0},{24,4,200,0},{22,8,400,0},
//                {20,4,200,0},{18,6,300,0},{16,3,150,0},{14,4,200,0},{12,5,250,0},
//                {10,4,200,0},{8,6,300,0}, {6,3,150,0}, {4,4,200,0},{2,8,400,0},
//                // BOOKED (chưa hoàn thành)
//                {1,4,200,1},{1,6,300,1},{1,3,150,1},
//                {0,4,200,1},{0,5,250,1},
//                // CANCELLED
//                {55,4,200,2},{45,3,150,2},{35,4,200,2},{25,6,300,2},{15,4,200,2},
//        };
//
//        for (int[] row : plan) {
//            int daysAgo      = row[0];
//            int durationHrs  = row[1];
//            BigDecimal price = BigDecimal.valueOf(row[2] * 1000L);
//            int statusCode   = row[3];
//
//            LocalDateTime start = LocalDateTime.now()
//                    .minusDays(daysAgo)
//                    .withHour(8 + rng.nextInt(8))
//                    .withMinute(0).withSecond(0).withNano(0);
//            LocalDateTime end   = start.plusHours(durationHrs);
//
//            BookingStatus status = switch (statusCode) {
//                case 1  -> BookingStatus.BOOKED;
//                case 2  -> BookingStatus.CANCELLED;
//                default -> BookingStatus.COMPLETED;
//            };
//
//            Booking b = Booking.builder()
//                    .bookingTitle("Đặt phòng " + rentalArea.getRentalAreaName())
//                    .bookingStatus(status)
//                    .totalPrice(price)
//                    .note("")
//                    .startTime(start)
//                    .endTime(end)
//                    .checkIn(status  == BookingStatus.COMPLETED ? start : null)
//                    .checkOut(status == BookingStatus.COMPLETED ? end   : null)
//                    .escrowReleasedAt(status == BookingStatus.COMPLETED ? end.plusDays(7) : null)
//                    .renter(renter)
//                    .rentalArea(rentalArea)
//                    .bookingType(BookingType.HOURLY)
//                    .disputeFlag(false)
//                    .build();
//            bookings.add(b);
//
//            // Wallet transaction chỉ cho COMPLETED
//            if (status == BookingStatus.COMPLETED) {
//                BigDecimal commission = price.multiply(commissionRate)
//                        .setScale(2, RoundingMode.HALF_UP);
//                BigDecimal income     = price.subtract(commission);
//
//                BigDecimal balBefore = runningBalance;
//                BigDecimal balAfter  = balBefore.add(income);
//                runningBalance = balAfter;
//
//                // BOOKING_INCOME
//                transactions.add(WalletTransaction.builder()
//                        .wallet(ownerWallet)
//                        .type(WalletTxType.BOOKING_INCOME)
//                        .legacyType(WalletTxType.BOOKING_INCOME.name())
//                        .status(WalletTxStatus.COMPLETED)
//                        .legacyStatus(WalletTxStatus.COMPLETED.name())
//                        .amount(income)
//                        .balanceBefore(balBefore)
//                        .balanceAfter(balAfter)
//                        .description("Thu nhập đặt phòng - " + start.toLocalDate())
//                        .build());
//
//                // COMMISSION
//                transactions.add(WalletTransaction.builder()
//                        .wallet(ownerWallet)
//                        .type(WalletTxType.COMMISSION)
//                        .legacyType(WalletTxType.COMMISSION.name())
//                        .status(WalletTxStatus.COMPLETED)
//                        .legacyStatus(WalletTxStatus.COMPLETED.name())
//                        .amount(commission)
//                        .balanceBefore(balAfter)
//                        .balanceAfter(balAfter)
//                        .description("Hoa hồng sàn " + (commissionRate.multiply(BigDecimal.valueOf(100)).intValue()) + "% - " + start.toLocalDate())
//                        .build());
//            }
//        }
//
//        // Lưu bookings trước (reviews cần booking_id)
//        bookingRepository.saveAll(bookings);
//
//        // Cập nhật balance ví
//        ownerWallet.setBalance(runningBalance);
//        walletRepository.save(ownerWallet);
//
//        // Lưu transactions
//        walletTransactionRepository.saveAll(transactions);
//
//        // ----------------------------------------------------------------
//        // REVIEWS — chỉ cho COMPLETED bookings, xen kẽ có reply/không
//        // ----------------------------------------------------------------
//        String[] comments = {
//                "Phòng rất sạch sẽ, thoáng mát, wifi nhanh. Sẽ quay lại!",
//                "Không gian yên tĩnh, phù hợp để học nhóm. Rất hài lòng.",
//                "Thiết bị đầy đủ, máy chiếu hoạt động tốt. 5 sao!",
//                "Nhân viên hỗ trợ nhiệt tình, đặt phòng dễ dàng.",
//                "Phòng ổn nhưng điều hòa hơi yếu vào buổi chiều.",
//                "Giá hợp lý, chất lượng tốt. Recommend cho bạn bè.",
//                "Phòng rộng rãi, bàn ghế thoải mái. Hài lòng.",
//                "Wifi đôi lúc chập chờn nhưng nhìn chung ổn.",
//                "Vị trí thuận tiện, gần trung tâm. Sẽ book lại.",
//                "Phòng sạch, view đẹp, không gian chuyên nghiệp.",
//        };
//        int[] ratings = {5, 5, 5, 4, 4, 4, 5, 3, 4, 5};
//
//        // Lấy 10 booking COMPLETED đầu tiên để tạo review
//        List<Booking> completedBookings = bookings.stream()
//                .filter(b -> b.getBookingStatus() == BookingStatus.COMPLETED)
//                .limit(10)
//                .toList();
//
//        for (int i = 0; i < completedBookings.size(); i++) {
//            Booking b = completedBookings.get(i);
//            Review review = Review.builder()
//                    .reviewer(renter)
//                    .booking(b)
//                    .rentalArea(rentalArea)
//                    .rating(ratings[i % ratings.length])
//                    .comment(comments[i % comments.length])
//                    .status(ReviewStatus.APPROVED)
//                    .helpfulCount(rng.nextInt(10))
//                    .build();
//            reviews.add(review);
//        }
//
//        reviewRepository.saveAll(reviews);
//
//        // ----------------------------------------------------------------
//        // Cập nhật averageRating + totalReviews trên RentalArea
//        // ----------------------------------------------------------------
//        double avgRating = reviews.stream()
//                .mapToInt(Review::getRating)
//                .average()
//                .orElse(0.0);
//        rentalArea.setAverageRating(BigDecimal.valueOf(avgRating).setScale(2, RoundingMode.HALF_UP));
//        rentalArea.setTotalReviews(reviews.size());
//        rentalAreaRepository.save(rentalArea);
//
//        log.info("========================================================");
//        log.info("[DashboardDataSeeder] ✅ Seed xong!");
//        log.info("  Bookings tạo mới : {}", bookings.size());
//        log.info("  Transactions      : {}", transactions.size());
//        log.info("  Reviews           : {}", reviews.size());
//        log.info("  Balance ví owner  : {}", runningBalance);
//        log.info("  Avg rating        : {}", avgRating);
//        log.info("========================================================");
//    }
//}