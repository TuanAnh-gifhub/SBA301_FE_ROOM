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
public class BookingCancelledEvent implements DomainEvent {
    private final UUID bookingId;
    private final UUID renterId;
    private final UUID ownerId;
    private final UUID cancelledByOwnerId; // null nếu renter hủy
    private final String roomName;
    private final String reason;
    private final LocalDateTime occurredAt;

    public BookingCancelledEvent(UUID bookingId, UUID renterId, UUID ownerId,
                                 UUID cancelledByOwnerId, String roomName, String reason) {
        this.bookingId = bookingId;
        this.renterId = renterId;
        this.ownerId = ownerId;
        this.cancelledByOwnerId = cancelledByOwnerId;
        this.roomName = roomName;
        this.reason = reason;
        this.occurredAt = LocalDateTime.now();
    }
}
