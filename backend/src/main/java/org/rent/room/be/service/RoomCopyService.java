package org.rent.room.be.service;

import org.rent.room.be.dto.request.room_copy.RoomCopyAllRequest;
import org.rent.room.be.dto.response.room_copy.RoomCopyResponse;

import java.util.UUID;


public interface RoomCopyService {
  void createRoomCopy(RoomCopyAllRequest request);
  RoomCopyResponse getRoomCopyById(UUID roomCopyId);
}
