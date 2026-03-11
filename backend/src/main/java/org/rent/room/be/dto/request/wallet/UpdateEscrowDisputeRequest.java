package org.rent.room.be.dto.request.wallet;

import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateEscrowDisputeRequest {

    @NotNull(message = "DISPUTED_REQUIRED")
    Boolean disputed;

    String note;
}
