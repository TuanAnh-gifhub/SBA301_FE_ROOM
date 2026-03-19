package org.rent.room.be.dto.response.slot;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class SlotExtendCheckResponse {
    private boolean available;
    private String conflictMessage;


    private String slotId;
    private String roomCode;
    private LocalDateTime originalEnd;
    private LocalDateTime newEnd;
    private int addedMinutes;


    private BigDecimal originalPrice;   // giá slot gốc
    private BigDecimal extraPrice;      // tiền thêm
    private BigDecimal hourlyRate;      // giá/giờ tính ra từ slot
}