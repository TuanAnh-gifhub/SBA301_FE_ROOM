package org.rent.room.be.dto.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerReviewStatsResponse {
    /** Số review mới trong kỳ (7d / 30d / 3m / ytd). */
    private long newReviewsInPeriod;

    /** Avg rating trong kỳ. Null = không có review nào trong kỳ → FE hiện "N/A". */
    private Double avgRatingInPeriod;

    /** Avg rating all-time. Null = chưa có review nào ever. */
    private Double overallAvgRating;

    /** Số review chưa được owner reply → hiện badge "Cần phản hồi". */
    private long pendingReplyCount;
}