package org.rent.room.be.service;

import org.rent.room.be.entity.Schedule;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public interface ScheduleService {

    void createSchedule(LocalDate date);
    boolean checkScheduleForBooking(LocalDate date, LocalTime start, LocalTime end, UUID bookingID, UUID roomId);


}
