package org.rent.room.be.dto.response.booking;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;
@Getter
@Builder
public class BookingShortResponse {
    private UUID bookingId;
    private String userName;
    private String userPhone;
    private String note;
}
