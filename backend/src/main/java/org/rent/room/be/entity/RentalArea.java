package org.rent.room.be.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.rent.room.be.base.BaseEntity;
import org.rent.room.be.constant.RentalAreaStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Entity
@Table(name = "rental_areas")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RentalArea extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "rental_area_id")
    UUID rentalAreaId;

    @Column(name = "rental_area_name", length = 150)
    String rentalAreaName;

    @Column(name = "address")
    String address;

    @Column(name = "contact_name", length = 100)
    String contactName;

    @Column(name = "contact_phone", length = 20)
    String contactPhone;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    RentalAreaStatus status;

    @Column(name = "deleted_at")
    LocalDateTime deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id", nullable = false)
    City city;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    User owner;

    @OneToMany(mappedBy = "rentalArea",fetch = FetchType.LAZY)
    List<Room> room;

    // ----------------------------------------------------------------
    // THEM MOI: CACHE CHO REVIEW STATS
    // ----------------------------------------------------------------

    /**
     * Diem danh gia trung binh. NULL = chua co review nao.
     * DECIMAL(3,2): luu duoc gia tri tu 0.00 den 5.00.
     *
     * KHONG tinh truc tiep bang SQL AVG() moi lan hien trang.
     * Gia tri nay duoc cap nhat boi ReviewStatService moi khi:
     * - Co review moi duoc APPROVED
     * - Review bi xoa (soft delete)
     * - Admin thay doi status review (APPROVED <-> REJECTED/HIDDEN)
     */
    @Column(name = "average_rating", precision = 3, scale = 2)
    BigDecimal averageRating;

    /**
     * Tong so review co status = APPROVED.
     * Mac dinh: 0.
     * Cap nhat cung luc voi averageRating.
     */
    @Column(name = "total_reviews", nullable = false)
    @Builder.Default
    Integer totalReviews = 0;
    @OneToMany(mappedBy = "rentalArea",fetch = FetchType.LAZY)
    List<Booking> bookings;

//    @OneToMany(mappedBy = "rentalArea")
//    private List<Post> posts;
}