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
public class InsufficientBalanceEvent implements DomainEvent {
    private final UUID userId;
    private final BigDecimal requiredAmount;
    private final BigDecimal currentBalance;
    private final LocalDateTime occurredAt;

    public InsufficientBalanceEvent(UUID userId, BigDecimal requiredAmount, BigDecimal currentBalance) {
        this.userId = userId;
        this.requiredAmount = requiredAmount;
        this.currentBalance = currentBalance;
        this.occurredAt = LocalDateTime.now();
    }
}

