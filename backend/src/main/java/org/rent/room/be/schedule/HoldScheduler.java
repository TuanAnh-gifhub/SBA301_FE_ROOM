package org.rent.room.be.schedule;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.rent.room.be.constant.RoomCopyStatus;
import org.rent.room.be.entity.RoomCopy;
import org.rent.room.be.repository.RoomCopyRepository;
import org.rent.room.be.service.BookingService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;



@Component
@RequiredArgsConstructor
public class HoldScheduler {

    private final BookingService bookingService;

    @Scheduled(fixedRate = 30000)
    public void release() {
        bookingService.releaseExpiredHolds();
    }
}