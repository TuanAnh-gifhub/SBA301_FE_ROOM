package org.rent.room.be.dto.response.subscription;


import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionResponse {
    private UUID subscriptionId;
    private UUID userId;
    private String userName;
    private UUID packageId;
    private String packageName;
    private double price;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private boolean active;
    private LocalDateTime createdAt;
}
