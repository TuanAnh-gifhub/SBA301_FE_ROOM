package org.rent.room.be.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.*;
import org.rent.room.be.base.BaseEntity;

import java.util.UUID;

/**
 * Phan hoi cua chu phong doi voi 1 review.
 *
 * Quy tac:
 * - Moi review chi co toi da 1 reply (OneToOne, UNIQUE tren review_id).
 * - Chi owner cua RentalArea moi duoc reply (kiem tra o Service layer).
 * - Chu phong co the sua noi dung reply (PATCH /reviews/{id}/reply).
 * - Chu phong khong the xoa reply (khong co DELETE endpoint - quyet dinh san pham).
 *   Admin co the xoa neu can.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Entity
@Table(
        name = "review_replies",
        indexes = {
                @Index(name = "idx_review_replies_review", columnList = "review_id")
        }
)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewReply extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "reply_id")
    UUID replyId;

    /**
     * Review duoc reply.
     * UNIQUE: bao dam moi review chi co dung 1 reply.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false, unique = true)
    Review review;

    /**
     * Chu phong thuc hien reply.
     * Phai la owner cua RentalArea chua booking chua review do.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    User owner;

    /**
     * Noi dung phan hoi. Bat buoc.
     * Min: 1 ky tu, Max: 1000 ky tu (enforce o DTO validation).
     */
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    String content;
}