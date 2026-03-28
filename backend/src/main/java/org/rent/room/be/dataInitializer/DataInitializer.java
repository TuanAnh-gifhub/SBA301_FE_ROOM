package org.rent.room.be.dataInitializer;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.rent.room.be.constant.*;
import org.rent.room.be.entity.*;
import org.rent.room.be.entity.Order;
import org.rent.room.be.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.*;

@Component
@org.springframework.core.annotation.Order(1)
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class DataInitializer implements CommandLineRunner {

    PasswordEncoder passwordEncoder;

    // Repositories
    UserRepository userRepository;
    RoleRepository roleRepository;
    CityRepository cityRepository;
    CategoryRepository categoryRepository;
    AmenityRepository amenityRepository;
    RentalAreaRepository rentalAreaRepository;
    RoomRepository roomRepository;
    RoomCopyRepository roomCopyRepository;
    PostRepository postRepository;
    BookingRepository bookingRepository;
    SlotRepository slotRepository;
    ReviewRepository reviewRepository;
    ReviewMediaRepository reviewMediaRepository;
    ReviewReplyRepository reviewReplyRepository;
    ReviewTagRepository reviewTagRepository;
    ReviewVoteRepository reviewVoteRepository;
    ConversationRepository conversationRepository;
    MessageRepository messageRepository;
    NotificationRepository notificationRepository;
    PaymentRepository paymentRepository;
    WalletRepository walletRepository;
    WalletTransactionRepository walletTransactionRepository;
    WithdrawRequestRepository withdrawRequestRepository;
    SubscriptionRepository subscriptionRepository;
    RentPackageRepository rentPackageRepository;
    OrderRepository orderRepository;
    ReportRepository reportRepository;
    RoomImageRepository roomImageRepository;
    RentalAreaImageRepository rentalAreaImageRepository;
    BookingIntentRepository bookingIntentRepository;
    IntentSlotRepository intentSlotRepository;
    BookingQRRepository bookingQRRepository;

    static final String[] ROOM_IMAGES = {
            "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&q=80",
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
            "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80",
            "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&q=80",
            "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=1200&q=80",
            "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=1200&q=80",
            "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80",
            "https://images.unsplash.com/photo-1591123120675-6f7f1aae0e38?w=1200&q=80",
            "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=1200&q=80",
    };

    static final int GUARD_REVIEW_COUNT = 20;

    @Override
    public void run(String... args) throws Exception {
        long reviewCount = reviewRepository.count();
        if (reviewCount >= GUARD_REVIEW_COUNT) {
            log.info("[FullDataInitializer] Hệ thống đã có {} reviews — bỏ qua seed dữ liệu.", reviewCount);
            return;
        }

        log.info("[FullDataInitializer] ===================================================");
        log.info("[FullDataInitializer] BẮT ĐẦU SEED TOÀN BỘ DỮ LIỆU HỆ THỐNG (FULL LOGIC)...");
        log.info("[FullDataInitializer] ===================================================");

        // 1. DỮ LIỆU DANH MỤC NỀN TẢNG (Từ File 1)
        seedRoles();
        seedCities();
        seedCategories();
        seedAmenities();
        seedPackages();

        // 2. NGƯỜI DÙNG & VÍ (Kết hợp File 1 & 2)
        seedUsers();
        User owner1 = getOrCreateUser("owner1@gmail.com", "Owner 1", "OWNER");
        User owner2 = getOrCreateUser("owner2@gmail.com", "Owner 2", "OWNER");
        User renter1 = getOrCreateUser("renter1@gmail.com", "Renter 1", "RENTER");
        User renter2 = getOrCreateUser("renter2@gmail.com", "Renter 2", "RENTER");
        User renter3 = getOrCreateUser("renter3@gmail.com", "Renter 3", "RENTER");
        createWalletsForUsers(userRepository.findAll());

        // 3. KHU VỰC THUÊ & PHÒNG (Kết hợp File 1 & 2)
        List<RentalArea> rentalAreas = seedRentalAreasAndRooms(owner1, owner2);

        // 4. BOOKINGS & REVIEWS ĐỂ TEST API (Từ File 1)
        seedTestBookingsAndReviews();

        // 5. BOOKINGS & REVIEWS KHỔNG LỒ CHO DASHBOARD (Từ File 2)
        Random rng = new Random(99);
        for (RentalArea area : rentalAreas) {
            int[] counts = seedMassBookingsAndReviewsForArea(area, renter1, renter2, renter3, rng);
            log.info("[FullDataInitializer] Tòa '{}': {} bookings, {} reviews", area.getRentalAreaName(), counts[0], counts[1]);
        }
        seedReviewDetails(rng);

        // 6. GIAO TIẾP & TƯƠNG TÁC XÃ HỘI (Từ File 2)
        seedConversations(owner1, renter1, renter2);
        seedNotifications(renter1, renter2, renter3);
        seedReports(renter1, renter2);

        // 7. TÀI CHÍNH & GÓI THUÊ (Từ File 2)
        seedPaymentsAndSubscriptions(renter1, renter2, renter3);
        seedWalletTransactions(owner1, owner2, rng);
        seedWithdrawRequests(owner1, owner2);

        // 8. BOOKING INTENTS (Từ File 2)
        Map<UUID, List<Room>> areaRoomsMap = new HashMap<>();
        for (RentalArea area : rentalAreas) {
            areaRoomsMap.put(area.getRentalAreaId(), roomRepository.findByRentalArea_RentalAreaId(area.getRentalAreaId()));
        }
        seedBookingIntents(renter1, renter2, areaRoomsMap);

        log.info("[FullDataInitializer] ===================================================");
        log.info("[FullDataInitializer] ✅ ĐÃ SEED THÀNH CÔNG HÀNG NGÀN BẢN GHI DỮ LIỆU!");
        log.info("[FullDataInitializer] ===================================================");
    }

    // ====================================================================================
    // PHẦN 1: DỮ LIỆU DANH MỤC NỀN TẢNG
    // ====================================================================================

    private void seedRoles() {
        createRoleIfNotExist("ADMIN", "Quản trị hệ thống");
        createRoleIfNotExist("OWNER", "Chủ nhà");
        createRoleIfNotExist("RENTER", "Người thuê");
    }

    private void createRoleIfNotExist(String roleName, String description) {
        if (roleRepository.findByRoleName(roleName).isEmpty()) {
            roleRepository.save(Role.builder().roleName(roleName).description(description).active(true).build());
        }
    }

    private void seedCities() {
        List<String> cities = List.of(
                "Hà Nội", "TP. Hồ Chí Minh", "Hải Phòng", "Đà Nẵng", "Cần Thơ", "An Giang", "Bà Rịa - Vũng Tàu",
                "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước",
                "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp",
                "Gia Lai", "Hà Giang", "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình", "Hưng Yên",
                "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An",
                "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam",
                "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên",
                "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
        );
        for (String name : cities) {
            if (!cityRepository.existsByCityName(name)) {
                cityRepository.save(City.builder().cityName(name).build());
            }
        }
    }

    private void seedCategories() {
        List<String> categories = List.of("Phòng học", "Phòng họp", "Phòng lab", "Phòng nhóm", "Phòng thuyết trình", "Phòng thí nghiệm");
        for (String name : categories) {
            if (!categoryRepository.existsByCategoryName(name)) {
                categoryRepository.save(Category.builder().categoryName(name).build());
            }
        }
    }

    private void seedAmenities() {
        List<Amenity> amenities = List.of(
                Amenity.builder().amenityName("Wifi tốc độ cao").iconKey("FaWifi").build(),
                Amenity.builder().amenityName("Máy lạnh").iconKey("FaSnowflake").build(),
                Amenity.builder().amenityName("Ổ điện").iconKey("FaPlug").build(),
                Amenity.builder().amenityName("Bảng trắng").iconKey("FaChalkboard").build(),
                Amenity.builder().amenityName("Máy chiếu").iconKey("FaVideo").build(),
                Amenity.builder().amenityName("TV / Màn hình lớn").iconKey("FaTv").build(),
                Amenity.builder().amenityName("Micro").iconKey("FaMicrophone").build(),
                Amenity.builder().amenityName("Loa").iconKey("FaVolumeUp").build(),
                Amenity.builder().amenityName("Máy tính cấu hình cao").iconKey("FaDesktop").build(),
                Amenity.builder().amenityName("Máy in").iconKey("FaPrint").build(),
                Amenity.builder().amenityName("Server nội bộ").iconKey("FaServer").build(),
                Amenity.builder().amenityName("Thiết bị đo lường").iconKey("FaRulerCombined").build(),
                Amenity.builder().amenityName("Hệ thống thông gió").iconKey("FaFan").build(),
                Amenity.builder().amenityName("Máy lọc nước").iconKey("FaTint").build()
        );
        for (Amenity a : amenities) {
            if (!amenityRepository.existsByAmenityName(a.getAmenityName())) {
                amenityRepository.save(a);
            }
        }
    }

    private void seedPackages() {
        List<RentPackage> packages = new ArrayList<>();
        packages.add(RentPackage.builder().rentPackageName("Trải Nghiệm").price(new BigDecimal("19000")).durationDays(7).maxPosts(5).description("Tối đa 5 bài viết - Hiển thị trong 7 ngày").build());
        packages.add(RentPackage.builder().rentPackageName("Khởi Đầu").price(new BigDecimal("99000")).durationDays(30).maxPosts(15).description("Tối đa 15 bài viết - Hiển thị trong 30 ngày").build());
        packages.add(RentPackage.builder().rentPackageName("Tiêu Chuẩn").price(new BigDecimal("249000")).durationDays(30).maxPosts(50).description("🔥 Tối đa 50 bài viết - Lựa chọn phổ biến nhất (30 ngày)").build());
        packages.add(RentPackage.builder().rentPackageName("Chuyên Nghiệp").price(new BigDecimal("699000")).durationDays(90).maxPosts(150).description("Tối đa 150 bài viết - Hiển thị liên tục suốt 3 tháng").build());
        packages.add(RentPackage.builder().rentPackageName("Đối Tác").price(new BigDecimal("1999000")).durationDays(365).maxPosts(500).description("Tối đa 500 bài viết - Thoải mái đăng tin cả năm").build());

        for (RentPackage rp : packages) {
            if (!rentPackageRepository.existsByRentPackageName(rp.getRentPackageName())) {
                rentPackageRepository.save(rp);
            }
        }
    }

    // ====================================================================================
    // PHẦN 2: NGƯỜI DÙNG & VÍ (FULL TIMELINE)
    // ====================================================================================

    private void seedUsers() {
        Role adminRole = roleRepository.findByRoleName("ADMIN").get();
        Role ownerRole = roleRepository.findByRoleName("OWNER").get();
        Role renterRole = roleRepository.findByRoleName("RENTER").get();

        if (userRepository.count() > 0) return;

        LocalDateTime startOfYear = LocalDateTime.now().withDayOfYear(1);
        List<User> coreUsers = List.of(
                User.builder().userName("RenterName").email("renter@gmail.com").passwordHash(passwordEncoder.encode("12345678")).role(renterRole).active(true).build(),
                User.builder().userName("OwnerName").email("owner@gmail.com").passwordHash(passwordEncoder.encode("12345678")).role(ownerRole).active(true).build(),
                User.builder().userName("AdminName").email("admin@gmail.com").passwordHash(passwordEncoder.encode("12345678")).role(adminRole).active(true).build(),
                User.builder().userName("Quang").email("quang@gmail.com").passwordHash(passwordEncoder.encode("12345678")).role(adminRole).active(true).build(),
                User.builder().userName("Quân").email("quan@gmail.com").passwordHash(passwordEncoder.encode("12345678")).role(renterRole).active(true).build()
        );

        for (User u : coreUsers) {
            User savedUser = userRepository.save(u);
            userRepository.updateCreatedAt(savedUser.getUserId(), startOfYear);
        }

        // Bơm 40 User ảo rải đều khắp năm nay
        LocalDateTime now = LocalDateTime.now();
        int currentYear = now.getYear();
        int currentMonth = now.getMonthValue();
        Random rng = new Random();

        for (int i = 0; i < 40; i++) {
            int month = rng.nextInt(currentMonth) + 1;
            int limitDay = (month == currentMonth) ? Math.max(1, now.getDayOfMonth()) : YearMonth.of(currentYear, month).lengthOfMonth();
            LocalDateTime fakeDate = LocalDateTime.of(currentYear, month, rng.nextInt(limitDay) + 1, rng.nextInt(14) + 8, rng.nextInt(60));
            if (fakeDate.isAfter(now)) fakeDate = now;

            User fakeUser = User.builder()
                    .userName("Fake Renter " + i).email("fake" + i + "@gmail.com")
                    .passwordHash(passwordEncoder.encode("12345678"))
                    .role((i % 3 == 0) ? ownerRole : renterRole).active(true).build();

            User savedUser = userRepository.save(fakeUser);
            userRepository.updateCreatedAt(savedUser.getUserId(), fakeDate);
        }
    }

    private User getOrCreateUser(String email, String name, String roleName) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            Role role = roleRepository.findByRoleName(roleName).get();
            User user = User.builder()
                    .userName(name).email(email).passwordHash(passwordEncoder.encode("12345678"))
                    .phone("09" + String.format("%08d", new Random().nextInt(100000000)))
                    .dateOfBirth(LocalDate.of(1995 + new Random().nextInt(10), 1 + new Random().nextInt(12), 1 + new Random().nextInt(28)))
                    .gender("Other").role(role).active(true).build();
            return userRepository.save(user);
        });
    }

    private void createWalletsForUsers(List<User> users) {
        for (User user : users) {
            if (walletRepository.findByUser(user).isEmpty()) {
                Wallet wallet = Wallet.builder()
                        .user(user)
                        .balance(BigDecimal.valueOf(new Random().nextInt(50000000) + 1000000))
                        .frozenAmount(BigDecimal.ZERO)
                        .walletStatus(WalletStatus.ACTIVE)
                        .build();
                walletRepository.save(wallet);
            }
        }
    }

    // ====================================================================================
    // PHẦN 3: RENTAL AREAS, ROOMS, POSTS
    // ====================================================================================

    private List<RentalArea> seedRentalAreasAndRooms(User owner1, User owner2) {
        List<City> cities = cityRepository.findAll();
        List<Category> categories = categoryRepository.findAll();
        Set<Amenity> amenitySet = new HashSet<>(amenityRepository.findAll());
        User owner = userRepository.findByEmail("owner@gmail.com").orElse(owner1);

        List<RentalArea> rentalAreas = new ArrayList<>();

        // 1. Rental Area mặc định của File 1
        RentalArea area1 = RentalArea.builder()
                .rentalAreaName("EduSpace Premium")
                .address("90 Phạm Đăng Giảng, phường Bình Hưng Hòa")
                .contactName("Quang B")
                .contactPhone("0777964742")
                .owner(owner)
                .city(!cities.isEmpty() ? cities.get(1) : null)
                .status(RentalAreaStatus.ACTIVE)
                .averageRating(BigDecimal.ZERO)
                .totalReviews(0)
                .openTime(LocalTime.of(6, 0))
                .closeTime(LocalTime.of(23, 59))
                .build();
        rentalAreas.add(rentalAreaRepository.save(area1));
        seedRentalAreaImages(area1);

        // Room 1 (Từ File 1)
        Room room1 = Room.builder().roomName("Phòng học 30 người").description("Phòng học").category(categories.get(0)).amenities(amenitySet).rentalArea(area1).capacity(30).area(60.0).price(BigDecimal.valueOf(50000)).roomStatus(RoomStatus.ACTIVE).build();
        roomRepository.save(room1);
        roomCopyRepository.saveAll(List.of(
                RoomCopy.builder().roomCode("Phòng 301").roomCopyStatus(RoomCopyStatus.AVAILABLE).room(room1).build(),
                RoomCopy.builder().roomCode("Phòng 302").roomCopyStatus(RoomCopyStatus.AVAILABLE).room(room1).build(),
                RoomCopy.builder().roomCode("Phòng 303").roomCopyStatus(RoomCopyStatus.AVAILABLE).room(room1).build()
        ));
        seedPost(room1, area1, owner);

        // Room 2 (Từ File 1)
        Room room2 = Room.builder().roomName("Phòng học 40 người").description("Phòng học rộng").category(categories.get(0)).amenities(amenitySet).rentalArea(area1).capacity(40).area(80.0).price(BigDecimal.valueOf(60000)).roomStatus(RoomStatus.ACTIVE).build();
        roomRepository.save(room2);
        roomCopyRepository.saveAll(List.of(
                RoomCopy.builder().roomCode("Phòng 401").roomCopyStatus(RoomCopyStatus.AVAILABLE).room(room2).build(),
                RoomCopy.builder().roomCode("Phòng 402").roomCopyStatus(RoomCopyStatus.AVAILABLE).room(room2).build()
        ));
        seedPost(room2, area1, owner);

        // 2. Thêm các Rental Areas từ File 2
        rentalAreas.add(seedSingleRentalArea("StudyHub Hà Nội", "45 Xuân Thủy, Hà Nội", owner1, cities.get(0)));
        rentalAreas.add(seedSingleRentalArea("ClassRoom Đà Nẵng", "88 Lê Duẩn, Đà Nẵng", owner2, cities.get(3)));
        rentalAreas.add(seedSingleRentalArea("Learning Space Cần Thơ", "456 Nguyễn Văn Cừ, Cần Thơ", owner2, cities.get(4)));

        int imageIdx = 0;
        for (int i = 1; i < rentalAreas.size(); i++) {
            RentalArea area = rentalAreas.get(i);
            List<Room> roomsForArea = seedRoomsForArea(area, categories, amenitySet, imageIdx);
            for (Room r : roomsForArea) seedPost(r, area, area.getOwner());
            imageIdx = (imageIdx + roomsForArea.size()) % ROOM_IMAGES.length;
        }

        return rentalAreas;
    }

    private RentalArea seedSingleRentalArea(String name, String address, User owner, City city) {
        RentalArea area = RentalArea.builder()
                .rentalAreaName(name).address(address).contactName(owner.getUserName() + " Team")
                .contactPhone("08" + String.format("%08d", new Random().nextInt(100000000)))
                .owner(owner).city(city).status(RentalAreaStatus.ACTIVE).averageRating(BigDecimal.ZERO)
                .totalReviews(0).openTime(LocalTime.of(6, 0)).closeTime(LocalTime.of(23, 59)).build();
        RentalArea saved = rentalAreaRepository.save(area);
        seedRentalAreaImages(saved);
        return saved;
    }

    private void seedRentalAreaImages(RentalArea area) {
        String[] areaImages = {
                "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",
                "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80",
                "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&q=80"
        };
        for (int i = 0; i < Math.min(2, areaImages.length); i++) {
            rentalAreaImageRepository.save(RentalAreaImage.builder().rentalArea(area).imageUrl(areaImages[i]).publicId("area_" + area.getRentalAreaId() + "_" + i).isCover(i == 0).sortOrder(i).build());
        }
    }

    private List<Room> seedRoomsForArea(RentalArea area, List<Category> categories, Set<Amenity> amenitySet, int imageOffset) {
        List<Room> rooms = new ArrayList<>();
        String[][] roomData = {
                {"Phòng Học 25 Người", "25", "80000", "Phòng học hiện đại"},
                {"Phòng Họp VIP 12 Người", "12", "120000", "Phòng họp cao cấp"},
                {"Phòng Lab Máy Tính", "20", "150000", "20 máy tính mạnh mẽ"},
                {"Phòng Nhóm Mini", "8", "60000", "Phòng nhỏ ấm cúng"}
        };

        for (int i = 0; i < roomData.length; i++) {
            Category category = categories.isEmpty() ? null : categories.get(i % categories.size());
            Room room = Room.builder().roomName(roomData[i][0]).description(roomData[i][3]).roomStatus(RoomStatus.ACTIVE)
                    .capacity(Integer.parseInt(roomData[i][1])).area(Double.parseDouble(roomData[i][1]) * 2).amenities(amenitySet)
                    .rentalArea(area).category(category).price(new BigDecimal(roomData[i][2])).build();
            Room savedRoom = roomRepository.save(room);

            for (int j = 0; j < 2; j++) {
                roomCopyRepository.save(RoomCopy.builder().roomCode(area.getRentalAreaName().substring(0, 3).toUpperCase() + "-" + String.format("%02d", i + 1) + "-" + String.format("%02d", j + 1)).roomCopyStatus(RoomCopyStatus.AVAILABLE).room(savedRoom).build());
                roomImageRepository.save(RoomImage.builder().room(savedRoom).imageUrl(ROOM_IMAGES[(imageOffset + i + j) % ROOM_IMAGES.length]).publicId("room_" + savedRoom.getRoomId() + "_" + j).isCover(j == 0).sortOrder(j).build());
            }
            rooms.add(savedRoom);
        }
        return rooms;
    }

    private Post seedPost(Room room, RentalArea area, User owner) {
        int roll = new Random().nextInt(100);
        PostStatus status = (roll < 60) ? PostStatus.PUBLISHED : (roll < 85 ? PostStatus.PENDING : (roll < 95 ? PostStatus.HIDDEN : PostStatus.DELETED));
        String content = String.format("# %s\n**Địa chỉ:** %s\n**Sức chứa:** %d người\n**Giá thuê:** %,d VNĐ/giờ\n## Mô tả\n%s", room.getRoomName(), area.getAddress(), room.getCapacity(), room.getPrice().longValue(), room.getDescription());
        return postRepository.save(Post.builder().title(room.getRoomName() + " — " + area.getRentalAreaName()).content(content).postStatus(status).user(owner).room(room).rentalArea(area).build());
    }

    // ====================================================================================
    // PHẦN 4: BOOKINGS & REVIEWS (TEST CASES VÀ MASS DATA)
    // ====================================================================================

    private void seedTestBookingsAndReviews() {
        User renter = userRepository.findByEmail("renter@gmail.com").get();
        RentalArea rentalArea = rentalAreaRepository.findAll().getFirst();

        // 5 Bookings theo kịch bản Test của File 1
        Booking b1 = Booking.builder().bookingTitle("Phong hoc sang 8h-12h").bookingStatus(BookingStatus.COMPLETED).totalPrice(BigDecimal.valueOf(200000)).note("Can phong yen tinh de on thi").startTime(LocalDateTime.now().minusDays(10)).endTime(LocalDateTime.now().minusDays(10).plusHours(4)).checkIn(LocalDateTime.now().minusDays(10)).checkOut(LocalDateTime.now().minusDays(10).plusHours(4)).renter(renter).rentalArea(rentalArea).bookingType(BookingType.HOURLY).build();
        Booking b2 = Booking.builder().bookingTitle("Phong hop nhom du an").bookingStatus(BookingStatus.COMPLETED).totalPrice(BigDecimal.valueOf(300000)).note("Hop nhom 5 nguoi").startTime(LocalDateTime.now().minusDays(5)).endTime(LocalDateTime.now().minusDays(5).plusHours(6)).checkIn(LocalDateTime.now().minusDays(5)).checkOut(LocalDateTime.now().minusDays(5).plusHours(6)).renter(renter).rentalArea(rentalArea).bookingType(BookingType.HOURLY).build();
        Booking b3 = Booking.builder().bookingTitle("Phong thuyet trinh").bookingStatus(BookingStatus.COMPLETED).totalPrice(BigDecimal.valueOf(150000)).note("Thuyet trinh seminar").startTime(LocalDateTime.now().minusDays(3)).endTime(LocalDateTime.now().minusDays(3).plusHours(3)).checkIn(LocalDateTime.now().minusDays(3)).checkOut(LocalDateTime.now().minusDays(3).plusHours(3)).renter(renter).rentalArea(rentalArea).bookingType(BookingType.HOURLY).build();
        Booking b4 = Booking.builder().bookingTitle("Phong hoc toi nay").bookingStatus(BookingStatus.PENDING).totalPrice(BigDecimal.valueOf(100000)).note("Booking chua duoc duyet").startTime(LocalDateTime.now().plusHours(2)).endTime(LocalDateTime.now().plusHours(6)).renter(renter).rentalArea(rentalArea).bookingType(BookingType.HOURLY).build();
        Booking b5 = Booking.builder().bookingTitle("Phong bi huy").bookingStatus(BookingStatus.CANCELLED).totalPrice(BigDecimal.valueOf(100000)).note("Khach tu huy").startTime(LocalDateTime.now().minusDays(1)).endTime(LocalDateTime.now().minusDays(1).plusHours(4)).renter(renter).rentalArea(rentalArea).bookingType(BookingType.HOURLY).build();

        bookingRepository.saveAll(List.of(b1, b2, b3, b4, b5));

        // 3 Reviews tương ứng kịch bản FE Admin của File 1
        reviewRepository.saveAll(List.of(
                Review.builder().reviewer(renter).booking(b1).rentalArea(rentalArea).rating(5).comment("Phòng học cực kỳ xịn xò, yên tĩnh. Rất đáng tiền!").status(ReviewStatus.APPROVED).helpfulCount(12).build(),
                Review.builder().reviewer(renter).booking(b2).rentalArea(rentalArea).rating(3).comment("Không gian ổn, nhưng máy lạnh hơi yếu một chút.").status(ReviewStatus.PENDING_MODERATION).helpfulCount(2).build(),
                Review.builder().reviewer(renter).booking(b3).rentalArea(rentalArea).rating(1).comment("Nội dung chứa từ ngữ thô tục, vi phạm tiêu chuẩn cộng đồng...").status(ReviewStatus.HIDDEN).helpfulCount(0).build()
        ));
    }

    private int[] seedMassBookingsAndReviewsForArea(RentalArea area, User renter1, User renter2, User renter3, Random rng) {
        List<User> renters = List.of(renter1, renter2, renter3);
        List<String> comments = List.of("Phòng sạch, thoáng mát, wifi nhanh.", "Không gian yên tĩnh, phù hợp học nhóm.", "Thiết bị đầy đủ, máy chiếu sắc nét.", "Nhân viên hỗ trợ tốt.", "Phòng ổn, nhưng wifi hơi chập chờn.");
        int[] ratings = {5, 5, 5, 4, 4};
        int bookingCount = 0, reviewCount = 0, commentIdx = 0;

        // --- BƯỚC THÊM MỚI: Lấy danh sách RoomCopy thuộc RentalArea này ---
        List<Room> areaRooms = roomRepository.findByRentalArea_RentalAreaId(area.getRentalAreaId());
        List<RoomCopy> availableCopies = new ArrayList<>();
        for (Room room : areaRooms) {
            // Lấy các RoomCopy thuộc về Room này
            List<RoomCopy> copiesForRoom = roomCopyRepository.findAll().stream()
                    .filter(rc -> rc.getRoom() != null && rc.getRoom().getRoomId().equals(room.getRoomId()))
                    .toList();
            availableCopies.addAll(copiesForRoom);
        }

        // Nếu khu vực này chưa có RoomCopy nào thì bỏ qua để tránh lỗi
        if (availableCopies.isEmpty()) {
            log.warn("[FullDataInitializer] Khu vực {} không có RoomCopy, bỏ qua seed booking.", area.getRentalAreaName());
            return new int[]{0, 0};
        }
        // ------------------------------------------------------------------

        LocalDateTime now = LocalDateTime.now();
        List<LocalDateTime> targetDates = new ArrayList<>();

        // Rải đều 12 tháng năm nay
        for (int month = 1; month <= now.getMonthValue(); month++) {
            int limitDay = (month == now.getMonthValue()) ? Math.max(1, now.getDayOfMonth()) : YearMonth.of(now.getYear(), month).lengthOfMonth();
            for (int i = 0; i < rng.nextInt(3) + 1; i++) {
                LocalDateTime d = LocalDateTime.of(now.getYear(), month, rng.nextInt(limitDay) + 1, rng.nextInt(10) + 8, 0);
                if (d.isBefore(now)) targetDates.add(d);
            }
        }
        // Thêm cho 7 ngày qua
        for (int i = 0; i < 7; i++) {
            LocalDateTime d = now.minusDays(i).withHour(rng.nextInt(10) + 8).withMinute(0);
            if (d.getYear() == now.getYear()) targetDates.add(d);
        }
        Collections.sort(targetDates);

        for (LocalDateTime start : targetDates) {
            int durationHrs = rng.nextInt(6) + 2;
            LocalDateTime end = start.plusHours(durationHrs);
            BigDecimal price = BigDecimal.valueOf(durationHrs * 40000L);
            int roll = rng.nextInt(100);
            BookingStatus status = (roll < 70) ? BookingStatus.COMPLETED : (roll < 90 ? BookingStatus.BOOKED : BookingStatus.CANCELLED);
            User renter = renters.get(rng.nextInt(renters.size()));

            Booking booking = Booking.builder().bookingTitle("Đặt phòng tại " + area.getRentalAreaName()).bookingStatus(status).totalPrice(price).note("Demo booking").startTime(start).endTime(end).checkIn(status == BookingStatus.COMPLETED ? start : null).checkOut(status == BookingStatus.COMPLETED ? end : null).escrowReleasedAt(status == BookingStatus.COMPLETED ? end.plusDays(7) : null).renter(renter).rentalArea(area).bookingType(BookingType.HOURLY).disputeFlag(false).build();
            Booking savedBooking = bookingRepository.save(booking);
            bookingRepository.updateCreatedAt(savedBooking.getBookingId(), start);
            bookingCount++;

            // --- BƯỚC THÊM MỚI: Chọn ngẫu nhiên 1 RoomCopy cho Booking này ---
            RoomCopy selectedRoomCopy = availableCopies.get(rng.nextInt(availableCopies.size()));

            // Thêm Slots
            LocalDateTime slotStart = start;
            while (slotStart.isBefore(end)) {
                LocalDateTime slotEnd = slotStart.plusHours(1);
                if (slotEnd.isAfter(end)) slotEnd = end;

                slotRepository.save(Slot.builder()
                        .startTime(slotStart)
                        .endTime(slotEnd)
                        .price(price.divide(BigDecimal.valueOf(durationHrs), 2, RoundingMode.HALF_UP))
                        .slotStatus(SlotStatus.BOOKED)
                        .booking(savedBooking)
                        .roomCopy(selectedRoomCopy) // <--- FIX LỖI: Gán RoomCopy vào Slot
                        .build());

                slotStart = slotEnd;
            }

            // Thêm Reviews (Chỉ Completed)
            if (status == BookingStatus.COMPLETED && commentIdx < comments.size()) {
                reviewRepository.save(Review.builder().reviewer(renter).booking(savedBooking).rentalArea(area).rating(ratings[commentIdx % ratings.length]).comment(comments.get(commentIdx % comments.size())).status(ReviewStatus.APPROVED).helpfulCount(rng.nextInt(20)).build());
                reviewCount++;
                commentIdx++;
            }
            // QR Code
            bookingQRRepository.save(BookingQR.builder().booking(savedBooking).qrToken(UUID.randomUUID().toString()).qrType(QRType.CHECK_IN).expireAt(end.plusDays(1)).build());
        }

        // Cập nhật rating tổng
        List<Review> areaReviews = reviewRepository.findAll().stream().filter(r -> r.getRentalArea().getRentalAreaId().equals(area.getRentalAreaId())).toList();
        if (!areaReviews.isEmpty()) {
            area.setAverageRating(BigDecimal.valueOf(areaReviews.stream().mapToInt(Review::getRating).average().orElse(0)).setScale(2, RoundingMode.HALF_UP));
            area.setTotalReviews(areaReviews.size());
            rentalAreaRepository.save(area);
        }
        return new int[]{bookingCount, reviewCount};
    }

    private void seedReviewDetails(Random rng) {
        List<Review> reviews = reviewRepository.findAll().stream().filter(r -> r.getStatus() == ReviewStatus.APPROVED).limit(10).toList();
        String[] tags = {"Sạch sẽ", "Yên tĩnh", "WiFi tốt", "Điều hòa mát", "Vị trí tốt", "Giá phải chăng"};
        for (int i = 0; i < reviews.size(); i++) {
            Review review = reviews.get(i);
            if (i % 2 == 0)
                reviewMediaRepository.save(ReviewMedia.builder().review(review).url(ROOM_IMAGES[i % ROOM_IMAGES.length]).mediaType(MediaType.IMAGE).build());
            for (int j = 0; j < 2; j++)
                reviewTagRepository.save(ReviewTag.builder().review(review).tagName(tags[(i + j) % tags.length]).build());
            for (int j = 0; j < 3; j++) {
                try {
                    reviewVoteRepository.save(ReviewVote.builder().review(review).user(userRepository.findAll().get(j % userRepository.findAll().size())).build());
                } catch (Exception ignored) {
                }
            }
            if (i % 3 == 0 && review.getRentalArea().getOwner() != null)
                reviewReplyRepository.save(ReviewReply.builder().review(review).owner(review.getRentalArea().getOwner()).content("Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!").build());
        }
    }

    // ====================================================================================
    // PHẦN 5: GIAO TIẾP & TÀI CHÍNH KHÁC
    // ====================================================================================

    private void seedConversations(User owner, User renter1, User renter2) {
        String[][] convos = {
                {"owner", "renter1", "Xin chào, bạn muốn hỏi gì?", "Phòng này có WiFi không?", "Có, WiFi siêu nhanh"},
                {"owner", "renter2", "Chào bạn", "Khi nào có phòng trống?", "Tuần tới đã sẵn sàng"}
        };
        for (String[] convo : convos) {
            User user1 = convo[0].equals("owner") ? owner : renter1;
            User user2 = convo[1].equals("renter1") ? renter1 : renter2;
            Conversation savedConvo = conversationRepository.save(Conversation.builder().conversationTitle("Chat giữa " + user1.getUserName() + " và " + user2.getUserName()).user1(user1).user2(user2).build());
            LocalDateTime time = LocalDateTime.now().minusDays(5);
            for (int i = 2; i < convo.length; i++) {
                User sender = (i % 2 == 0) ? user1 : user2;
                messageRepository.save(Message.builder().conversation(savedConvo).sender(sender).recipient(sender.equals(user1) ? user2 : user1).messageBody(convo[i]).status(MessageStatus.DELIVERED).build());
                time = time.plusMinutes(15);
            }
        }
    }

    private void seedNotifications(User... users) {
        String[] msgs = {"Đặt phòng của bạn vừa được xác nhận", "Chủ phòng vừa trả lời bạn", "Bạn có 30 phút để check-in"};
        for (User user : users) {
            for (int i = 0; i < 3; i++) {
                notificationRepository.save(Notification.builder().notificationTitle("Thông báo").notificationBody(msgs[i]).recipient(user).type(NotificationType.BOOKING).isRead(i % 2 == 0).isDeleted(false).build());
            }
        }
    }

    private void seedPaymentsAndSubscriptions(User... renters) {
        List<RentPackage> packages = rentPackageRepository.findAll();
        for (User renter : renters) {
            Wallet wallet = walletRepository.findByUser(renter).orElse(null);
            if (wallet == null) continue;
            RentPackage pkg = packages.get(new Random().nextInt(packages.size()));
            Payment payment = paymentRepository.save(Payment.builder().user(renter).wallet(wallet).amount(pkg.getPrice()).transactionDate(LocalDateTime.now().minusDays(new Random().nextInt(30))).paymentMethod(PaymentMethod.WALLET).paymentStatus(PaymentStatus.SUCCESS).build());
            Order order = orderRepository.save(Order.builder().wallet(wallet).rentPackage(pkg).totalAmount(pkg.getPrice()).orderStatus("COMPLETED").build());
            LocalDateTime startDate = LocalDateTime.now().minusDays(new Random().nextInt(30));
            subscriptionRepository.save(Subscription.builder().user(renter).rentPackage(pkg).startDate(startDate).endDate(startDate.plusDays(pkg.getDurationDays())).active(startDate.plusDays(pkg.getDurationDays()).isAfter(LocalDateTime.now())).order(order).build());
        }
    }

    private void seedWalletTransactions(User owner1, User owner2, Random rng) {
        LocalDateTime now = LocalDateTime.now();
        for (User owner : List.of(owner1, owner2)) {
            Wallet wallet = walletRepository.findByUser(owner).orElse(null);
            if (wallet == null) continue;
            BigDecimal runningBalance = wallet.getBalance();
            List<LocalDateTime> targetDates = new ArrayList<>();
            for (int month = 1; month <= now.getMonthValue(); month++) {
                int limitDay = (month == now.getMonthValue()) ? Math.max(1, now.getDayOfMonth()) : YearMonth.of(now.getYear(), month).lengthOfMonth();
                for (int i = 0; i < rng.nextInt(2) + 1; i++) {
                    LocalDateTime fakeDate = LocalDateTime.of(now.getYear(), month, rng.nextInt(limitDay) + 1, rng.nextInt(14) + 8, rng.nextInt(60));
                    if (fakeDate.isBefore(now)) targetDates.add(fakeDate);
                }
            }
            Collections.sort(targetDates);
            for (LocalDateTime date : targetDates) {
                BigDecimal amount = BigDecimal.valueOf(rng.nextInt(3000000) + 500000);
                WalletTransaction txn = walletTransactionRepository.save(WalletTransaction.builder().wallet(wallet).type(WalletTxType.BOOKING_INCOME).legacyType(WalletTxType.BOOKING_INCOME.name()).status(WalletTxStatus.COMPLETED).legacyStatus(WalletTxStatus.COMPLETED.name()).amount(amount).balanceBefore(runningBalance).balanceAfter(runningBalance.add(amount)).description("Thu nhập đặt phòng").build());
                walletTransactionRepository.updateCreatedAt(txn.getWalletTransactionId(), date);
                runningBalance = runningBalance.add(amount);
            }
            wallet.setBalance(runningBalance);
            walletRepository.save(wallet);
        }
    }

    private void seedWithdrawRequests(User... owners) {
        String[] banks = {"VCB", "MB", "ACB", "TCB"};
        for (User owner : owners) {
            Wallet wallet = walletRepository.findByUser(owner).orElse(null);
            if (wallet != null && wallet.getBalance().compareTo(BigDecimal.ZERO) > 0) {
                withdrawRequestRepository.save(WithdrawRequest.builder().wallet(wallet).amount(wallet.getBalance().divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP)).bankCode(banks[new Random().nextInt(banks.length)]).bankAccountNumber("123456789").bankAccountName(owner.getUserName()).status(WithdrawStatus.PENDING).build());
            }
        }
    }

    private void seedReports(User... renters) {
        for (User renter : renters) {
            reportRepository.save(Report.builder().user(renter).title("Thiết bị hỏng").content("Điều hòa không hoạt động").address("Địa chỉ phòng").status(ReportStatus.PENDING).isDeleted(false).build());
        }
    }

    private void seedBookingIntents(User renter1, User renter2, Map<UUID, List<Room>> areaRoomsMap) {
        List<Room> allRooms = new ArrayList<>();
        areaRoomsMap.values().forEach(allRooms::addAll);
        if (allRooms.isEmpty()) return;

        for (User renter : List.of(renter1, renter2)) {
            for (int i = 0; i < new Random().nextInt(2) + 1; i++) {
                LocalDateTime startTime = LocalDateTime.now().plusDays(new Random().nextInt(30) + 1);
                BookingIntent intent = bookingIntentRepository.save(BookingIntent.builder().user(renter).title("Ý định đặt phòng " + (i + 1)).note("Demo booking intent").numberOfMonths(1).status(BookingIntentStatus.ACTIVE).bookingType(BookingType.HOURLY).previewPrice(BigDecimal.valueOf(500000)).startTime(startTime).endTime(startTime.plusMonths(1)).expiresAt(LocalDateTime.now().plusDays(7)).build());
                for (int j = 0; j < 2; j++) {
                    Room room = allRooms.get(new Random().nextInt(allRooms.size()));
                    intentSlotRepository.save(IntentSlot.builder().bookingIntent(intent).room(room).quantity(new Random().nextInt(5) + 1).startTime(startTime.plusDays(j)).endTime(startTime.plusDays(j).plusHours(4)).price(room.getPrice()).build());
                }
            }
        }
    }
}