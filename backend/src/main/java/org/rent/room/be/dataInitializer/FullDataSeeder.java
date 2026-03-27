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
//import java.util.*;
//
///**
// * FullDataSeeder — seed đầy đủ:
// *   • 3 tòa nhà mới (RentalArea) với ảnh thật từ Unsplash
// *   • Mỗi tòa có 3-4 phòng (Room), mỗi phòng có 2 RoomCopy
// *   • Mỗi phòng có 1 Post (status = PUBLISHED) với ảnh nhúng trong content
// *   • Nhiều Booking trải đều theo thời gian
// *   • Booking COMPLETED → có Review kèm theo
// *
// * Guard: chỉ chạy khi số Post < 5 (tức chưa seed).
// * Thứ tự: @Order(3) — chạy sau DataInitializer (1) và DashboardDataSeeder (2).
// */
//@Component
//@Order(3)
//@RequiredArgsConstructor
//@Slf4j
//@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
//public class FullDataSeeder implements CommandLineRunner {
//
//    UserRepository             userRepository;
//    CityRepository             cityRepository;
//    CategoryRepository         categoryRepository;
//    AmenityRepository          amenityRepository;
//    RentalAreaRepository       rentalAreaRepository;
//    RoomRepository             roomRepository;
//    RoomCopyRepository         roomCopyRepository;
//    PostRepository             postRepository;
//    BookingRepository          bookingRepository;
//    ReviewRepository           reviewRepository;
//
//    // ----------------------------------------------------------------
//    // ẢNH THẬT TỪ UNSPLASH (stable URL, không cần API key)
//    // Định dạng: https://images.unsplash.com/photo-{ID}?w=1200&q=80
//    // ----------------------------------------------------------------
//    static final String[] ROOM_IMAGES = {
//            "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&q=80", // phòng học hiện đại
//            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80", // phòng họp văn phòng
//            "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80", // phòng học đại học
//            "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&q=80", // bảng trắng & bàn ghế
//            "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=1200&q=80", // phòng lab máy tính
//            "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=1200&q=80", // phòng thuyết trình
//            "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80", // campus đại học
//            "https://images.unsplash.com/photo-1591123120675-6f7f1aae0e38?w=1200&q=80", // phòng nhóm nhỏ
//            "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=1200&q=80", // thư viện học tập
//            "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80", // lớp học truyền thống
//            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80", // laptop & bàn làm việc
//            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80", // tòa nhà hiện đại
//    };
//
//    static final int GUARD_POST_COUNT = 5;
//
//    @Override
//    @Transactional
//    public void run(String... args) {
//        if (postRepository.count() >= GUARD_POST_COUNT) {
//            log.info("[FullDataSeeder] Đã có {} posts — bỏ qua seed.", postRepository.count());
//            return;
//        }
//
//        log.info("[FullDataSeeder] Bắt đầu seed dữ liệu đầy đủ...");
//
//        // ---- Lấy các user cần thiết ----
//        User owner  = userRepository.findByEmail("owner@gmail.com").orElse(null);
//        User renter = userRepository.findByEmail("renter@gmail.com").orElse(null);
//        if (owner == null || renter == null) {
//            log.warn("[FullDataSeeder] Không tìm thấy owner/renter. Chạy DataInitializer trước.");
//            return;
//        }
//
//        // ---- Lấy cities ----
//        List<City> cities = cityRepository.findAll();
//        if (cities.size() < 3) {
//            log.warn("[FullDataSeeder] Chưa đủ city. Cần ít nhất 3.");
//            return;
//        }
//
//        // ---- Lấy categories & amenities ----
//        List<Category> categories = categoryRepository.findAll();
//        List<Amenity>  amenities  = amenityRepository.findAll();
//        Set<Amenity>   amenitySet = new HashSet<>(amenities);
//
//        // ================================================================
//        // TÒA NHÀ 1 — TP. Hồ Chí Minh — Trung tâm học tập EduSpace
//        // ================================================================
//        RentalArea area1 = rentalAreaRepository.save(
//                RentalArea.builder()
//                        .rentalAreaName("EduSpace Quận 1")
//                        .address("123 Nguyễn Huệ, Phường Bến Nghé, Quận 1")
//                        .contactName("Nguyễn Văn Minh")
//                        .contactPhone("0901234567")
//                        .owner(owner)
//                        .city(cities.get(1)) // TP. HCM
//                        .status(RentalAreaStatus.ACTIVE)
//                        .averageRating(BigDecimal.ZERO)
//                        .totalReviews(0)
//                        .build()
//        );
//
//        // ================================================================
//        // TÒA NHÀ 2 — Hà Nội — StudyHub
//        // ================================================================
//        RentalArea area2 = rentalAreaRepository.save(
//                RentalArea.builder()
//                        .rentalAreaName("StudyHub Cầu Giấy")
//                        .address("45 Xuân Thủy, Phường Dịch Vọng, Cầu Giấy")
//                        .contactName("Trần Thị Lan")
//                        .contactPhone("0912345678")
//                        .owner(owner)
//                        .city(cities.get(0)) // Hà Nội
//                        .status(RentalAreaStatus.ACTIVE)
//                        .averageRating(BigDecimal.ZERO)
//                        .totalReviews(0)
//                        .build()
//        );
//
//        // ================================================================
//        // TÒA NHÀ 3 — Đà Nẵng — ClassRoom Da Nang
//        // ================================================================
//        RentalArea area3 = rentalAreaRepository.save(
//                RentalArea.builder()
//                        .rentalAreaName("ClassRoom Đà Nẵng")
//                        .address("88 Lê Duẩn, Phường Hải Châu 1, Hải Châu")
//                        .contactName("Lê Hoàng Nam")
//                        .contactPhone("0923456789")
//                        .owner(owner)
//                        .city(cities.get(3)) // Đà Nẵng
//                        .status(RentalAreaStatus.ACTIVE)
//                        .averageRating(BigDecimal.ZERO)
//                        .totalReviews(0)
//                        .build()
//        );
//
//        // ================================================================
//        // SEED ROOMS + ROOMCOPIES + POSTS cho từng tòa nhà
//        // ================================================================
//        List<Room> allRooms   = new ArrayList<>();
//        List<Post> allPosts   = new ArrayList<>();
//
//        // --- TÒA 1: 4 phòng ---
//        allRooms.addAll(seedRoomsForArea(area1, owner, categories, amenitySet, allPosts, 0));
//        // --- TÒA 2: 3 phòng ---
//        allRooms.addAll(seedRoomsForArea(area2, owner, categories, amenitySet, allPosts, 4));
//        // --- TÒA 3: 3 phòng ---
//        allRooms.addAll(seedRoomsForArea(area3, owner, categories, amenitySet, allPosts, 7));
//
//        // ================================================================
//        // SEED BOOKINGS + REVIEWS
//        // ================================================================
//        int totalBookings = 0, totalReviews = 0;
//        Random rng = new Random(99);
//
//        for (RentalArea area : List.of(area1, area2, area3)) {
//            int[] counts = seedBookingsAndReviews(area, renter, rng);
//            totalBookings += counts[0];
//            totalReviews  += counts[1];
//
//            // Cập nhật averageRating & totalReviews lên RentalArea
//            List<Review> areaReviews = reviewRepository.findAll().stream()
//                    .filter(r -> r.getRentalArea().getRentalAreaId().equals(area.getRentalAreaId()))
//                    .toList();
//            if (!areaReviews.isEmpty()) {
//                double avg = areaReviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
//                area.setAverageRating(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
//                area.setTotalReviews(areaReviews.size());
//                rentalAreaRepository.save(area);
//            }
//        }
//
//        log.info("========================================================");
//        log.info("[FullDataSeeder] ✅ Seed hoàn tất!");
//        log.info("  Tòa nhà mới    : 3");
//        log.info("  Phòng mới      : {}", allRooms.size());
//        log.info("  Posts mới      : {}", allPosts.size());
//        log.info("  Bookings mới   : {}", totalBookings);
//        log.info("  Reviews mới    : {}", totalReviews);
//        log.info("========================================================");
//    }
//
//    // ================================================================
//    // HELPER: Tạo rooms + roomcopies + posts cho 1 tòa nhà
//    // imageOffset: offset vào mảng ROOM_IMAGES để mỗi tòa dùng ảnh khác nhau
//    // ================================================================
//    private List<Room> seedRoomsForArea(
//            RentalArea area,
//            User owner,
//            List<Category> categories,
//            Set<Amenity> amenitySet,
//            List<Post> allPosts,
//            int imageOffset
//    ) {
//        List<Room> rooms = new ArrayList<>();
//
//        // Dữ liệu từng phòng: {roomName, capacity, price, categoryIdx, description ngắn}
//        Object[][] roomData = getRoomDataForArea(area.getRentalAreaName());
//
//        for (int i = 0; i < roomData.length; i++) {
//            String  roomName    = (String)  roomData[i][0];
//            int     capacity    = (int)     roomData[i][1];
//            long    priceVal    = (long)    roomData[i][2];
//            int     catIdx      = (int)     roomData[i][3];
//            String  shortDesc   = (String)  roomData[i][4];
//
//            Category cat = categories.isEmpty() ? null : categories.get(catIdx % categories.size());
//            String   imgUrl = ROOM_IMAGES[(imageOffset + i) % ROOM_IMAGES.length];
//            String   imgUrl2 = ROOM_IMAGES[(imageOffset + i + 1) % ROOM_IMAGES.length];
//
//            // --- ROOM ---
//            Room room = roomRepository.save(
//                    Room.builder()
//                            .roomName(roomName)
//                            .description(shortDesc)
//                            .roomStatus(RoomStatus.ACTIVE)
//                            .capacity(capacity)
//                            .area((double)(capacity * 2 + 10)) // ước tính diện tích
//                            .amenities(amenitySet)
//                            .rentalArea(area)
//                            .category(cat)
//                            .price(BigDecimal.valueOf(priceVal))
//                            .build()
//            );
//
//// --- ROOM COPIES (2 bản copy mỗi phòng) ---
//            String prefix = area.getRentalAreaName().substring(0, Math.min(3, area.getRentalAreaName().length()));
//            String roomPrefix = roomName.substring(0, 2).toUpperCase();
//
//            roomCopyRepository.save(RoomCopy.builder()
//                    // Thêm biến i vào để không bao giờ trùng: VD: Edu-PH-0-01, Edu-PH-1-01
//                    .roomCode(prefix + "-" + roomPrefix + "-" + i + "-01")
//                    .roomCopyStatus(RoomCopyStatus.AVAILABLE)
//                    .room(room)
//                    .build());
//
//            roomCopyRepository.save(RoomCopy.builder()
//                    // Thêm biến i vào: VD: Edu-PH-0-02, Edu-PH-1-02
//                    .roomCode(prefix + "-" + roomPrefix + "-" + i + "-02")
//                    .roomCopyStatus(RoomCopyStatus.AVAILABLE)
//                    .room(room)
//                    .build());
//
//            // --- POST (PUBLISHED) ---
//            String postContent = buildPostContent(roomName, area.getAddress(), capacity,
//                    priceVal, shortDesc, imgUrl, imgUrl2);
//            Post post = postRepository.save(
//                    Post.builder()
//                            .title(roomName + " — " + area.getRentalAreaName())
//                            .content(postContent)
//                            .postStatus(PostStatus.PUBLISHED)
//                            .user(owner)
//                            .room(room)
//                            .rentalArea(area)
//                            .build()
//            );
//
//            rooms.add(room);
//            allPosts.add(post);
//
//            log.info("[FullDataSeeder]   → Room '{}' + Post PUBLISHED + 2 RoomCopy", roomName);
//        }
//
//        return rooms;
//    }
//
//    // ================================================================
//    // HELPER: Dữ liệu phòng theo từng tòa
//    // ================================================================
//    private Object[][] getRoomDataForArea(String areaName) {
//        if (areaName.contains("EduSpace")) {
//            return new Object[][] {
//                    {"Phòng học 25 người A1",  25, 80_000L,  0, "Phòng học hiện đại với bảng thông minh, máy chiếu 4K, wifi 1Gbps. Không gian yên tĩnh, điều hòa 2 chiều."},
//                    {"Phòng họp VIP B1",       12, 120_000L, 1, "Phòng họp cao cấp, TV 75 inch, hệ thống âm thanh chuyên nghiệp, bàn oval phong cách."},
//                    {"Phòng Lab Máy Tính C1",  20, 150_000L, 2, "20 máy tính i7-12th Gen, RAM 16GB, SSD 512GB. Phù hợp lập trình, thiết kế đồ họa."},
//                    {"Phòng Nhóm Mini D1",      8,  60_000L, 3, "Phòng nhỏ ấm cúng cho nhóm 4-8 người. Bảng trắng, ổ điện đầy đủ, view đẹp."},
//            };
//        } else if (areaName.contains("StudyHub")) {
//            return new Object[][] {
//                    {"Phòng Học 30 Người A",   30,  75_000L, 0, "Phòng học rộng rãi, ghế ergonomic, máy chiếu laser, hệ thống loa surround."},
//                    {"Phòng Thuyết Trình B",   40, 100_000L, 4, "Phòng thuyết trình 40 chỗ, sân khấu nhỏ, micro không dây, livestream-ready."},
//                    {"Phòng Seminar C",        20,  90_000L, 1, "Bàn chữ U kiểu seminar, TV 65 inch, camera hội nghị Logitech, phù hợp workshop."},
//            };
//        } else { // ClassRoom Đà Nẵng
//            return new Object[][] {
//                    {"Phòng Học Cơ Bản P1",   25,  65_000L, 0, "Phòng học tiêu chuẩn, bảng trắng lớn, máy chiếu HD, wifi ổn định. View biển Đà Nẵng."},
//                    {"Phòng Họp Nhỏ P2",      10,  85_000L, 1, "Phòng họp compact cho team nhỏ, TV 55 inch, bàn hội nghị hiện đại."},
//                    {"Phòng Đào Tạo P3",      35,  95_000L, 0, "Phòng đào tạo lớn nhất, 2 máy chiếu, hệ thống microphone, phù hợp hội thảo."},
//            };
//        }
//    }
//
//    // ================================================================
//    // HELPER: Tạo content HTML/Markdown cho Post (nhúng ảnh thật)
//    // ================================================================
//    private String buildPostContent(String roomName, String address, int capacity,
//                                    long price, String desc, String img1, String img2) {
//        return String.format("""
//            ## %s
//
//            📍 **Địa chỉ:** %s
//            👥 **Sức chứa:** %d người
//            💰 **Giá thuê:** %,d VNĐ / giờ
//
//            ---
//
//            ### Mô tả
//            %s
//
//            ### Hình ảnh thực tế
//
//            ![Ảnh phòng 1](%s)
//
//            ![Ảnh phòng 2](%s)
//
//            ### Tiện ích nổi bật
//            - ✅ Wifi tốc độ cao (>500 Mbps)
//            - ✅ Điều hòa 2 chiều, duy trì 24°C
//            - ✅ Máy chiếu / TV màn hình lớn
//            - ✅ Bảng trắng & bút viết đầy đủ
//            - ✅ Ổ điện mỗi bàn học
//            - ✅ Nước uống miễn phí
//            - ✅ Bãi đỗ xe miễn phí
//
//            ### Lưu ý khi đặt phòng
//            - Vui lòng đặt trước ít nhất 2 giờ
//            - Hủy miễn phí trước 24 giờ
//            - Check-in đúng giờ để không ảnh hưởng booking khác
//            """,
//                roomName, address, capacity, price, desc, img1, img2
//        );
//    }
//
//    // ================================================================
//    // HELPER: Seed bookings + reviews cho 1 tòa nhà
//    // Trả về [số booking đã tạo, số review đã tạo]
//    // ================================================================
//    private int[] seedBookingsAndReviews(RentalArea area, User renter, Random rng) {
//
//        // Kịch bản booking: {daysAgo, durationHours, priceK, statusCode}
//        // statusCode: 0=COMPLETED, 1=BOOKED, 2=CANCELLED
//        int[][] scenarios = {
//                {55, 4, 80,  0}, {50, 6, 120, 0}, {45, 3, 65,  0}, {40, 4, 80,  0},
//                {35, 5, 100, 0}, {30, 4, 80,  0}, {25, 6, 120, 0}, {20, 3, 65,  0},
//                {15, 4, 80,  0}, {10, 8, 160, 0}, {7,  4, 80,  0}, {5,  6, 120, 0},
//                {3,  3, 65,  0}, // 13 COMPLETED
//                {1,  4, 80,  1}, {1,  6, 120, 1}, {0,  4, 80,  1}, // 3 BOOKED
//                {28, 4, 80,  2}, {18, 3, 65,  2}, {8,  4, 80,  2}, // 3 CANCELLED
//        };
//
//        String[] reviewComments = {
//                "Phòng rất sạch sẽ, thoáng mát, thiết bị hoạt động tốt. Sẽ quay lại!",
//                "Không gian yên tĩnh, wifi siêu nhanh. Rất phù hợp để học nhóm và làm việc.",
//                "Máy chiếu sắc nét, ghế êm. Chủ phòng hỗ trợ nhiệt tình. 5 sao xứng đáng!",
//                "Thiết bị đầy đủ, hiện đại. Check-in nhanh gọn qua QR. Rất hài lòng.",
//                "Phòng ổn, điều hòa mát. Nhưng wifi đôi khi hơi chập chờn vào giờ cao điểm.",
//                "Giá hợp lý, chất lượng tốt. Không gian chuyên nghiệp. Recommend cho mọi người!",
//                "Rộng rãi, bàn ghế thoải mái. View nhìn ra ngoài đẹp. Sẽ book tiếp.",
//                "Nội thất mới, sạch bóng. Ổ điện đủ cho cả nhóm 6 người dùng laptop.",
//                "Vị trí cực thuận tiện, gần trung tâm. Bãi đỗ xe rộng. Giá rất phải chăng.",
//                "Phòng họp nhỏ nhưng đầy đủ thiết bị. TV sắc nét, micro tốt. Hài lòng!",
//                "Lần đầu đặt qua app, trải nghiệm mượt mà. Phòng đúng như mô tả. Tuyệt vời!",
//                "Nhân viên hỗ trợ 24/7, mọi vấn đề được giải quyết nhanh. Dịch vụ chuyên nghiệp.",
//                "Không gian học tập lý tưởng. Ánh sáng đủ, yên tĩnh, có cả máy pha cà phê!",
//        };
//        int[] ratings = {5, 5, 5, 4, 4, 4, 5, 4, 5, 4, 5, 4, 5};
//
//        List<Booking> bookings = new ArrayList<>();
//        List<Review>  reviews  = new ArrayList<>();
//        int reviewIdx = 0;
//
//        for (int[] sc : scenarios) {
//            int daysAgo      = sc[0];
//            int durationHrs  = sc[1];
//            BigDecimal price = BigDecimal.valueOf(sc[2] * 1_000L);
//            int statusCode   = sc[3];
//
//            LocalDateTime start = LocalDateTime.now()
//                    .minusDays(daysAgo)
//                    .withHour(8 + rng.nextInt(10))
//                    .withMinute(0).withSecond(0).withNano(0);
//            LocalDateTime end = start.plusHours(durationHrs);
//
//            BookingStatus status = switch (statusCode) {
//                case 1  -> BookingStatus.BOOKED;
//                case 2  -> BookingStatus.CANCELLED;
//                default -> BookingStatus.COMPLETED;
//            };
//
//            Booking booking = bookingRepository.save(
//                    Booking.builder()
//                            .bookingTitle("Đặt phòng tại " + area.getRentalAreaName())
//                            .bookingStatus(status)
//                            .totalPrice(price)
//                            .note("Booking tự động từ FullDataSeeder")
//                            .startTime(start)
//                            .endTime(end)
//                            .checkIn(status  == BookingStatus.COMPLETED ? start : null)
//                            .checkOut(status == BookingStatus.COMPLETED ? end   : null)
//                            .escrowReleasedAt(status == BookingStatus.COMPLETED ? end.plusDays(7) : null)
//                            .renter(renter)
//                            .rentalArea(area)
//                            .bookingType(BookingType.HOURLY)
//                            .disputeFlag(false)
//                            .build()
//            );
//            bookings.add(booking);
//
//            // Tạo review cho COMPLETED booking
//            if (status == BookingStatus.COMPLETED && reviewIdx < reviewComments.length) {
//                Review review = reviewRepository.save(
//                        Review.builder()
//                                .reviewer(renter)
//                                .booking(booking)
//                                .rentalArea(area)
//                                .rating(ratings[reviewIdx % ratings.length])
//                                .comment(reviewComments[reviewIdx % reviewComments.length])
//                                .status(ReviewStatus.APPROVED)
//                                .helpfulCount(rng.nextInt(15))
//                                .build()
//                );
//                reviews.add(review);
//                reviewIdx++;
//            }
//        }
//
//        log.info("[FullDataSeeder] Tòa '{}': {} bookings, {} reviews",
//                area.getRentalAreaName(), bookings.size(), reviews.size());
//
//        return new int[]{bookings.size(), reviews.size()};
//    }
//}