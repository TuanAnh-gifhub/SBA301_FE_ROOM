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
    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedCities();
        seedCategories();
        seedAmenities();
        seedRooms();
    }


    private void seedRooms(){
        List<City> cities = cityRepository.findAll();
        List<Amenity> amenities = amenityRepository.findAll();
        Set<Amenity> amenitySet = new HashSet<>(amenities);
        List<Category> categories = categoryRepository.findAll();
        RentalArea rentalArea =RentalArea.builder()
                .address("90 Phạm Đăng Giảng, phường Bình Hưng Hòa")
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

}
