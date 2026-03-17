package org.rent.room.be.dto.request.booking;


import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.rent.room.be.validation.ValidSlotRequest;

import java.time.LocalDateTime;
import java.util.UUID;


@Getter
@Setter
@AllArgsConstructor
@Builder
@NoArgsConstructor
@ValidSlotRequest
public class SlotRequest {
    private UUID roomId;
    private UUID roomCopyId;
    private int quantity;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
