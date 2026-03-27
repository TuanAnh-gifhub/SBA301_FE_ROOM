//package org.rent.room.be.dataInitializer;
//
//import lombok.AccessLevel;
//import lombok.RequiredArgsConstructor;
//import lombok.experimental.FieldDefaults;
//import lombok.extern.slf4j.Slf4j;
//import org.rent.room.be.constant.*;
//import org.rent.room.be.entity.*;
//import org.rent.room.be.entity.Order;
//import org.rent.room.be.repository.*;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Component;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.math.BigDecimal;
//import java.math.RoundingMode;
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.time.LocalTime;
//import java.time.YearMonth;
//import java.util.*;
//import org.rent.room.be.entity.Order;
//
///**
// * CompleteDemoDataSeeder — Tạo toàn bộ dữ liệu demo cho hệ thống
// *
// * Bao gồm:
// * - Đa tòa nhà với các phòng khác nhau
// * - Bookings với trạng thái COMPLETED, BOOKED, CANCELLED
// * - Reviews kèm theo media, replies, tags, votes
// * - Conversations & Messages
// * - Notifications
// * - Payments & Subscriptions
// * - Wallet transactions
// * - Withdraw requests
// * - Reports
// * - Booking intents
// *
// * Guard: Chạy khi số Review < 20 (tức chưa có demo data đầy đủ)
// * Order: 4 (chạy sau FullDataSeeder)
// */
//@Component
//@org.springframework.core.annotation.Order(2)
//@RequiredArgsConstructor
//@Slf4j
//@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
//@Transactional
//public class CompleteDemoDataSeeder implements CommandLineRunner {
//
//    // Repositories
//    UserRepository userRepository;
//    RoleRepository roleRepository;
//    CityRepository cityRepository;
//    CategoryRepository categoryRepository;
//    AmenityRepository amenityRepository;
//    RentalAreaRepository rentalAreaRepository;
//    RoomRepository roomRepository;
//    RoomCopyRepository roomCopyRepository;
//    PostRepository postRepository;
//    BookingRepository bookingRepository;
//    SlotRepository slotRepository;
//    ReviewRepository reviewRepository;
//    ReviewMediaRepository reviewMediaRepository;
//    ReviewReplyRepository reviewReplyRepository;
//    ReviewTagRepository reviewTagRepository;
//    ReviewVoteRepository reviewVoteRepository;
//    ConversationRepository conversationRepository;
//    MessageRepository messageRepository;
//    NotificationRepository notificationRepository;
//    PaymentRepository paymentRepository;
//    WalletRepository walletRepository;
//    WalletTransactionRepository walletTransactionRepository;
//    WithdrawRequestRepository withdrawRequestRepository;
//    SubscriptionRepository subscriptionRepository;
//    RentPackageRepository rentPackageRepository;
//    OrderRepository orderRepository;
//    CommissionConfigRepository commissionConfigRepository;
//    ReportRepository reportRepository;
//    RoomImageRepository roomImageRepository;
//    RentalAreaImageRepository rentalAreaImageRepository;
//    BookingIntentRepository bookingIntentRepository;
//    IntentSlotRepository intentSlotRepository;
//    BookingQRRepository bookingQRRepository;
//    PasswordEncoder passwordEncoder;
//
//    // Ảnh từ Unsplash
//    static final String[] ROOM_IMAGES = {
//            "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&q=80",
//            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
//            "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80",
//            "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&q=80",
//            "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=1200&q=80",
//            "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=1200&q=80",
//            "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80",
//            "https://images.unsplash.com/photo-1591123120675-6f7f1aae0e38?w=1200&q=80",
//            "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=1200&q=80",
//    };
//
//    static final int GUARD_REVIEW_COUNT = 20;
//
//    @Override
//    public void run(String... args) throws Exception {
//        long reviewCount = reviewRepository.count();
//        if (reviewCount >= GUARD_REVIEW_COUNT) {
//            log.info("[CompleteDemoDataSeeder] Đã có {} reviews — bỏ qua seed.", reviewCount);
//            return;
//        }
//
//        log.info("[CompleteDemoDataSeeder] ========================================");
//        log.info("[CompleteDemoDataSeeder] Bắt đầu seed dữ liệu demo toàn hệ thống...");
//        log.info("[CompleteDemoDataSeeder] ========================================");
//
//        // Lấy users cơ bản
//        User owner1 = getOrCreateUser("owner1@gmail.com", "Owner 1", "OWNER");
//        User owner2 = getOrCreateUser("owner2@gmail.com", "Owner 2", "OWNER");
//        User renter1 = getOrCreateUser("renter1@gmail.com", "Renter 1", "RENTER");
//        User renter2 = getOrCreateUser("renter2@gmail.com", "Renter 2", "RENTER");
//        User renter3 = getOrCreateUser("renter3@gmail.com", "Renter 3", "RENTER");
//        User admin = getOrCreateUser("admin@gmail.com", "Admin", "ADMIN");
//
//        // Lấy cities
//        List<City> cities = cityRepository.findAll();
//        if (cities.isEmpty()) {
//            log.warn("[CompleteDemoDataSeeder] Không tìm thấy city.");
//            return;
//        }
//
//        // Lấy amenities
//        List<Amenity> amenities = amenityRepository.findAll();
//        Set<Amenity> amenitySet = new HashSet<>(amenities);
//
//        // Lấy categories
//        List<Category> categories = categoryRepository.findAll();
//
//        // === BƯỚC 1: TẠO WALLETS ===
//        createWalletsForUsers(List.of(owner1, owner2, renter1, renter2, renter3));
//
//        // === BƯỚC 2: TẠO RENTAL AREAS & ROOMS ===
//        List<RentalArea> rentalAreas = new ArrayList<>();
//        rentalAreas.add(seedRentalArea("EduSpace Premium", "123 Nguyễn Huệ, Q1, TP.HCM", owner1, cities.get(1)));
//        rentalAreas.add(seedRentalArea("StudyHub Hà Nội", "45 Xuân Thủy, Hà Nội", owner1, cities.get(0)));
//        rentalAreas.add(seedRentalArea("ClassRoom Đà Nẵng", "88 Lê Duẩn, Đà Nẵng", owner2, cities.get(3)));
//        rentalAreas.add(seedRentalArea("Learning Space Cần Thơ", "456 Nguyễn Văn Cừ, Cần Thơ", owner2, cities.get(4)));
//
//        // Tạo rooms cho mỗi rental area
//        Map<UUID, List<Room>> areaRoomsMap = new HashMap<>();
//        int imageIdx = 0;
//        for (RentalArea area : rentalAreas) {
//            List<Room> roomsForArea = seedRoomsForArea(area, categories, amenitySet, imageIdx);
//            areaRoomsMap.put(area.getRentalAreaId(), roomsForArea);
//            imageIdx = (imageIdx + roomsForArea.size()) % ROOM_IMAGES.length;
//        }
//
//        // === BƯỚC 3: TẠO POSTS ===
//        List<Post> allPosts = new ArrayList<>();
//        for (RentalArea area : rentalAreas) {
//            for (Room room : areaRoomsMap.get(area.getRentalAreaId())) {
//                Post post = seedPost(room, area, area.getOwner());
//                allPosts.add(post);
//            }
//        }
//
//        // === BƯỚC 4: TẠO BOOKINGS & REVIEWS ===
//        List<Booking> allBookings = new ArrayList<>();
//        List<Review> allReviews = new ArrayList<>();
//        Random rng = new Random(99);
//        for (RentalArea area : rentalAreas) {
//            int[] counts = seedBookingsAndReviewsForArea(area, renter1, renter2, renter3, rng);
//            log.info("[CompleteDemoDataSeeder] Tòa '{}': {} bookings, {} reviews",
//                    area.getRentalAreaName(), counts[0], counts[1]);
//        }
//
//        // === BƯỚC 5: TẠO REVIEW MEDIA, REPLIES, TAGS, VOTES ===
//        seedReviewDetails(rng);
//
//        // === BƯỚC 6: TẠO CONVERSATIONS & MESSAGES ===
//        seedConversations(owner1, renter1, renter2);
//
//        // === BƯỚC 7: TẠO NOTIFICATIONS ===
//        seedNotifications(renter1, renter2, renter3);
//
//        // === BƯỚC 8: TẠO PAYMENTS & SUBSCRIPTIONS ===
//        seedPaymentsAndSubscriptions(renter1, renter2, renter3);
//
//        // === BƯỚC 9: TẠO WALLET TRANSACTIONS ===
//        seedWalletTransactions(owner1, owner2, rng);
//
//        // === BƯỚC 10: TẠO WITHDRAW REQUESTS ===
//        seedWithdrawRequests(owner1, owner2);
//
//        // === BƯỚC 11: TẠO REPORTS ===
//        seedReports(renter1, renter2);
//
//        // === BƯỚC 12: TẠO BOOKING INTENTS ===
//        seedBookingIntents(renter1, renter2, areaRoomsMap);
//
//        log.info("[CompleteDemoDataSeeder] ========================================");
//        log.info("[CompleteDemoDataSeeder] ✅ DEMO DATA SEED HOÀN TẤT!");
//        log.info("[CompleteDemoDataSeeder] ========================================");
//    }
//
//    // ====================================================================================
//    // HELPERS
//    // ====================================================================================
//
//    private User getOrCreateUser(String email, String name, String roleName) {
//        Optional<User> existing = userRepository.findByEmail(email);
//        if (existing.isPresent()) {
//            return existing.get();
//        }
//
//        Role role = roleRepository.findByRoleName(roleName)
//                .orElseThrow(() -> new RuntimeException("Role " + roleName + " not found"));
//
//        User user = User.builder()
//                .userName(name)
//                .email(email)
//                .passwordHash(passwordEncoder.encode("12345678"))
//                .phone("09" + String.format("%08d", new Random().nextInt(100000000)))
//                .dateOfBirth(LocalDate.of(1995 + new Random().nextInt(10), 1 + new Random().nextInt(12), 1 + new Random().nextInt(28)))
//                .gender("Other")
//                .role(role)
//                .active(true)
//                .build();
//        return userRepository.save(user);
//    }
//
//    private void createWalletsForUsers(List<User> users) {
//        for (User user : users) {
//            if (walletRepository.findByUser(user).isEmpty()) {
//                Wallet wallet = Wallet.builder()
//                        .user(user)
//                        .balance(BigDecimal.valueOf(new Random().nextInt(50000000) + 1000000))
//                        .frozenAmount(BigDecimal.ZERO)
//                        .walletStatus(WalletStatus.ACTIVE)
//                        .build();
//                walletRepository.save(wallet);
//                log.info("[CompleteDemoDataSeeder] Created wallet for {}", user.getEmail());
//            }
//        }
//    }
//
//    private RentalArea seedRentalArea(String name, String address, User owner, City city) {
//        RentalArea area = RentalArea.builder()
//                .rentalAreaName(name)
//                .address(address)
//                .contactName(owner.getUserName() + " Team")
//                .contactPhone("08" + String.format("%08d", new Random().nextInt(100000000)))
//                .owner(owner)
//                .city(city)
//                .status(RentalAreaStatus.ACTIVE)
//                .averageRating(BigDecimal.ZERO)
//                .totalReviews(0)
//                .openTime(LocalTime.of(6, 0))
//                .closeTime(LocalTime.of(23, 59))
//                .build();
//        RentalArea saved = rentalAreaRepository.save(area);
//
//        // Thêm ảnh rental area
//        seedRentalAreaImages(saved);
//
//        log.info("[CompleteDemoDataSeeder] Created RentalArea: {}", name);
//        return saved;
//    }
//
//    private void seedRentalAreaImages(RentalArea area) {
//        String[] areaImages = {
//                "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",
//                "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80",
//                "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&q=80"
//        };
//
//        for (int i = 0; i < Math.min(2, areaImages.length); i++) {
//            RentalAreaImage img = RentalAreaImage.builder()
//                    .rentalArea(area)
//                    .imageUrl(areaImages[i])
//                    .publicId("area_" + area.getRentalAreaId() + "_" + i)
//                    .isCover(i == 0)
//                    .sortOrder(i)
//                    .build();
//            rentalAreaImageRepository.save(img);
//        }
//    }
//
//    private List<Room> seedRoomsForArea(RentalArea area, List<Category> categories, Set<Amenity> amenitySet, int imageOffset) {
//        List<Room> rooms = new ArrayList<>();
//
//        String[][] roomData = {
//                {"Phòng Học 25 Người", "25", "80000", "Phòng học hiện đại"},
//                {"Phòng Họp VIP 12 Người", "12", "120000", "Phòng họp cao cấp"},
//                {"Phòng Lab Máy Tính", "20", "150000", "20 máy tính mạnh mẽ"},
//                {"Phòng Nhóm Mini", "8", "60000", "Phòng nhỏ ấm cúng"}
//        };
//
//        for (int i = 0; i < roomData.length; i++) {
//            String roomName = roomData[i][0];
//            int capacity = Integer.parseInt(roomData[i][1]);
//            BigDecimal price = new BigDecimal(roomData[i][2]);
//            String desc = roomData[i][3];
//
//            Category category = categories.isEmpty() ? null : categories.get(i % categories.size());
//
//            Room room = Room.builder()
//                    .roomName(roomName)
//                    .description(desc)
//                    .roomStatus(RoomStatus.ACTIVE)
//                    .capacity(capacity)
//                    .area((double) capacity * 2)
//                    .amenities(amenitySet)
//                    .rentalArea(area)
//                    .category(category)
//                    .price(price)
//                    .build();
//            Room savedRoom = roomRepository.save(room);
//
//            // Tạo 2 room copies mỗi phòng
//            for (int j = 0; j < 2; j++) {
//                RoomCopy copy = RoomCopy.builder()
//                        .roomCode(area.getRentalAreaName().substring(0, 3).toUpperCase() + "-" + String.format("%02d", i + 1) + "-" + String.format("%02d", j + 1))
//                        .roomCopyStatus(RoomCopyStatus.AVAILABLE)
//                        .room(savedRoom)
//                        .build();
//                roomCopyRepository.save(copy);
//            }
//
//            // Tạo room images
//            for (int j = 0; j < 2; j++) {
//                String imgUrl = ROOM_IMAGES[(imageOffset + i + j) % ROOM_IMAGES.length];
//                RoomImage roomImg = RoomImage.builder()
//                        .room(savedRoom)
//                        .imageUrl(imgUrl)
//                        .publicId("room_" + savedRoom.getRoomId() + "_" + j)
//                        .isCover(j == 0)
//                        .sortOrder(j)
//                        .build();
//                roomImageRepository.save(roomImg);
//            }
//
//            rooms.add(savedRoom);
//            log.info("[CompleteDemoDataSeeder]   → Room: {}", roomName);
//        }
//
//        return rooms;
//    }
//
//    private Post seedPost(Room room, RentalArea area, User owner) {
//        String content = buildPostContent(room, area);
//
//        Random rng = new Random();
//        int roll = rng.nextInt(100);
//
//        PostStatus status;
//        if (roll < 60) {
//            status = PostStatus.PUBLISHED; // 60% bài viết Đang hiển thị
//        } else if (roll < 85) {
//            status = PostStatus.PENDING;   // 25% bài viết Chờ duyệt (để thẻ KPI nhảy số)
//        } else if (roll < 95) {
//            status = PostStatus.HIDDEN;    // 10% bài viết Bị ẩn
//        } else {
//            status = PostStatus.DELETED;   // 5% bài viết Bị xóa
//        }
//
//        Post post = Post.builder()
//                .title(room.getRoomName() + " — " + area.getRentalAreaName())
//                .content(content)
//                .postStatus(status) // Gán trạng thái random có tỉ lệ
//                .user(owner)
//                .room(room)
//                .rentalArea(area)
//                .build();
//        return postRepository.save(post);
//    }
//
//    private String buildPostContent(Room room, RentalArea area) {
//        return String.format("""
//            # %s
//
//            **Địa chỉ:** %s
//            **Sức chứa:** %d người
//            **Giá thuê:** %,d VNĐ/giờ
//
//            ## Mô tả
//            %s
//
//            ## Tiện ích
//            -  WiFi tốc độ cao (>1Gbps)
//            - Điều hòa 2 chiều
//            - Máy chiếu 4K / TV lớn
//            - Bảng trắng & bút
//            - Ổ điện đầy đủ
//            -  Nước uống miễn phí
//            -  Bãi đỗ xe
//
//            ## Quy tắc đặt phòng
//            - Đặt trước ít nhất 2 giờ
//            - Hủy miễn phí trước 24 giờ
//            - Check-in đúng giờ
//            """,
//                room.getRoomName(),
//                area.getAddress(),
//                room.getCapacity(),
//                room.getPrice().longValue(),
//                room.getDescription()
//        );
//    }
//
//    private int[] seedBookingsAndReviewsForArea(RentalArea area, User renter1, User renter2, User renter3, Random rng) {
//        List<User> renters = List.of(renter1, renter2, renter3);
//        List<String> comments = List.of(
//                "Phòng sạch, thoáng mát, wifi nhanh. Rất hài lòng!",
//                "Không gian yên tĩnh, phù hợp học nhóm. Recommend!",
//                "Thiết bị đầy đủ, máy chiếu sắc nét. 5 sao!",
//                "Nhân viên hỗ trợ tốt, đặt phòng dễ. Sẽ quay lại.",
//                "Phòng ổn, nhưng wifi hơi chập chờn."
//        );
//        int[] ratings = {5, 5, 5, 4, 4};
//
//        int bookingCount = 0, reviewCount = 0;
//        int commentIdx = 0;
//
//        LocalDateTime now = LocalDateTime.now();
//        int currentYear = now.getYear();
//        int currentMonth = now.getMonthValue();
//        List<LocalDateTime> targetDates = new ArrayList<>();
//
//        // 1. Sinh Data rải đều từ tháng 1 đến hiện tại
//        for (int month = 1; month <= currentMonth; month++) {
//            int limitDay = (month == currentMonth) ? Math.max(1, now.getDayOfMonth()) : YearMonth.of(currentYear, month).lengthOfMonth();
//            int numTx = rng.nextInt(3) + 1; // 1-3 booking mỗi tháng
//            for (int i = 0; i < numTx; i++) {
//                LocalDateTime d = LocalDateTime.of(currentYear, month, rng.nextInt(limitDay) + 1, rng.nextInt(10) + 8, 0);
//                if (d.isBefore(now)) targetDates.add(d);
//            }
//        }
//
//        // 2. Nhồi thêm cho 7 ngày qua
//        for (int i = 0; i < 7; i++) {
//            LocalDateTime d = now.minusDays(i).withHour(rng.nextInt(10) + 8).withMinute(0);
//            if (d.getYear() == currentYear) targetDates.add(d);
//        }
//
//        Collections.sort(targetDates);
//
//        // 3. Tạo Booking dựa trên ngày giả
//        for (LocalDateTime start : targetDates) {
//            int durationHrs = rng.nextInt(6) + 2; // Thuê từ 2 - 7 tiếng
//            LocalDateTime end = start.plusHours(durationHrs);
//            BigDecimal price = BigDecimal.valueOf(durationHrs * 40000L); // Giả sử 40k/h
//
//            // Random Status: 70% Completed, 20% Booked, 10% Canceled
//            int roll = rng.nextInt(100);
//            BookingStatus status = (roll < 70) ? BookingStatus.COMPLETED : (roll < 90 ? BookingStatus.BOOKED : BookingStatus.CANCELLED);
//
//            User renter = renters.get(rng.nextInt(renters.size()));
//
//            Booking booking = Booking.builder()
//                    .bookingTitle("Đặt phòng tại " + area.getRentalAreaName())
//                    .bookingStatus(status)
//                    .totalPrice(price)
//                    .note("Demo booking")
//                    .startTime(start)
//                    .endTime(end)
//                    .checkIn(status == BookingStatus.COMPLETED ? start : null)
//                    .checkOut(status == BookingStatus.COMPLETED ? end : null)
//                    .escrowReleasedAt(status == BookingStatus.COMPLETED ? end.plusDays(7) : null)
//                    .renter(renter)
//                    .rentalArea(area)
//                    .bookingType(BookingType.HOURLY)
//                    .disputeFlag(false)
//                    .build();
//            Booking savedBooking = bookingRepository.save(booking);
//
//            // HACK THỜI GIAN NGAY SAU KHI LƯU
//            bookingRepository.updateCreatedAt(savedBooking.getBookingId(), start);
//            bookingCount++;
//
//            // Tạo Slots
//            LocalDateTime slotStart = start;
//            while (slotStart.isBefore(end)) {
//                LocalDateTime slotEnd = slotStart.plusHours(1);
//                if (slotEnd.isAfter(end)) slotEnd = end;
//
//                Slot slot = Slot.builder()
//                        .startTime(slotStart)
//                        .endTime(slotEnd)
//                        .price(price.divide(BigDecimal.valueOf(durationHrs), 2, RoundingMode.HALF_UP))
//                        .slotStatus(SlotStatus.BOOKED)
//                        .booking(savedBooking)
//                        .build();
//                slotRepository.save(slot);
//
//                slotStart = slotEnd;
//            }
//
//            // Tạo Review cho COMPLETED bookings
//            if (status == BookingStatus.COMPLETED && commentIdx < comments.size()) {
//                Review review = Review.builder()
//                        .reviewer(renter)
//                        .booking(savedBooking)
//                        .rentalArea(area)
//                        .rating(ratings[commentIdx % ratings.length])
//                        .comment(comments.get(commentIdx % comments.size()))
//                        .status(ReviewStatus.APPROVED)
//                        .helpfulCount(rng.nextInt(20))
//                        .build();
//                reviewRepository.save(review);
//                reviewCount++;
//                commentIdx++;
//            }
//
//            // Tạo BookingQR
//            BookingQR qr = BookingQR.builder()
//                    .booking(savedBooking)
//                    .qrToken(UUID.randomUUID().toString())
//                    .qrType(QRType.CHECK_IN)
//                    .expireAt(end.plusDays(1))
//                    .build();
//            bookingQRRepository.save(qr);
//        }
//
//        // Update rental area rating
//        List<Review> areaReviews = reviewRepository.findAll().stream()
//                .filter(r -> r.getRentalArea().getRentalAreaId().equals(area.getRentalAreaId()))
//                .toList();
//        if (!areaReviews.isEmpty()) {
//            double avg = areaReviews.stream().mapToInt(Review::getRating).average().orElse(0);
//            area.setAverageRating(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
//            area.setTotalReviews(areaReviews.size());
//            rentalAreaRepository.save(area);
//        }
//
//        return new int[]{bookingCount, reviewCount};
//    }
//
//    private void seedReviewDetails(Random rng) {
//        List<Review> reviews = reviewRepository.findAll().stream()
//                .filter(r -> r.getStatus() == ReviewStatus.APPROVED)
//                .limit(10)
//                .toList();
//
//        String[] tags = {"Sạch sẽ", "Yên tĩnh", "WiFi tốt", "Điều hòa mát", "Vị trí tốt", "Giá phải chăng"};
//
//        for (int i = 0; i < reviews.size(); i++) {
//            Review review = reviews.get(i);
//
//            // Thêm media
//            if (i % 2 == 0) {
//                ReviewMedia media = ReviewMedia.builder()
//                        .review(review)
//                        .url(ROOM_IMAGES[i % ROOM_IMAGES.length])
//                        .mediaType(MediaType.IMAGE)
//                        .build();
//                reviewMediaRepository.save(media);
//            }
//
//            // Thêm tags
//            for (int j = 0; j < 2; j++) {
//                ReviewTag tag = ReviewTag.builder()
//                        .review(review)
//                        .tagName(tags[(i + j) % tags.length])
//                        .build();
//                reviewTagRepository.save(tag);
//            }
//
//            // Thêm votes (fake votes from other users)
//            for (int j = 0; j < 3; j++) {
//                ReviewVote vote = ReviewVote.builder()
//                        .review(review)
//                        .user(userRepository.findAll().get(j % userRepository.findAll().size()))
//                        .build();
//                try {
//                    reviewVoteRepository.save(vote);
//                } catch (Exception e) {
//                    // Ignore duplicate votes
//                }
//            }
//
//            // Thêm reply từ owner
//            if (i % 3 == 0 && review.getRentalArea().getOwner() != null) {
//                ReviewReply reply = ReviewReply.builder()
//                        .review(review)
//                        .owner(review.getRentalArea().getOwner())
//                        .content("Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi. Rất vui khi bạn hài lòng!")
//                        .build();
//                reviewReplyRepository.save(reply);
//            }
//        }
//
//        log.info("[CompleteDemoDataSeeder] Seeded review details for {} reviews", reviews.size());
//    }
//
//    private void seedConversations(User owner, User renter1, User renter2) {
//        String[][] convos = {
//                {"owner", "renter1", "Xin chào, bạn muốn hỏi gì?", "Phòng này có WiFi không?", "Có, WiFi siêu nhanh"},
//                {"owner", "renter2", "Chào bạn", "Khi nào có phòng trống?", "Tuần tới đã sẵn sàng"}
//        };
//
//        for (String[] convo : convos) {
//            User user1 = convo[0].equals("owner") ? owner : renter1;
//            User user2 = convo[1].equals("renter1") ? renter1 : renter2;
//
//            Conversation conversation = Conversation.builder()
//                    .conversationTitle("Cuộc trò chuyện giữa " + user1.getUserName() + " và " + user2.getUserName())
//                    .user1(user1)
//                    .user2(user2)
//                    .build();
//            Conversation savedConvo = conversationRepository.save(conversation);
//
//            // Tạo messages
//            LocalDateTime time = LocalDateTime.now().minusDays(5);
//            for (int i = 2; i < convo.length; i++) {
//                User sender = (i % 2 == 0) ? user1 : user2;
//                Message msg = Message.builder()
//                        .conversation(savedConvo)
//                        .sender(sender)
//                        .recipient(sender.equals(user1) ? user2 : user1)
//                        .messageBody(convo[i])
//                        .status(MessageStatus.DELIVERED)
//                        .build();
//                messageRepository.save(msg);
//                time = time.plusMinutes(15);
//            }
//
//            log.info("[CompleteDemoDataSeeder] Created conversation between {} and {}", user1.getUserName(), user2.getUserName());
//        }
//    }
//
//    private void seedNotifications(User... users) {
//        String[] notificationTexts = {
//                "Đặt phòng của bạn vừa được xác nhận",
//                "Chủ phòng vừa trả lời bạn",
//                "Bạn có 30 phút để check-in",
//                "Có tin nhắn mới từ chủ phòng",
//                "Subscription của bạn sắp hết hạn"
//        };
//
//        for (User user : users) {
//            for (int i = 0; i < 3; i++) {
//                Notification notif = Notification.builder()
//                        .notificationTitle("Thông báo hệ thống")
//                        .notificationBody(notificationTexts[i % notificationTexts.length])
//                        .recipient(user)
//                        .type(NotificationType.BOOKING)
//                        .isRead(i % 2 == 0)
//                        .isDeleted(false)
//                        .build();
//                notificationRepository.save(notif);
//            }
//        }
//
//        log.info("[CompleteDemoDataSeeder] Seeded notifications for {} users", users.length);
//    }
//
//    private void seedPaymentsAndSubscriptions(User... renters) {
//        List<RentPackage> packages = rentPackageRepository.findAll();
//        if (packages.isEmpty()) {
//            // Tạo packages nếu chưa có
//            packages.add(seedPackage("Basic", 30, 3, BigDecimal.valueOf(99000)));
//            packages.add(seedPackage("Pro", 90, 10, BigDecimal.valueOf(299000)));
//            packages.add(seedPackage("Premium", 365, 50, BigDecimal.valueOf(999000)));
//        }
//
//        for (User renter : renters) {
//            Wallet wallet = walletRepository.findByUser(renter).orElse(null);
//            if (wallet == null) continue;
//
//            // Tạo payment
//            RentPackage pkg = packages.get(new Random().nextInt(packages.size()));
//            Payment payment = Payment.builder()
//                    .user(renter)
//                    .wallet(wallet)
//                    .amount(pkg.getPrice())
//                    .transactionDate(LocalDateTime.now().minusDays(new Random().nextInt(30)))
//                    .paymentMethod(PaymentMethod.WALLET)
//                    .paymentStatus(PaymentStatus.SUCCESS)
//                    .build();
//            Payment savedPayment = paymentRepository.save(payment);
//
//            // Tạo order
//            Order order = Order.builder()
//                    .wallet(wallet)
//                    .rentPackage(pkg)
//                    .totalAmount(pkg.getPrice())
//                    .orderStatus("COMPLETED")
//                    .build();
//            Order savedOrder = orderRepository.save(order);
//
//            // Tạo subscription
//            LocalDateTime startDate = LocalDateTime.now().minusDays(new Random().nextInt(30));
//            LocalDateTime endDate = startDate.plusDays(pkg.getDurationDays());
//            Subscription subscription = Subscription.builder()
//                    .user(renter)
//                    .rentPackage(pkg)
//                    .startDate(startDate)
//                    .endDate(endDate)
//                    .active(endDate.isAfter(LocalDateTime.now()))
//                    .order(savedOrder)
//                    .build();
//            subscriptionRepository.save(subscription);
//        }
//
//        log.info("[CompleteDemoDataSeeder] Seeded payments and subscriptions for {} renters", renters.length);
//    }
//
//    private RentPackage seedPackage(String name, int days, int maxPosts, BigDecimal price) {
//        RentPackage pkg = RentPackage.builder()
//                .rentPackageName(name)
//                .price(price)
//                .durationDays(days)
//                .maxPosts(maxPosts)
//                .description(name + " package - " + days + " days, " + maxPosts + " posts")
//                .build();
//        return rentPackageRepository.save(pkg);
//    }
//
//    private void seedWalletTransactions(User owner1, User owner2, Random rng) {
//        LocalDateTime now = LocalDateTime.now();
//        int currentYear = now.getYear();
//        int currentMonth = now.getMonthValue();
//
//        for (User owner : List.of(owner1, owner2)) {
//            Wallet wallet = walletRepository.findByUser(owner).orElse(null);
//            if (wallet == null) continue;
//
//            BigDecimal runningBalance = wallet.getBalance();
//            List<LocalDateTime> targetDates = new ArrayList<>();
//
//            // 1. CHỈ RẢI DATA TRONG NĂM NAY (Từ tháng 1 đến tháng hiện tại)
//            for (int month = 1; month <= currentMonth; month++) {
//                // Lấy số ngày tối đa của tháng đó (tránh lỗi ngày 31 tháng 2)
//                int maxDaysInMonth = YearMonth.of(currentYear, month).lengthOfMonth();
//
//                // Nếu là tháng hiện tại, chỉ random đến ngày hôm nay để không dính "giao dịch đến từ tương lai"
//                int limitDay = (month == currentMonth) ? Math.max(1, now.getDayOfMonth()) : maxDaysInMonth;
//
//                // Mỗi tháng sẽ có ngẫu nhiên 1 hoặc 2 giao dịch
//                int numTx = rng.nextInt(2) + 1;
//                for (int i = 0; i < numTx; i++) {
//                    int randomDay = rng.nextInt(limitDay) + 1;
//                    int randomHour = rng.nextInt(14) + 8; // Random từ 8h sáng đến 21h tối
//                    int randomMin = rng.nextInt(60);
//
//                    LocalDateTime fakeDate = LocalDateTime.of(currentYear, month, randomDay, randomHour, randomMin);
//
//                    // Đảm bảo an toàn không lưu thời gian quá hiện tại
//                    if (fakeDate.isBefore(now)) {
//                        targetDates.add(fakeDate);
//                    }
//                }
//            }
//
//            // 2. RẢI THÊM VÀO 7 NGÀY GẦN NHẤT (Để biểu đồ tuần luôn nhấp nhô đẹp)
//            for (int i = 0; i < 7; i++) {
//                LocalDateTime fakeDate = now.minusDays(i).minusHours(rng.nextInt(5));
//                // Đảm bảo ngày đó vẫn thuộc năm nay (đề phòng test vào mùng 1-5 tháng 1)
//                if (fakeDate.getYear() == currentYear) {
//                    targetDates.add(fakeDate);
//                }
//            }
//
//            // 3. SẮP XẾP TỪ QUÁ KHỨ ĐẾN HIỆN TẠI (Quan trọng: Để cộng balanceBefore/balanceAfter cho khớp)
//            Collections.sort(targetDates);
//
//            // 4. LƯU GIAO DỊCH
//            for (LocalDateTime fakeDate : targetDates) {
//                // Random số tiền từ 500,000đ đến 3,500,000đ
//                BigDecimal amount = BigDecimal.valueOf(rng.nextInt(3000000) + 500000);
//                BigDecimal balBefore = runningBalance;
//                BigDecimal balAfter = balBefore.add(amount);
//
//                WalletTransaction txn = WalletTransaction.builder()
//                        .wallet(wallet)
//                        .type(WalletTxType.BOOKING_INCOME)
//                        .legacyType(WalletTxType.BOOKING_INCOME.name())
//                        .status(WalletTxStatus.COMPLETED)
//                        .legacyStatus(WalletTxStatus.COMPLETED.name())
//                        .amount(amount)
//                        .balanceBefore(balBefore)
//                        .balanceAfter(balAfter)
//                        .description("Thu nhập đặt phòng (" + fakeDate.toLocalDate() + ")")
//                        .build();
//
//                // Lưu Entity
//                txn = walletTransactionRepository.save(txn);
//
//                // Ép cập nhật lại created_at bằng Native Query (Hàm updateCreatedAt bạn đã tạo)
//                walletTransactionRepository.updateCreatedAt(txn.getWalletTransactionId(), fakeDate);
//
//                runningBalance = balAfter;
//            }
//
//            wallet.setBalance(runningBalance);
//            walletRepository.save(wallet);
//        }
//
//        log.info("[CompleteDemoDataSeeder] Seeded wallet transactions");
//    }
//
//    private void seedWithdrawRequests(User... owners) {
//        String[] banks = {"VCB", "MB", "ACB", "VIB", "TCB"};
//
//        for (User owner : owners) {
//            Wallet wallet = walletRepository.findByUser(owner).orElse(null);
//            if (wallet == null || wallet.getBalance().compareTo(BigDecimal.ZERO) <= 0) continue;
//
//            WithdrawRequest withdraw = WithdrawRequest.builder()
//                    .wallet(wallet)
//                    .amount(wallet.getBalance().divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP))
//                    .bankCode(banks[new Random().nextInt(banks.length)])
//                    .bankAccountNumber("123456789")
//                    .bankAccountName(owner.getUserName())
//                    .status(WithdrawStatus.PENDING)
//                    .build();
//            withdrawRequestRepository.save(withdraw);
//        }
//
//        log.info("[CompleteDemoDataSeeder] Seeded withdraw requests");
//    }
//
//    private void seedReports(User... renters) {
//        String[] reportTitles = {
//                "Phòng không đúng như mô tả",
//                "Thiết bị hỏng",
//                "Không gian sạch sẽ không đảm bảo"
//        };
//
//        for (User renter : renters) {
//            Report report = Report.builder()
//                    .user(renter)
//                    .title(reportTitles[new Random().nextInt(reportTitles.length)])
//                    .content("Nội dung chi tiết về vấn đề gặp phải")
//                    .address("Địa chỉ phòng")
//                    .status(ReportStatus.PENDING)
//                    .isDeleted(false)
//                    .build();
//            reportRepository.save(report);
//        }
//
//        log.info("[CompleteDemoDataSeeder] Seeded reports");
//    }
//
//    private void seedBookingIntents(User renter1, User renter2, Map<UUID, List<Room>> areaRoomsMap) {
//        List<Room> allRooms = new ArrayList<>();
//        for (List<Room> rooms : areaRoomsMap.values()) {
//            allRooms.addAll(rooms);
//        }
//
//        if (allRooms.isEmpty()) return;
//
//        for (User renter : List.of(renter1, renter2)) {
//            int numIntents = new Random().nextInt(2) + 1;
//            for (int i = 0; i < numIntents; i++) {
//                LocalDateTime now = LocalDateTime.now();
//                LocalDateTime startTime = now.plusDays(new Random().nextInt(30) + 1);
//
//                BookingIntent intent = BookingIntent.builder()
//                        .user(renter)
//                        .title("Ý định đặt phòng " + (i + 1))
//                        .note("Demo booking intent")
//                        .numberOfMonths(1)
//                        .status(BookingIntentStatus.ACTIVE)
//                        .bookingType(BookingType.HOURLY)
//                        .previewPrice(BigDecimal.valueOf(500000))
//                        .startTime(startTime)
//                        .endTime(startTime.plusMonths(1))
//                        .expiresAt(now.plusDays(7))
//                        .build();
//                BookingIntent savedIntent = bookingIntentRepository.save(intent);
//
//                // Thêm intent slots
//                for (int j = 0; j < 2; j++) {
//                    Room room = allRooms.get(new Random().nextInt(allRooms.size()));
//                    IntentSlot slot = IntentSlot.builder()
//                            .bookingIntent(savedIntent)
//                            .room(room)
//                            .quantity(new Random().nextInt(5) + 1)
//                            .startTime(startTime.plusDays(j))
//                            .endTime(startTime.plusDays(j).plusHours(4))
//                            .price(room.getPrice())
//                            .build();
//                    intentSlotRepository.save(slot);
//                }
//            }
//        }
//
//        log.info("[CompleteDemoDataSeeder] Seeded booking intents");
//    }
//}
//
