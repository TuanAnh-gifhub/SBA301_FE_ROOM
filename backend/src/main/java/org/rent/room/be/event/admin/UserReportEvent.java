package org.rent.room.be.event.admin;

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
public class UserReportEvent implements DomainEvent {
    private final UUID reportId;
    private final UUID reporterId;
    private final UUID reportedUserId;
    private final String reason;
    private final LocalDateTime occurredAt;

    public UserReportEvent(UUID reportId, UUID reporterId, UUID reportedUserId, String reason) {
        this.reportId = reportId;
        this.reporterId = reporterId;
        this.reportedUserId = reportedUserId;
        this.reason = reason;
        this.occurredAt = LocalDateTime.now();
    }
}
