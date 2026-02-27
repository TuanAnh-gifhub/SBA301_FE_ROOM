package org.rent.room.be.event;

import java.time.LocalDateTime;

/**
 * Base interface cho tất cả domain events
 */
public interface DomainEvent {
    LocalDateTime getOccurredAt();
}