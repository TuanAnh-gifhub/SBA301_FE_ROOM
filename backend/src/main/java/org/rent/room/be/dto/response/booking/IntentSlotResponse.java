package org.rent.room.be.dto.response.booking;

import lombok.Builder;
import lombok.Getter;
import org.rent.room.be.dto.response.room.RoomResponse;
import org.rent.room.be.dto.response.room_copy.RoomCopyResponse;
import org.rent.room.be.entity.Room;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
@Getter
public class IntentSlotResponse {
    private UUID intentSlotId;
    private RoomResponse room;
    private Integer quantity;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String address;
}
