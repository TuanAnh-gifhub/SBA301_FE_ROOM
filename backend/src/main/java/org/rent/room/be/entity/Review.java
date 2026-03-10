package org.rent.room.be.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.*;
import org.rent.room.be.base.BaseEntity;
import org.rent.room.be.constant.ReviewStatus;

import java.time.LocalDateTime;
import java.util.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Entity
@Table(
        name = "reviews",
        indexes = {
                // Tim tat ca review cua 1 rental area, sap xep theo ngay -> dung nhieu nhat
                @Index(name = "idx_reviews_rental_created", columnList = "rental_area_id, created_at DESC"),
                // Kiem tra user da review booking nay chua (check before create)
                @Index(name = "idx_reviews_reviewer", columnList = "reviewer_id"),
                // Admin loc review theo trang thai
                @Index(name = "idx_reviews_status", columnList = "status")
        }
)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Review extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "review_id")
    UUID reviewId;

    // ----------------------------------------------------------------
    // QUAN HE VOI CAC ENTITY KHAC
    // ----------------------------------------------------------------

    /**
     * Nguoi viet review (nguoi thue).
     * ManyToOne: 1 user co the viet nhieu review cho nhieu booking khac nhau.
     *
     * BUG CU: @OneToOne -> chi review duoc 1 lan trong toan he thong. SAI.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    User reviewer;

    /**
     * Booking tuong ung voi review nay.
     * - UNIQUE: bao dam moi booking chi co dung 1 review (enforce o ca DB loi lan JPA).
     * - Chi nguoi da COMPLETED booking moi duoc review (kiem tra o Service layer).
     *
     * BUG CU: Booking.java co @ManyToOne Review -> quan he bi nguoc chieu.
     *         Review phai la ben "so huu" foreign key booking_id, khong phai nguoc lai.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    Booking booking;

    /**
     * RentalArea ma review nay huong den.
     * De-normalize de tranh join qua Booking moi lan truy van danh sach review.
     * Gia tri nay luon bang booking.rentalArea, set khi tao review, khong doi.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rental_area_id", nullable = false)
    RentalArea rentalArea;

    // ----------------------------------------------------------------
    // NOI DUNG REVIEW
    // ----------------------------------------------------------------

    /**
     * So sao: 1 -> 5. Bat buoc.
     */
    @Column(name = "rating", nullable = false)
    Integer rating;

    /**
     * Noi dung chu. Khong bat buoc.
     * - Neu co dien: min 10 ky tu, max 2000 ky tu (kiem tra o Service/DTO validation).
     */
    @Column(name = "comment", columnDefinition = "TEXT")
    String comment;

    // ----------------------------------------------------------------
    // TRANG THAI VA KIEM DUYET
    // ----------------------------------------------------------------

    /**
     * Trang thai hien tai cua review.
     * Mac dinh: APPROVED (neu pass profanity filter khi submit).
     * Xem enum ReviewStatus de hieu tung trang thai.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    ReviewStatus status = ReviewStatus.APPROVED;

    /**
     * Soft delete: NULL = con ton tai, co gia tri = da bi xoa.
     * KHONG dung hard delete vi:
     * (1) Can bao toan lich su du lieu.
     * (2) Tranh loi khi co entity khac reference den review nay.
     * (3) Cho phep khoi phuc neu xoa nham.
     */
    @Column(name = "deleted_at")
    LocalDateTime deletedAt;

    // ----------------------------------------------------------------
    // CACHE FIELD - tranh query tong hop moi lan hien thi
    // ----------------------------------------------------------------

    /**
     * Cache so luot vote "Huu ich".
     * Duoc cap nhat qua ReviewVoteService khi co vote moi / huy vote.
     * Tranh viec phai COUNT(review_votes) moi lan load ReviewCard.
     */
    @Column(name = "helpful_count", nullable = false)
    @Builder.Default
    Integer helpfulCount = 0;

    // ----------------------------------------------------------------
    // QUAN HE 1-NHIEU TOI CAC BANG CON
    // ----------------------------------------------------------------

    /**
     * Anh/video dinh kem. Toi da 5 file (enforce o Service layer).
     */
    @OneToMany(
            mappedBy = "review",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @OrderBy("displayOrder ASC")
    @Builder.Default
    List<ReviewMedia> mediaList = new ArrayList<>();

    /**
     * Quick tags (Yen tinh, Sach se, WiFi tot...).
     * Toi da 5 tags (enforce o Service layer).
     */
    @OneToMany(
            mappedBy = "review",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @Builder.Default
    Set<ReviewTag> tags = new HashSet<>();

    /**
     * Cac luot vote "Huu ich" tu nguoi dung khac.
     */
    @OneToMany(
            mappedBy = "review",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @Builder.Default
    List<ReviewVote> votes = new ArrayList<>();

    /**
     * Phan hoi cua chu phong. Moi review chi co toi da 1 reply.
     * (Enforce bang @OneToOne phia ReviewReply).
     */
    @OneToOne(
            mappedBy = "review",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY
    )
    ReviewReply reply;

    // ----------------------------------------------------------------
    // HELPER METHODS
    // ----------------------------------------------------------------

    public boolean isDeleted() {
        return deletedAt != null;
    }

    public boolean isVisible() {
        return !isDeleted() && status == ReviewStatus.APPROVED;
    }
}