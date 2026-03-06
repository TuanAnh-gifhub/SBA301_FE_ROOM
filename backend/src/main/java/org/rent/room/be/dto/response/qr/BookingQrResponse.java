package org.rent.room.be.dto.response.qr;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import org.rent.room.be.constant.QRType;
import org.rent.room.be.dto.response.booking.BookingResponse;


import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class BookingQrResponse {
    private UUID bookingQrId;
    private String qrToken;
    private QRType qrType;
    private LocalDateTime expireAt;
    private LocalDateTime usedAt;
    private BookingResponse bookingResponse;
}
