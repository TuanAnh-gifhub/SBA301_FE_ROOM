package org.rent.room.be.dto.response.dashboard;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueData {
    private String label;
    private BigDecimal amount;
}
