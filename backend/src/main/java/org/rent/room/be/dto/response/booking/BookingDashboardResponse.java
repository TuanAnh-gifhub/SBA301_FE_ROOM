package org.rent.room.be.dto.response.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookingDashboardResponse {

    private BigDecimal revenueToday;

    private List<BookingRevenueItem> revenueLast7Days;

    private List<BookingRevenueItem> revenueByMonth;

    private List<BookingRevenueItem> revenueByDay;
}