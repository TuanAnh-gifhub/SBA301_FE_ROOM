package org.rent.room.be.service;

import org.rent.room.be.dto.request.room.RoomRequest;
import org.rent.room.be.entity.Room;

import java.util.UUID;

public interface RoomService {

    void create(RoomRequest request);

    Room findById(UUID id);
}
