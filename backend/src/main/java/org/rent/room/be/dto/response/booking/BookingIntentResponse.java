package org.rent.room.be.dto.response.booking;

import lombok.Builder;
import lombok.Getter;
import org.rent.room.be.constant.BookingIntentStatus;
import org.rent.room.be.constant.BookingType;
import org.rent.room.be.dto.response.rental_area.RentalAreaResponse;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


@Builder
@Getter
public class BookingIntentResponse {
    private UUID bookingIntentId;
    private BookingIntentStatus status;
    private BigDecimal previewPrice;
    private LocalDateTime expiresAt;
    private List<IntentSlotResponse> slots;
    private String userName;
    private String userPhone;
    private Integer numberOfMonths;
    private BookingType bookingType;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String title;
    private String note;
    private RentalAreaResponse rentalAreaResponse;
    private BigDecimal tax;
    private BigDecimal discount;
    private BigDecimal totalAmount;
}
