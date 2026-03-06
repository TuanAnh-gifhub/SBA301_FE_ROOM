package org.rent.room.be.dto.request.room_copy;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.rent.room.be.dto.request.room.RoomRequest;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomCopyAllRequest {
    @NotNull(message = "room id không để trống")
    private UUID roomId;
    private  List<RoomCopyRequest> roomRequests;
}
