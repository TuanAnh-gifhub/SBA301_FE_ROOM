package org.rent.room.be.serviceImpl;



import org.rent.room.be.entity.*;
import org.rent.room.be.repository.RoomCopyRepository;
import org.rent.room.be.repository.RoomRepository;
import org.rent.room.be.repository.SlotRepository;
import org.rent.room.be.repository.UserRepository;
import org.rent.room.be.service.SlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class SlotServiceImpl implements SlotService {
    @Autowired
    private SlotRepository slotRepository;
    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomCopyRepository roomCopyRepository;

    @Override
    @Transactional
    public Slot createSlot(Slot slot) {
      slot = slotRepository.save(slot);
        return slot;
    }


}
