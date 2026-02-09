package org.rent.room.be.serviceImpl;

import org.rent.room.be.constant.Room_Copy_Status;
import org.rent.room.be.dto.request.room_copy.RoomCopyAllRequest;
import org.rent.room.be.dto.request.room_copy.RoomCopyRequest;
import org.rent.room.be.dto.response.room_copy.RoomCopyResponse;
import org.rent.room.be.entity.Room;
import org.rent.room.be.entity.RoomCopy;
import org.rent.room.be.repository.RoomCopyRepository;
import org.rent.room.be.repository.RoomRepository;
import org.rent.room.be.service.RoomCopyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;


@Service
public class RoomCopyServiceImpl implements RoomCopyService {
    @Autowired
    private RoomCopyRepository roomCopyRepository;
    @Autowired
    private RoomRepository roomRepository;

    @Override
    public void createRoomCopy(RoomCopyAllRequest request) {
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room Not Found"));
        for (RoomCopyRequest roomRequest : request.getRoomRequests()) {
            RoomCopy roomCopy = RoomCopy.builder()
                    .roomCode(roomRequest.getRoomCode())
                    .roomCopyStatus(Room_Copy_Status.AVAILABLE)
                    .build();
            room.getRoomCopies().add(roomCopy);
            roomCopy.setRoom(room);
            roomCopyRepository.save(roomCopy);
        }
        roomRepository.save(room);
    }

    @Override
    public RoomCopyResponse getRoomCopyById(UUID roomCopyId) {
       RoomCopy roomCopy =   roomCopyRepository.findById(roomCopyId).orElseThrow(() -> new RuntimeException("Room Not Found"));

        return RoomCopyResponse.builder()
                .roomCopyId(roomCopy.getRoomCopyId())
                .roomCode(roomCopy.getRoomCode())
                .room_Copy_Status(roomCopy.getRoomCopyStatus())
                .build();
    }

}
