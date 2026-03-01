package org.rent.room.be.dto.request.subscription;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionRequest {

    @NotNull(message = "packageId is required")
    private UUID packageId;

    // userId lấy từ token (không cần user truyền lên)
    // FE chỉ cần gửi packageId là đủ
}
