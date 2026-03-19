package org.rent.room.be.dto.response.slot;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SlotSwapCheckResponse {
    private boolean available;
    private String conflictMessage;

    private String slotId;
    private String roomCode;
    private LocalDateTime originalStart;
    private LocalDateTime originalEnd;
    private LocalDateTime newStart;
    private LocalDateTime newEnd;
    private long durationMinutes;
}
