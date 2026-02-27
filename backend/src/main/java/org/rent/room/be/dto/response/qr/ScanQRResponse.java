package org.rent.room.be.dto.response.qr;


import lombok.Builder;
import lombok.Getter;
import org.rent.room.be.constant.BookingStatus;

import java.time.LocalDateTime;

@Getter
@Builder
public class ScanQRResponse {
    private boolean success;
    private String message;
    private BookingStatus status;
    private LocalDateTime usedAt;
}