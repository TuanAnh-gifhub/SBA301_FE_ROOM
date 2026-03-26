package org.rent.room.be.dto.response.dashboard;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerRevenueStatsResponse {
    private List<RevenueData> last7Days;
    private List<RevenueData> monthlyInYear;
}
