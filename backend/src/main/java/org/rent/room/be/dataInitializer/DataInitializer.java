package org.rent.room.be.dataInitializer;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.rent.room.be.constant.*;
import org.rent.room.be.entity.*;
import org.rent.room.be.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DataInitializer implements CommandLineRunner {

    PasswordEncoder passwordEncoder;
    UserRepository userRepository;
    RoleRepository roleRepository;
    CityRepository cityRepository;
    CategoryRepository categoryRepository;
    AmenityRepository amenityRepository;
    RoomCopyRepository roomCopyRepository;
    RoomRepository roomRepository;
    RentalAreaRepository rentalAreaRepository;
    RentPackageRepository rentPackageRepository;
    BookingRepository bookingRepository;
    ReviewRepository reviewRepository;

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedCities();
        seedCategories();
        seedAmenities();
        seedRooms();
        seedPackages();
        seedBookings();
        seedReviews();
    }


    private void seedRooms() {
        List<City> cities = cityRepository.findAll();
        List<Amenity> amenities = amenityRepository.findAll();
        Set<Amenity> amenitySet = new HashSet<>(amenities);
        List<Category> categories = categoryRepository.findAll();
        User owner = userRepository.findByEmail("owner@gmail.com").orElse(null);
        RentalArea rentalArea = RentalArea.builder()
                .address("90 Phạm Đăng Giảng, phường Bình Hưng Hòa")
                .contactName("Quang B")
                .contactPhone("0777964742")
                .owner(owner)
                .city(!cities.isEmpty() ? cities.get(0) : null)
                .status(RentalAreaStatus.ACTIVE)
                .build();
        rentalAreaRepository.save(rentalArea);

        Room room1 = Room.builder()
                .roomName("Phòng học 30 người")
                .description("Phòng học")
                .category(categories.get(0))
                .amenities(amenitySet)
                .rentalArea(rentalArea)
                .capacity(30)
                .price(BigDecimal.valueOf(50000))
                .build();

        roomRepository.save(room1);
        RoomCopy roomCopy1 = RoomCopy.builder()
                .roomCode("Phòng 301")
                .roomCopyStatus(RoomCopyStatus.AVAILABLE)
                .room(room1)
                .build();

        RoomCopy roomCopy2 = RoomCopy.builder()
                .roomCode("Phòng 302")
                .roomCopyStatus(RoomCopyStatus.AVAILABLE)
                .room(room1)
                .build();

        RoomCopy roomCopy3 = RoomCopy.builder()
                .roomCode("Phòng 303")
                .roomCopyStatus(RoomCopyStatus.AVAILABLE)
                .room(room1)
                .build();

        roomCopyRepository.saveAll(List.of(roomCopy1, roomCopy2, roomCopy3));

        Room room2 = Room.builder()
                .roomName("Phòng học 40 người")
                .description("Phòng học")
                .category(categories.get(0))
                .amenities(amenitySet)
                .rentalArea(rentalArea)
                .capacity(40)
                .price(BigDecimal.valueOf(60000))
                .build();

        roomRepository.save(room2);

        // Room Copies (401,402)
        RoomCopy roomCopy4 = RoomCopy.builder()
                .roomCode("Phòng 401")
                .roomCopyStatus(RoomCopyStatus.AVAILABLE)
                .room(room2)
                .build();

        RoomCopy roomCopy5 = RoomCopy.builder()
                .roomCode("Phòng 402")
                .roomCopyStatus(RoomCopyStatus.AVAILABLE)
                .room(room2)
                .build();

        roomCopyRepository.saveAll(List.of(roomCopy4, roomCopy5));
    }


    private void seedUsers() {
        Role adminRole = createRoleIfNotExist("ADMIN", "Quản trị hệ thống");
        Role ownerRole = createRoleIfNotExist("OWNER", "Chủ nhà");
        Role renterRole = createRoleIfNotExist("RENTER", "Người thuê");

        if (userRepository.count() > 0) return;

        // 1. Tạo 5 Users cứng để Login (Set thời gian là đầu năm)
        LocalDateTime startOfYear = LocalDateTime.now().withDayOfYear(1);

        List<User> coreUsers = List.of(
                User.builder().userName("RenterName").email("renter@gmail.com").passwordHash(passwordEncoder.encode("12345678")).role(ownerRole).active(true).build(),
                User.builder().userName("OwnerName").email("owner@gmail.com").passwordHash(passwordEncoder.encode("12345678")).role(ownerRole).active(true).build(),
                User.builder().userName("AdminName").email("admin@gmail.com").passwordHash(passwordEncoder.encode("12345678")).role(adminRole).active(true).build(),
                User.builder().userName("Quang").email("quang@gmail.com").passwordHash(passwordEncoder.encode("12345678")).role(adminRole).active(true).build(),
                User.builder().userName("Quân").email("quan@gmail.com").passwordHash(passwordEncoder.encode("12345678")).role(renterRole).active(true).build()
        );

        for (User u : coreUsers) {
            User savedUser = userRepository.save(u);
            userRepository.updateCreatedAt(savedUser.getUserId(), startOfYear); // Update thời gian
        }

        // 2. Bơm thêm 40 User ảo rải đều khắp năm nay
        LocalDateTime now = LocalDateTime.now();
        int currentYear = now.getYear();
        int currentMonth = now.getMonthValue();
        Random rng = new Random();

        for (int i = 0; i < 40; i++) {
            // Random tháng từ 1 đến tháng hiện tại
            int month = rng.nextInt(currentMonth) + 1;
            int limitDay = (month == currentMonth) ? Math.max(1, now.getDayOfMonth()) : YearMonth.of(currentYear, month).lengthOfMonth();

            LocalDateTime fakeDate = LocalDateTime.of(currentYear, month, rng.nextInt(limitDay) + 1, rng.nextInt(14) + 8, rng.nextInt(60));

            // Tránh lỗi ném về tương lai
            if (fakeDate.isAfter(now)) fakeDate = now;

            User fakeUser = User.builder()
                    .userName("Fake Renter " + i)
                    .email("fake" + i + "@gmail.com")
                    .passwordHash(passwordEncoder.encode("12345678"))
                    .role((i % 3 == 0) ? ownerRole : renterRole) // Tỉ lệ 1 Chủ nhà : 2 Khách thuê
                    .active(true)
                    .build();

            User savedUser = userRepository.save(fakeUser);
            userRepository.updateCreatedAt(savedUser.getUserId(), fakeDate);
        }
    }


    private void seedCities() {

        List<String> cities = List.of(
                "Hà Nội",
                "TP. Hồ Chí Minh",
                "Hải Phòng",
                "Đà Nẵng",
                "Cần Thơ",
                "An Giang",
                "Bà Rịa - Vũng Tàu",
                "Bắc Giang",
                "Bắc Kạn",
                "Bạc Liêu",
                "Bắc Ninh",
                "Bến Tre",
                "Bình Định",
                "Bình Dương",
                "Bình Phước",
                "Bình Thuận",
                "Cà Mau",
                "Cao Bằng",
                "Đắk Lắk",
                "Đắk Nông",
                "Điện Biên",
                "Đồng Nai",
                "Đồng Tháp",
                "Gia Lai",
                "Hà Giang",
                "Hà Nam",
                "Hà Tĩnh",
                "Hải Dương",
                "Hậu Giang",
                "Hòa Bình",
                "Hưng Yên",
                "Khánh Hòa",
                "Kiên Giang",
                "Kon Tum",
                "Lai Châu",
                "Lâm Đồng",
                "Lạng Sơn",
                "Lào Cai",
                "Long An",
                "Nam Định",
                "Nghệ An",
                "Ninh Bình",
                "Ninh Thuận",
                "Phú Thọ",
                "Phú Yên",
                "Quảng Bình",
                "Quảng Nam",
                "Quảng Ngãi",
                "Quảng Ninh",
                "Quảng Trị",
                "Sóc Trăng",
                "Sơn La",
                "Tây Ninh",
                "Thái Bình",
                "Thái Nguyên",
                "Thanh Hóa",
                "Thừa Thiên Huế",
                "Tiền Giang",
                "Trà Vinh",
                "Tuyên Quang",
                "Vĩnh Long",
                "Vĩnh Phúc",
                "Yên Bái"
        );

        for (String name : cities) {
            if (!cityRepository.existsByCityName(name)) {
                cityRepository.save(
                        City.builder()
                                .cityName(name)
                                .build()
                );
            }
        }
    }

    private void seedCategories() {
        List<String> categories = List.of(
                "Phòng học",
                "Phòng họp",
                "Phòng lab",
                "Phòng nhóm",
                "Phòng thuyết trình",
                "Phòng thí nghiệm"
        );

        for (String name : categories) {
            if (!categoryRepository.existsByCategoryName(name)) {
                categoryRepository.save(Category.builder()
                        .categoryName(name)
                        .build());
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



    private Role createRoleIfNotExist(String roleName, String description) {
        return roleRepository.findByRoleName(roleName)
                .orElseGet(() -> roleRepository.save(
                        org.rent.room.be.entity.Role.builder()
                                .roleName(roleName)
                                .description(description)
                                .active(true)
                                .build()
                ));
    }

    private void seedPackages() {
        List<RentPackage> packages = new ArrayList<>();

        // 1. Gói Trải Nghiệm (Chim mồi / Dùng thử)
        // Cho phép đăng ít bài, thời gian ngắn để khách test tính năng.
        packages.add(RentPackage.builder()
                .rentPackageName("Trải Nghiệm")
                .price(new BigDecimal("19000"))
                .durationDays(7)
                 .maxPosts(5)
                .description("Tối đa 5 bài viết - Hiển thị trong 7 ngày")
                .build());

        // 2. Gói Khởi Đầu (Nhu cầu cá nhân ít tin)
        // Thời gian dài hơn (1 tháng), số bài vừa đủ cho người dùng cá nhân.
        packages.add(RentPackage.builder()
                .rentPackageName("Khởi Đầu")
                .price(new BigDecimal("99000"))
                .durationDays(30)
                 .maxPosts(15)
                .description("Tối đa 15 bài viết - Hiển thị trong 30 ngày")
                .build());

        // 3. Gói Tiêu Chuẩn (Gói HERO - Dễ bán nhất)
        // Đẩy số lượng bài lên cao với mức giá hợp lý để thuyết phục người dùng chọn gói này.
        packages.add(RentPackage.builder()
                .rentPackageName("Tiêu Chuẩn")
                .price(new BigDecimal("249000"))
                .durationDays(30)
                 .maxPosts(50)
                .description("🔥 Tối đa 50 bài viết - Lựa chọn phổ biến nhất (30 ngày)")
                .build());

        // 4. Gói Chuyên Nghiệp (Dành cho môi giới / người bán chuyên)
        // Mua sỉ bán lẻ: Thời gian dài hơn, số bài nhiều hơn, giá chia trung bình trên mỗi bài sẽ rất rẻ.
        packages.add(RentPackage.builder()
                .rentPackageName("Chuyên Nghiệp")
                .price(new BigDecimal("699000"))
                .durationDays(90)
                 .maxPosts(150)
                .description("Tối đa 150 bài viết - Hiển thị liên tục suốt 3 tháng")
                .build());

        // 5. Gói Đối Tác (Gói cao cấp nhất)
        // Khóa chân khách hàng thân thiết.
        packages.add(RentPackage.builder()
                .rentPackageName("Đối Tác")
                .price(new BigDecimal("1999000"))
                .durationDays(365)
                 .maxPosts(500)
                .description("Tối đa 500 bài viết - Thoải mái đăng tin cả năm")
                .build());

        for (RentPackage rp : packages) {
            if (!rentPackageRepository.existsByRentPackageName(rp.getRentPackageName())) {
                rentPackageRepository.save(rp);
            }
        }
    }


    // ================================================================
    // SEED BOOKINGS (MOI) - Tao du lieu de test Review API
    // ================================================================

    /**
     * Tao 5 booking voi cac trang thai khac nhau de test tat ca case:
     *
     * booking_completed_1  -> COMPLETED -> dung de test TAO REVIEW thanh cong
     * booking_completed_2  -> COMPLETED -> dung de test TAO REVIEW thu 2 (khac booking)
     * booking_completed_3  -> COMPLETED -> dung de test XOA review roi kiem tra stats
     * booking_pending      -> PENDING   -> dung de test loi BOOKING_NOT_COMPLETED
     * booking_cancelled    -> CANCELLED -> dung de test loi BOOKING_NOT_COMPLETED
     */
    private void seedBookings() {
        // Tranh seed lai neu da co booking roi
        if (bookingRepository.count() > 0) {
            log.info("[DataInitializer] Bookings da ton tai, bo qua seedBookings()");
            return;
        }
        System.out.println();

        // Lay user can thiet
        User renter = userRepository.findByEmail("renter@gmail.com")
                .orElseThrow(() -> new RuntimeException("Khong tim thay renter, chay seedUsers() truoc"));
        User owner = userRepository.findByEmail("owner@gmail.com")
                .orElseThrow(() -> new RuntimeException("Khong tim thay owner"));

        // Lay rental area dau tien (duoc tao trong seedRooms())
        List<RentalArea> rentalAreas = rentalAreaRepository.findAll();
        if (rentalAreas.isEmpty()) {
            log.warn("[DataInitializer] Chua co RentalArea, bo qua seedBookings()");
            return;
        }
        RentalArea rentalArea = rentalAreas.getFirst();

        // ---- FIX: Dam bao RentalArea co owner (bug trong seedRooms() cu) ----
        if (rentalArea.getOwner() == null) {
            rentalArea.setOwner(owner);
            rentalAreaRepository.save(rentalArea);
            log.info("[DataInitializer] Da gan owner cho RentalArea: {}", rentalArea.getRentalAreaId());
        }

        // ---- BOOKING 1: COMPLETED - Happy path test ----
        Booking booking1 = Booking.builder()
                .bookingTitle("Phong hoc sang 8h-12h")
                .bookingStatus(BookingStatus.COMPLETED)
                .totalPrice(BigDecimal.valueOf(200000))
                .note("Can phong yen tinh de on thi")
                .startTime(LocalDateTime.now().minusDays(10))
                .endTime(LocalDateTime.now().minusDays(10).plusHours(4))
                .checkIn(LocalDateTime.now().minusDays(10))
                .checkOut(LocalDateTime.now().minusDays(10).plusHours(4))
                .renter(renter)
                .rentalArea(rentalArea)
                .bookingType(BookingType.HOURLY)
                .build();

        // ---- BOOKING 2: COMPLETED - Test review thu 2 (khac booking) ----
        Booking booking2 = Booking.builder()
                .bookingTitle("Phong hop nhom du an")
                .bookingStatus(BookingStatus.COMPLETED)
                .totalPrice(BigDecimal.valueOf(300000))
                .note("Hop nhom 5 nguoi")
                .startTime(LocalDateTime.now().minusDays(5))
                .endTime(LocalDateTime.now().minusDays(5).plusHours(6))
                .checkIn(LocalDateTime.now().minusDays(5))
                .checkOut(LocalDateTime.now().minusDays(5).plusHours(6))
                .renter(renter)
                .rentalArea(rentalArea)
                .bookingType(BookingType.HOURLY)
                .build();

        // ---- BOOKING 3: COMPLETED - Test xoa review roi kiem tra stats ----
        Booking booking3 = Booking.builder()
                .bookingTitle("Phong thuyet trinh")
                .bookingStatus(BookingStatus.COMPLETED)
                .totalPrice(BigDecimal.valueOf(150000))
                .note("Thuyet trinh seminar")
                .startTime(LocalDateTime.now().minusDays(3))
                .endTime(LocalDateTime.now().minusDays(3).plusHours(3))
                .checkIn(LocalDateTime.now().minusDays(3))
                .checkOut(LocalDateTime.now().minusDays(3).plusHours(3))
                .renter(renter)
                .rentalArea(rentalArea)
                .bookingType(BookingType.HOURLY)
                .build();

        // ---- BOOKING 4: PENDING - Test loi BOOKING_NOT_COMPLETED ----
        Booking booking4 = Booking.builder()
                .bookingTitle("Phong hoc toi nay")
                .bookingStatus(BookingStatus.PENDING)
                .totalPrice(BigDecimal.valueOf(100000))
                .note("Booking chua duoc duyet")
                .startTime(LocalDateTime.now().plusHours(2))
                .endTime(LocalDateTime.now().plusHours(6))
                .renter(renter)
                .rentalArea(rentalArea)
                .bookingType(BookingType.HOURLY)
                .build();

        // ---- BOOKING 5: CANCELLED - Test loi BOOKING_NOT_COMPLETED ----
        Booking booking5 = Booking.builder()
                .bookingTitle("Phong bi huy")
                .bookingStatus(BookingStatus.CANCELLED)
                .totalPrice(BigDecimal.valueOf(100000))
                .note("Khach tu huy")
                .startTime(LocalDateTime.now().minusDays(1))
                .endTime(LocalDateTime.now().minusDays(1).plusHours(4))
                .renter(renter)
                .rentalArea(rentalArea)
                .bookingType(BookingType.HOURLY)
                .build();

        bookingRepository.saveAll(List.of(booking1, booking2, booking3, booking4, booking5));

        log.info("========================================================");
        log.info("[DataInitializer] Da seed {} bookings thanh cong!", 5);
        log.info("  booking_completed_1 id = {}", booking1.getBookingId());
        log.info("  booking_completed_2 id = {}", booking2.getBookingId());
        log.info("  booking_completed_3 id = {}", booking3.getBookingId());
        log.info("  booking_pending     id = {}", booking4.getBookingId());
        log.info("  booking_cancelled   id = {}", booking5.getBookingId());
        log.info("  rentalArea          id = {}", rentalArea.getRentalAreaId());
        log.info("  owner               id = {}", owner.getUserId());
        log.info("  renter              id = {}", renter.getUserId());
        log.info("========================================================");
        log.info("[DataInitializer] Copy cac ID tren de dung trong Postman!");
    }

    // ================================================================
    // SEED REVIEWS - Tạo dữ liệu mẫu để test FE Admin
    // ================================================================
    private void seedReviews() {
        // Nếu đã có review rồi thì bỏ qua
        if (reviewRepository.count() > 0) {
            log.info("[DataInitializer] Reviews đã tồn tại, bỏ qua seedReviews()");
            return;
        }

        User renter = userRepository.findByEmail("renter@gmail.com").orElse(null);
        if (renter == null) return;

        // Lấy ra các booking đã hoàn thành (vì chỉ booking COMPLETED mới được review)
        List<Booking> completedBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.COMPLETED)
                .toList();

        if (completedBookings.size() < 3) return;

        // 1. Review Tốt (APPROVED)
        Review review1 = Review.builder()
                .reviewer(renter)
                .booking(completedBookings.get(0))
                .rentalArea(completedBookings.get(0).getRentalArea())
                .rating(5)
                .comment("Phòng học cực kỳ xịn xò, yên tĩnh, wifi mạnh. Chủ nhà support rất nhiệt tình. Rất đáng tiền!")
                .status(org.rent.room.be.constant.ReviewStatus.APPROVED) // Đã duyệt
                .helpfulCount(12)
                .build();

        // 2. Review Bình Thường (PENDING - Chờ duyệt)
        Review review2 = Review.builder()
                .reviewer(renter)
                .booking(completedBookings.get(1))
                .rentalArea(completedBookings.get(1).getRentalArea())
                .rating(3)
                .comment("Không gian ổn, nhưng máy lạnh hơi yếu một chút. Cần vệ sinh kỹ hơn.")
                .status(ReviewStatus.PENDING_MODERATION) // Chờ duyệt
                .helpfulCount(2)
                .build();

        // 3. Review Tiêu Cực (HIDDEN - Bị ẩn)
        Review review3 = Review.builder()
                .reviewer(renter)
                .booking(completedBookings.get(2))
                .rentalArea(completedBookings.get(2).getRentalArea())
                .rating(1)
                .comment("Nội dung chứa từ ngữ thô tục, vi phạm tiêu chuẩn cộng đồng...")
                .status(org.rent.room.be.constant.ReviewStatus.HIDDEN) // Đã bị ẩn
                .helpfulCount(0)
                .build();

        reviewRepository.saveAll(List.of(review1, review2, review3));
        log.info("[DataInitializer] Đã seed thành công 3 Reviews mẫu để test!");
    }

}
