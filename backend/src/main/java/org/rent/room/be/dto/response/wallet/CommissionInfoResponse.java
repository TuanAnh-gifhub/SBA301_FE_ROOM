package org.rent.room.be.dto.response.wallet;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommissionInfoResponse {

    BigDecimal rate;
    boolean isCustom;
    LocalDateTime effectiveFrom;
}

