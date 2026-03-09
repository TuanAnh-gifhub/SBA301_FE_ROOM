package org.rent.room.be.schedule;

import lombok.RequiredArgsConstructor;
import org.rent.room.be.service.BookingService;
import org.rent.room.be.serviceImpl.EscrowReleaseService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;



@Component
@RequiredArgsConstructor
public class HoldScheduler {

    private final BookingService bookingService;
    private final EscrowReleaseService escrowReleaseService;

    @Scheduled(fixedRate = 30000)
    public void release() {
        bookingService.releaseExpiredHolds();
    }

    @Scheduled(fixedRate = 60000)
    public void releaseEscrowToOwnerAfter7Days() {
        escrowReleaseService.releaseCompletedBookingsAfterEscrow();
    }
}