package org.rent.room.be.dto.response.booking;

import lombok.*;
import org.rent.room.be.constant.BookingStatus;
import org.rent.room.be.dto.response.rental_area.RentalAreaResponse;
import org.rent.room.be.dto.response.slot.SlotResponse;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BookingResponse {
    private UUID bookingId;
    private String userName;
    private List<SlotResponse> slots;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int numberOfMonths;
    private BigDecimal totalPrice;
    private String note;
    private BookingStatus status;
    private LocalDateTime createdAt;
    private String statusPayment;

}
