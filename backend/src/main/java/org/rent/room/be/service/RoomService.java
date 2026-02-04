package org.rent.room.be.service;

import org.rent.room.be.dto.request.room.CreateRoomRequest;
import org.rent.room.be.dto.response.room.RoomResponse;
import org.rent.room.be.entity.Room;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface RoomService {
    RoomResponse createRoom(UUID rentalAreaId, CreateRoomRequest req, List<MultipartFile> images, UUID currentUserId);
    Room findById(UUID uuid);
}
