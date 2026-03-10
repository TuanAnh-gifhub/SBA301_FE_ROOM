package org.rent.room.be.dataInitializer;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.rent.room.be.constant.RoomCopyStatus;
import org.rent.room.be.entity.*;
import org.rent.room.be.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
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
    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedCities();
        seedCategories();
        seedAmenities();
        seedRooms();
        seedPackages();
    }


    private void seedRooms(){
        List<City> cities = cityRepository.findAll();
        List<Amenity> amenities = amenityRepository.findAll();
        Set<Amenity> amenitySet = new HashSet<>(amenities);
        List<Category> categories = categoryRepository.findAll();
        RentalArea rentalArea =RentalArea.builder()
                .address("90 Phạm Đăng Giảng, phường Bình Hưng Hòa")
                .contactName("Quang B")
                .contactPhone("0777964742")
                .city(cities.getFirst() != null ? cities.getFirst() : City.builder()
                        .cityName("Thành phố Huế")
                        .build())
                .build();
        rentalAreaRepository.save(rentalArea);
        RoomCopy roomCopy1 = RoomCopy.builder()
                .roomCode("Phỏng 301")
                .roomCopyStatus(RoomCopyStatus.AVAILABLE)
                .build();
        RoomCopy roomCopy2 = RoomCopy.builder()
                .roomCode("Phỏng 302")
                .roomCopyStatus(RoomCopyStatus.AVAILABLE)
                .build();
        RoomCopy roomCopy3 = RoomCopy.builder()
                .roomCode("Phỏng 303")
                .roomCopyStatus(RoomCopyStatus.AVAILABLE)
                .build();

        RoomCopy roomCopy4 = RoomCopy.builder()
                .roomCode("Phỏng 401")
                .roomCopyStatus(RoomCopyStatus.AVAILABLE)
                .build();
        RoomCopy roomCopy5 = RoomCopy.builder()
                .roomCode("Phỏng 402")
                .roomCopyStatus(RoomCopyStatus.AVAILABLE)
                .build();


        roomCopyRepository.save(roomCopy1);
        roomCopyRepository.save(roomCopy2);
        roomCopyRepository.save(roomCopy3);
        roomCopyRepository.save(roomCopy4);
        roomCopyRepository.save(roomCopy5);


        Room room1 = Room.builder()
                .roomName("Phòng học 30 người")
                .description("Phòng học")
                .category(categories.get(0))
                .amenities(amenitySet)
                .rentalArea(rentalArea)
                .capacity(30)
                .price(BigDecimal.valueOf(50000))
                .build();

        roomCopy1.setRoom(room1);
        roomCopy2.setRoom(room1);
        roomCopy3.setRoom(room1);
        roomRepository.save(room1);
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
        roomRepository.save(room1);
        roomRepository.save(room2);

    }


    private void seedUsers() {
        Role adminRole = createRoleIfNotExist("ADMIN", "Quản trị hệ thống");
        Role ownerRole = createRoleIfNotExist("OWNER", "Chủ nhà");
        Role renterRole = createRoleIfNotExist("RENTER", "Người thuê");

        if (userRepository.count() > 0) return;
        User user1 = User.builder()
                .userName("RenterName")
                .gender("Male")
                .email("renter@gmail.com")
                .passwordHash(passwordEncoder.encode("12345678"))
                .phone("0987654321")
                .dateOfBirth(LocalDate.of(2000, 1, 2))
                .role(renterRole)
                .active(true).build();

        User user2 = User.builder()
                .userName("OwnerName")
                .gender("Female")
                .email("owner@gmail.com")
                .passwordHash(passwordEncoder.encode("12345678"))
                .phone("0123456789")
                .dateOfBirth(LocalDate.of(1990, 1, 2))
                .role(ownerRole)
                .active(true).build();

        User user3 = User.builder()
                .userName("AdminName")
                .gender("Other")
                .email("admin@gmail.com")
                .passwordHash(passwordEncoder.encode("12345678"))
                .phone("1234567890")
                .dateOfBirth(LocalDate.of(2008, 1, 2))
                .role(adminRole)
                .active(true).build();

        User user4 = User.builder()
                .userName("Quang")
                .gender("Other")
                .email("quang@gmail.com")
                .passwordHash(passwordEncoder.encode("12345678"))
                .phone("1234567890")
                .dateOfBirth(LocalDate.of(2004, 1, 2))
                .role(adminRole)
                .active(true).build();

        userRepository.saveAll(List.of(user1, user2, user3, user4));
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

        // 1. Gói dùng thử (Trial) - Đánh vào tâm lý muốn thử nhưng sợ tốn tiền
        // Giá ngày rất cao (15k/ngày) so với các gói khác, nhưng tổng tiền bỏ ra nhỏ.
        packages.add(RentPackage.builder()
                .rentPackageName("Trial 1 Day") // Hoặc "Starter"
                .price(new BigDecimal("15000"))
                .durationDays(1)
                .description("Trải nghiệm đầy đủ tính năng trong 24h")
                .build());

        // 2. Gói Tuần (Basic) - Dành cho nhu cầu ngắn hạn
        // ~14k/ngày -> Khách thấy hời hơn hẳn gói 1 ngày
        packages.add(RentPackage.builder()
                .rentPackageName("Weekly Pass")
                .price(new BigDecimal("99000"))
                .durationDays(7)
                .description("Phù hợp cho nhu cầu ngắn hạn")
                .build());

        // 3. Gói Tháng (Standard) - Gói Hero (Gói muốn bán nhất)
        // ~10k/ngày -> Rẻ hơn 30% so với gói tuần. Số tiền 299k là ngưỡng tâm lý dễ chấp nhận.
        packages.add(RentPackage.builder()
                .rentPackageName("Monthly Standard")
                .price(new BigDecimal("299000"))
                .durationDays(30)
                .description("Tiết kiệm 30% - Lựa chọn phổ biến nhất") // Gắn tag Best Seller ở Frontend
                .build());

        // 4. Gói Quý (Quarterly) - Thay vì Premium, gọi là Quarterly nghe rõ nghĩa hơn
        // ~8.8k/ngày -> Giảm thêm chút ít.
        packages.add(RentPackage.builder()
                .rentPackageName("Quarterly Pro")
                .price(new BigDecimal("799000"))
                .durationDays(90)
                .description("Dành cho người dùng thường xuyên")
                .build());

        // 5. Gói Năm (Yearly) - Đổi tên từ Enterprise
        // Đây là gói "khóa chân" khách hàng. Giá nên cực sốc.
        // Mình đề xuất giảm xuống 1.999.000 hoặc 2.499.000 để tạo cảm giác "Deal hời".
        // Nếu để 2.999.000 (gần 3tr), người ta sẽ thà mua gói tháng cho linh hoạt.
        packages.add(RentPackage.builder()
                .rentPackageName("Yearly Saver")
                .price(new BigDecimal("2499000")) // ~6.8k/ngày -> Siêu rẻ
                .durationDays(365)
                .description("Tiết kiệm tối đa - Chỉ 6.8k/ngày")
                .build());

        for (RentPackage rp : packages) {
            if (!rentPackageRepository.existsByRentPackageName(rp.getRentPackageName())) {
                rentPackageRepository.save(rp);
            }
        }
    }

}
