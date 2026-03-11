package org.rent.room.be.dto.request.booking;

import jakarta.validation.Valid;
import lombok.*;
import org.rent.room.be.constant.BookingStatus;
import org.rent.room.be.constant.BookingType;

import java.util.List;
import java.util.UUID;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UpdateBookingRequest {
    private UUID userId;
    private BookingStatus bookingStatus;
    private BookingType bookingType;
    private String note;
}
