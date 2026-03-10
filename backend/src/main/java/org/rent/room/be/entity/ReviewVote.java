package org.rent.room.be.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.*;
import org.rent.room.be.base.BaseEntity;

import java.util.UUID;

/**
 * Luu tru luot vote "Huu ich" cua nguoi dung doi voi mot review.
 *
 * Quy tac:
 * - Moi user chi vote 1 lan cho 1 review (UNIQUE constraint).
 * - Bam lan 2 = bo vote (toggle, xu ly o Service layer).
 * - Khi vote/bo vote -> cap nhat Review.helpfulCount (atomic).
 *
 * Ai duoc vote: bat ky user da dang nhap, tru chinh chu review.
 * (Kiem tra o Service layer.)
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(
        name = "review_votes",
        uniqueConstraints = {
                // Dam bao moi user chi vote 1 lan cho 1 review
                @UniqueConstraint(
                        name = "uk_review_vote_user",
                        columnNames = {"review_id", "user_id"}
                )
        },
        indexes = {
                @Index(name = "idx_review_votes_review", columnList = "review_id")
        }
)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewVote extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "vote_id")
    UUID voteId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    Review review;

    /**
     * Nguoi thuc hien vote "Huu ich".
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;
}