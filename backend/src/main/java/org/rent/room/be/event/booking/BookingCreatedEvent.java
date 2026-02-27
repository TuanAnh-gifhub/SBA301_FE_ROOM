package org.rent.room.be.event.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.rent.room.be.event.DomainEvent;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
public class BookingCreatedEvent implements DomainEvent {
    private final UUID bookingId;
    private final UUID renterId;
    private final UUID ownerId;
    private final String renterName;
    private final String roomName;
    private final BigDecimal amount;
    private final LocalDateTime startTime;
    private final LocalDateTime occurredAt;

    public BookingCreatedEvent(UUID bookingId, UUID renterId, UUID ownerId,
                               String renterName, String roomName, BigDecimal amount,
                               LocalDateTime startTime) {
        this.bookingId = bookingId;
        this.renterId = renterId;
        this.ownerId = ownerId;
        this.renterName = renterName;
        this.roomName = roomName;
        this.amount = amount;
        this.startTime = startTime;
        this.occurredAt = LocalDateTime.now();
    }
}
