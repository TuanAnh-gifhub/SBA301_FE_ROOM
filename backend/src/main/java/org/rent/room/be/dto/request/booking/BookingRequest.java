package org.rent.room.be.dto.request.booking;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.rent.room.be.constant.BookingType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BookingRequest {
    @NotNull(message = "User id không được bỏ trống")
    private UUID userId;
    private String userName;
    private String userPhone;
    private List<@Valid SlotRequest> slotRequests;
    private int numberOfMonths;
    private String note;
    private BookingType bookingType;

}

