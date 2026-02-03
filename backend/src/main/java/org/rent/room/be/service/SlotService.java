package org.rent.room.be.service;

import org.rent.room.be.entity.Slot;

import java.time.LocalDate;

public interface SlotService {
    void createSlot(Slot slot);
    boolean checkScheduleForBooking(LocalDate date);
}
