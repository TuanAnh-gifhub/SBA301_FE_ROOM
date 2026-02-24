package org.rent.room.be.dto.response.room_copy;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.rent.room.be.constant.RoomCopyStatus;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class RoomCopyResponse {
  private UUID roomCopyId;
  private String roomCode;
  private RoomCopyStatus roomCopyStatus;
}
