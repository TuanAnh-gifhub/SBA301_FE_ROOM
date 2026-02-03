package org.rent.room.be.serviceImpl;

import org.rent.room.be.constant.ScheduleStatus;
import org.rent.room.be.entity.Room;
import org.rent.room.be.entity.Schedule;
import org.rent.room.be.entity.Slot;
import org.rent.room.be.repository.ScheduleRepository;
import org.rent.room.be.service.RoomService;
import org.rent.room.be.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
public class ScheduleServiceImpl implements ScheduleService {

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private RoomService roomService;

    @Override
    public void createSchedule(LocalDate date) {
        Schedule schedule = Schedule.builder()
                .specificDate(date)
                .availabilityStatus(ScheduleStatus.AVAILABLE)
                .build();
    }

    @Override
    public boolean checkScheduleForBooking(LocalDate date,
                                           LocalTime start, LocalTime end,
                                           UUID bookingID, UUID roomId) {

        Room room = roomService.findById(roomId);
        List<Slot> slots = room.getSlots();
        boolean result = false;
        for (Slot sl : slots) {
            if (sl.getStartTime().isBefore(end)
                    && sl.getEndTime().isAfter(start)
                    && sl.getSchedule().getSpecificDate().equals(date)) {
                result = true;
            }
        }
        // tìm lịch trùng
        // phải kiếm dc  phòng 888 giờ A ngày B
        //  lấy ngày book hiện tại so sanh vs  phòng 888 gio A ngay B đo
        //1 booking có nhìu lịch

        return result;
    }
}
