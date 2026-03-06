package org.rent.room.be.dto.request.booking;


import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;


@Getter
@Setter
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class SlotRequest {
//    @NotNull(message = "Room id không được bỏ trống")
    private UUID roomId;
    private int quantity;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
