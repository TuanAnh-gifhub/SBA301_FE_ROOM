package org.rent.room.be.service;

import org.rent.room.be.dto.request.booking.SlotRequest;
import org.rent.room.be.entity.Slot;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface SlotService {
    Slot createSlot(Slot slot);

}
