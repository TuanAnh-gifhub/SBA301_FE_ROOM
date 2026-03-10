package org.rent.room.be.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.*;
import org.rent.room.be.constant.MediaType;

import java.util.UUID;

/**
 * Luu tru URL cua anh/video dinh kem trong review.
 * File thuc te duoc upload len S3/Cloudinary, entity nay chi luu URL.
 *
 * Gioi han: toi da 5 file/review (enforce o Service layer).
 * - Anh: JPG, JPEG, PNG, WEBP - toi da 5MB/file
 * - Video: MP4 - toi da 50MB/file
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(
        name = "review_media",
        indexes = {
                @Index(name = "idx_review_media_review", columnList = "review_id")
        }
)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "media_id")
    UUID mediaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    Review review;

    /**
     * URL tren S3/Cloudinary sau khi upload thanh cong.
     * Phai la URL cua he thong (whitelist domain o Service layer).
     */
    @Column(name = "url", nullable = false, length = 500)
    String url;

    /**
     * Loai media: IMAGE hoac VIDEO.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false, length = 10)
    MediaType mediaType;

    /**
     * Thu tu hien thi (0 -> 4).
     * ReviewList se @OrderBy("displayOrder ASC") de dam bao thu tu nhat quan.
     */
    @Column(name = "display_order", nullable = false)
    @Builder.Default
    Integer displayOrder = 0;
}