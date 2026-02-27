package org.rent.room.be.event.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.rent.room.be.event.DomainEvent;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
public class BookingConfirmedEvent implements DomainEvent {
    private final UUID bookingId;
    private final UUID renterId;
    private final UUID ownerId;
    private final String roomName;
    private final LocalDateTime startTime;
    private final LocalDateTime occurredAt;

    public BookingConfirmedEvent(UUID bookingId, UUID renterId, UUID ownerId,
                                 String roomName, LocalDateTime startTime) {
        this.bookingId = bookingId;
        this.renterId = renterId;
        this.ownerId = ownerId;
        this.roomName = roomName;
        this.startTime = startTime;
        this.occurredAt = LocalDateTime.now();
    }
}
