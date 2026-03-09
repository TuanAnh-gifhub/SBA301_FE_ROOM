package org.rent.room.be.dto.request.wallet;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpsertCommissionConfigRequest {

    @NotNull(message = "COMMISSION_RATE_REQUIRED")
    @DecimalMin(value = "0.0001", message = "COMMISSION_RATE_MIN")
    @DecimalMax(value = "1.0000", message = "COMMISSION_RATE_MAX")
    BigDecimal rate;

    String note;
}
