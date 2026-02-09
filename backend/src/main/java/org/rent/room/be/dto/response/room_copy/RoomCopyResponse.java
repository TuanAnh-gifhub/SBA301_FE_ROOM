package org.rent.room.be.dto.response.room_copy;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.rent.room.be.constant.Room_Copy_Status;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class RoomCopyResponse {
  private UUID roomCopyId;
  private String roomCode;
  private Room_Copy_Status room_Copy_Status;
}
