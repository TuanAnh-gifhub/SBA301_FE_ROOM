package org.rent.room.be.dto.response.dashboard;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminChartResponse {
    List<ChartDataDTO> revenueDaily;
    List<ChartDataDTO> revenueMonthly;
    List<ChartDataDTO> bookingDaily;
    List<ChartDataDTO> bookingMonthly;
    List<ChartDataDTO> usersDaily;
    List<ChartDataDTO> usersMonthly;
    List<StatusDataDTO> revenueByStatus;
    List<StatusDataDTO> bookingByStatus;
    List<StatusDataDTO> roomByStatus;
    BigDecimal currentMonthRevenue;
    BigDecimal currentMonthGMV;
    Double revenueGrowth;
    Long pendingPosts;

    @Data
    @AllArgsConstructor
    public static class ChartDataDTO {
        private String label;
        private Number amount;
    }

    @Data
    @AllArgsConstructor
    public static class StatusDataDTO {
        private String label;
        private Number value;
        private String color;
    }
}