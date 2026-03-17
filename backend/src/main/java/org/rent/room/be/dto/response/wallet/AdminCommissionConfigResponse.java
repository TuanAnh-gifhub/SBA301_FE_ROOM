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
public class AdminCommissionConfigResponse {

    UUID commissionConfigId;
    boolean isDefault;
    UUID ownerId;
    String ownerName;
    String ownerEmail;
    BigDecimal rate;
    String note;
    UUID createdBy;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
