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
public class WalletToppedUpEvent implements DomainEvent {
    private final UUID userId;
    private final BigDecimal amount;
    private final BigDecimal newBalance;
    private final String transactionId;
    private final LocalDateTime occurredAt;

    public WalletToppedUpEvent(UUID userId, BigDecimal amount, BigDecimal newBalance, String transactionId) {
        this.userId = userId;
        this.amount = amount;
        this.newBalance = newBalance;
        this.transactionId = transactionId;
        this.occurredAt = LocalDateTime.now();
    }
}
