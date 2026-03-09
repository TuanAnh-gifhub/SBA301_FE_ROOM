package org.rent.room.be.dto.response.wallet;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EscrowSummaryResponse {
    BigDecimal totalHoldingAmount;
    BigDecimal totalCommissionAmount;
    BigDecimal totalNetAmount;
    List<EscrowItemResponse> items;
}
