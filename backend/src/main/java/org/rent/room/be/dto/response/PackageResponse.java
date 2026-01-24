package org.rent.room.be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PackageResponse {
    private UUID packageId;
    private String packageName;
    private double price;
    private int durationDays;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
