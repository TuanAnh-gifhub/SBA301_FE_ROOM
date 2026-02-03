package org.rent.room.be.serviceImpl;


import org.rent.room.be.entity.Slot;
import org.rent.room.be.service.SlotService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class SlotServiceImpl implements SlotService {


    @Override
    public void createSlot(Slot slot) {


    }

    @Override
    public boolean checkScheduleForBooking(LocalDate date) {
        return false;
    }
}
