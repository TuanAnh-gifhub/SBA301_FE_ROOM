package org.rent.room.be.dto.response.review;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewSummaryResponse {

    /** Diem trung binh. NULL neu chua co review nao. */
    BigDecimal averageRating;

    /** Tong so review duoc duyet (APPROVED). */
    Integer totalReviews;

    /**
     * Phan bo so luong review theo tung muc sao (1->5).
     * Luon co du 5 phan tu, count = 0 neu khong co review o muc do.
     */
    List<StarDistribution> distribution;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StarDistribution {
        /** Muc sao (1, 2, 3, 4, hoac 5) */
        int star;

        /** So luong review o muc sao nay */
        long count;

        /**
         * Phan tram so voi tong (0.0 -> 100.0).
         * 0.0 neu totalReviews = 0.
         */
        double percentage;
    }
}