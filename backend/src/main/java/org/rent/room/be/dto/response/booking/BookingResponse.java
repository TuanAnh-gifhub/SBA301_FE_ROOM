package org.rent.room.be.dto.response.booking;

import lombok.*;
import org.rent.room.be.constant.BookingStatus;
import org.rent.room.be.constant.PaymentStatus;
import org.rent.room.be.dto.response.UserResponse;

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
    private UUID roomId;
    private UserResponse user;
    private BookingStatus bookingStatus;
    private List<SlotResponse> slots;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private PaymentStatus statusPayment;
}
