package org.rent.room.be.service;

import org.rent.room.be.dto.request.wallet.CreateDepositLinkRequest;
import org.rent.room.be.dto.response.wallet.DepositLinkResponse;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface WalletDepositService {

    DepositLinkResponse createDepositLink(CreateDepositLinkRequest request);

    /**
     * Xử lý webhook từ PAYOS. Luôn trả ResponseEntity với body theo đặc tả PAYOS,
     * nhưng không throw lỗi (để tránh retry loop).
     */
    ResponseEntity<Map<String, Object>> handlePayOsWebhook(Map<String, Object> payload);

    /**
     * Xử lý khi user redirect về từ payment page (mock hoặc thật).
     * Nếu là mock payment và status=success, tự động complete transaction và cộng tiền.
     */
    void handleDepositResult(String orderCode, String status);
}

