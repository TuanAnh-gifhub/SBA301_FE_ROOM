package org.rent.room.be.dto.response.booking;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class BookingSummaryResponse {
    private BigDecimal totalRevenue;
    private long totalBookings;
    private long completedBookings;
    private long cancelledBookings;

}
