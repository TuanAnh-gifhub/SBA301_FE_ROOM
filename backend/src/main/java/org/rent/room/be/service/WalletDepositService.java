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
     * Việc cộng tiền chỉ thực hiện qua webhook đã verify.
     */
    void handleDepositResult(String orderCode, String status);
}

