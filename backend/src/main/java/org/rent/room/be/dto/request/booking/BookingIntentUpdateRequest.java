package org.rent.room.be.dto.request.booking;

import jakarta.validation.Valid;
import lombok.*;
import org.rent.room.be.constant.BookingType;

import java.util.List;
import java.util.UUID;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BookingIntentUpdateRequest {
    private UUID userId;
    private String userName;
    private String userPhone;
    private List<@Valid SlotRequest> slotRequests;
    private int numberOfMonths;
    private String note;
    private BookingType bookingType;

}
