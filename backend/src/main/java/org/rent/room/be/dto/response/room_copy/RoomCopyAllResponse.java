package org.rent.room.be.dto.response.room_copy;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class RoomCopyAllResponse {
    private UUID roomId;
    private List<RoomCopyResponse> roomCopyResponses;
}
