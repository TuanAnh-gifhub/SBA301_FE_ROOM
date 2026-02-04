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
public class BookingRejectedEvent implements DomainEvent {
    private final UUID bookingId;
    private final UUID renterId;
    private final UUID ownerId;
    private final String roomName;
    private final String reason;
    private final LocalDateTime occurredAt;

    public BookingRejectedEvent(UUID bookingId, UUID renterId, UUID ownerId,
                                String roomName, String reason) {
        this.bookingId = bookingId;
        this.renterId = renterId;
        this.ownerId = ownerId;
        this.roomName = roomName;
        this.reason = reason;
        this.occurredAt = LocalDateTime.now();
    }
}
