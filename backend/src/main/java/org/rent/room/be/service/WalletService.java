package org.rent.room.be.service;

import org.rent.room.be.dto.response.wallet.WalletInfoResponse;
import org.rent.room.be.entity.User;
import org.rent.room.be.entity.Wallet;

import java.math.BigDecimal;

public interface WalletService {

    /**
     * Lấy ví của user, nếu chưa có thì tự động tạo với balance = 0, frozenAmount = 0, status = ACTIVE.
     */
    Wallet getOrCreateWallet(User user);

    /**
     * Lấy ví của user hiện tại (từ SecurityContext) và auto-create nếu chưa tồn tại.
     */
    Wallet getOrCreateCurrentUserWallet();

    /**
     * Thông tin ví của user hiện tại cho API /wallet/me.
     */
    WalletInfoResponse getMyWalletInfo();

    /**
     * Lấy số dư khả dụng của ví user hiện tại.
     */
    BigDecimal getCurrentBalance();
}

