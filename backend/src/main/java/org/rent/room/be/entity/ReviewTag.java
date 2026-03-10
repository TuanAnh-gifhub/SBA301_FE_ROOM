package org.rent.room.be.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.*;

import java.util.UUID;

/**
 * Luu tru cac quick tag ma nguoi dung chon khi viet review.
 * Vi du: "Yen tinh", "Sach se", "WiFi tot", "Dieu hoa mat"...
 *
 * Thiet ke: luu tag_name truc tiep thay vi FK den bang tags rieng,
 * don gian hon va du nhanh cho use case nay.
 * Neu sau nay can quan ly tag tu Admin panel -> se tach bang sau.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(
        name = "review_tags",
        uniqueConstraints = {
                // 1 review khong the co 2 tag giong nhau
                @UniqueConstraint(
                        name = "uk_review_tag",
                        columnNames = {"review_id", "tag_name"}
                )
        }
)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewTag {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "tag_id")
    UUID tagId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    Review review;

    /**
     * Ten tag. Phai nam trong danh sach hop le duoc dinh nghia
     * trong ReviewTagConstant (kiem tra o Service layer, khong dung Enum
     * de linh hoat them/bo tag sau nay ma khong can migration).
     *
     * Cac gia tri hien tai:
     * YEN_TINH, SACH_SE, WIFI_TOT, DIEU_HOA_MAT,
     * ANH_SANG_DU, VI_TRI_THUAN_TIEN, CHU_PHONG_THAN_THIEN
     */
    @Column(name = "tag_name", nullable = false, length = 50)
    String tagName;
}