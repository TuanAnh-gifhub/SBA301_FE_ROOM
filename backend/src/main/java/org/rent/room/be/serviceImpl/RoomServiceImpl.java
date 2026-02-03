package org.rent.room.be.serviceImpl;

import org.rent.room.be.dto.request.room.RoomRequest;
import org.rent.room.be.entity.Room;
import org.rent.room.be.repository.RoomRepository;
import org.rent.room.be.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class RoomServiceImpl implements RoomService {
    @Autowired
    private RoomRepository roomRepo;

    @Override
    public void create(RoomRequest request) {
        Room room = Room.builder()
                .roomName(request.getRoomName())
                .price(request.getPrice())
                .roomStatus(request.getRoomStatus())
                .description(request.getDescription())
                .build();

    }

    @Override
    public Room findById(UUID id) {
        return roomRepo.findById(id).orElse(null);
    }
}
