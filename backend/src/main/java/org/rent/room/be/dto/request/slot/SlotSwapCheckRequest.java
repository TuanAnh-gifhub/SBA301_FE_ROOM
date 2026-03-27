package org.rent.room.be.dto.request.slot;


import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class SlotSwapCheckRequest {
    private LocalDateTime newStartTime;
    private LocalDateTime newEndTime;
    private String newRoomCode;
}
