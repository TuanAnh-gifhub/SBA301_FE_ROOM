package org.rent.room.be.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.rent.room.be.base.BaseEntity;
import org.rent.room.be.constant.WalletStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@SuperBuilder
@Entity
@Table(name = "wallets")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Wallet extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "wallet_id")
    UUID walletId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    User user;

    /**
     * Số dư khả dụng. Không bao giờ được âm.
     */
    @Column(name = "balance", precision = 19, scale = 2, nullable = false)
    BigDecimal balance = BigDecimal.ZERO;

    /**
     * Số tiền đang bị tạm giữ (chờ rút, chờ xử lý). Không thể dùng để giao dịch.
     */
    @Column(name = "frozen_amount", precision = 19, scale = 2, nullable = false)
    BigDecimal frozenAmount = BigDecimal.ZERO;

    /**
     * Khi LOCKED: block mọi giao dịch (tương đương isFrozen = true).
     */
    @Column(name = "wallet_status", length = 20, nullable = false)
    WalletStatus walletStatus;

    /**
     * Lý do bị khóa/freeze, do ADMIN nhập.
     */
    @Column(name = "frozen_reason", length = 255)
    String frozenReason;

    @OneToMany(mappedBy = "wallet", fetch = FetchType.LAZY)
    List<Payment> payments;

    @OneToMany(mappedBy = "wallet", fetch = FetchType.LAZY)
    List<Order> orders;

    @OneToMany(mappedBy = "wallet", fetch = FetchType.LAZY)
    List<WalletTransaction> transactions;

    @OneToMany(mappedBy = "wallet", fetch = FetchType.LAZY)
    List<WithdrawRequest> withdrawRequests;
}
