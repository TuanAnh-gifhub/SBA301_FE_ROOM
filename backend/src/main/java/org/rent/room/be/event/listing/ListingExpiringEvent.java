package org.rent.room.be.event.listing;

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
public class ListingExpiringEvent implements DomainEvent {
    private final UUID listingId;
    private final UUID ownerId;
    private final String roomName;
    private final LocalDateTime expiresAt;
    private final Integer daysRemaining;
    private final LocalDateTime occurredAt;

    public ListingExpiringEvent(UUID listingId, UUID ownerId, String roomName,
                                LocalDateTime expiresAt, Integer daysRemaining) {
        this.listingId = listingId;
        this.ownerId = ownerId;
        this.roomName = roomName;
        this.expiresAt = expiresAt;
        this.daysRemaining = daysRemaining;
        this.occurredAt = LocalDateTime.now();
    }
}
