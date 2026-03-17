package org.rent.room.be.dto.response.wallet;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.rent.room.be.constant.WalletTxStatus;
import org.rent.room.be.constant.WalletTxType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminWalletTransactionItemResponse {
    private UUID transactionId;
    private UUID walletId;
    private UUID userId;
    private String userName;
    private String userEmail;
    private WalletTxType type;
    private WalletTxStatus status;
    private BigDecimal amount;
    private BigDecimal balanceBefore;
    private BigDecimal balanceAfter;
    private String description;
    private String payosOrderCode;
    private UUID withdrawRequestId;
    private LocalDateTime createdAt;
}
