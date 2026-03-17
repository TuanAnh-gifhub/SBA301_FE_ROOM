package org.rent.room.be.dto.response.wallet;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.rent.room.be.constant.WalletStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminWalletItemResponse {
    private UUID walletId;
    private UUID userId;
    private String userName;
    private String userEmail;
    private BigDecimal balance;
    private BigDecimal frozenAmount;
    private WalletStatus walletStatus;
    private String frozenReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
