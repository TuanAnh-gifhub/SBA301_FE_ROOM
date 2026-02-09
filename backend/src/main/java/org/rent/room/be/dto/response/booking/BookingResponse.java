package org.rent.room.be.dto.response.booking;

import lombok.*;
import org.rent.room.be.constant.BookingStatus;
import org.rent.room.be.constant.PaymentStatus;
import org.rent.room.be.dto.request.booking.SlotRequest;
import org.rent.room.be.dto.response.UserResponse;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BookingResponse {
    private UUID bookingId;
    private UUID userId;
    private UUID roomId;
    private boolean isLongTerm;
    private List<SlotRequest> slotRequests;
    private int numberOfMonths;
    private BigDecimal price;
    private String note;
    private String status;
    private LocalDateTime createdAt;
}
