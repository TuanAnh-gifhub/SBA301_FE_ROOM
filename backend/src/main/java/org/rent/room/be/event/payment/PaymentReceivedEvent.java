package org.rent.room.be.event.payment;

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
public class PaymentReceivedEvent implements DomainEvent {
    private final UUID ownerId;
    private final UUID bookingId;
    private final BigDecimal amount;
    private final LocalDateTime occurredAt;

    public PaymentReceivedEvent(UUID ownerId, UUID bookingId, BigDecimal amount) {
        this.ownerId = ownerId;
        this.bookingId = bookingId;
        this.amount = amount;
        this.occurredAt = LocalDateTime.now();
    }
}
