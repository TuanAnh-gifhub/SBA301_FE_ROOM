package org.rent.room.be.dataInitializer;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.rent.room.be.entity.*;
import org.jspecify.annotations.NonNull;
import org.rent.room.be.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

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
    RentPackageRepository rentPackageRepository;


    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedCities();
        seedCategories();
        seedAmenities();
        seedPackages();
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
                "TP. Hồ Chí Minh",
                "Hà Nội",
                "Đà Nẵng",
                "Cần Thơ"
        );

        for (String name : cities) {
            if (!cityRepository.existsByCityName(name)) {
                cityRepository.save(City.builder()
                        .cityName(name)
                        .build());
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
        List<String> amenities = List.of(
                "Wifi",
                "Ổ điện",
                "Máy lạnh",
                "Máy chiếu",
                "Bảng trắng",
                "Micro",
                "Loa",
                "Nước uống"
        );

        for (String name : amenities) {
            if (!amenityRepository.existsByAmenityName(name)) {
                amenityRepository.save(Amenity.builder()
                        .amenityName(name)
                        .build());
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

        // Logic lưu vào DB
        for (RentPackage rp : packages) {
            if (!rentPackageRepository.existsByRentPackageName(rp.getRentPackageName())) {
                rentPackageRepository.save(rp);
            }
        }
    }

}
