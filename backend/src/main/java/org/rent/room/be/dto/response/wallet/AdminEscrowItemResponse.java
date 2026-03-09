package org.rent.room.be.dto.response.wallet;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminEscrowItemResponse {
    UUID bookingId;
    UUID ownerId;
    String ownerName;
    UUID renterId;
    String renterName;
    BigDecimal grossAmount;
    BigDecimal commissionRate;
    BigDecimal commissionAmount;
    BigDecimal netAmount;
    LocalDateTime bookingEndedAt;
    LocalDateTime expectedReleaseAt;
    Boolean disputeFlag;
    String disputeNote;
}
