package org.rent.room.be.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "payos")
public class PayOsProperties {

    /**
     * PAYOS_CLIENT_ID
     */
    private String clientId;

    /**
     * PAYOS_API_KEY
     */
    private String apiKey;

    /**
     * PAYOS_CHECKSUM_KEY
     */
    private String checksumKey;

    /**
     * Base URL PAYOS REST API (sandbox / production).
     */
    private String baseUrl;

    /**
     * URL redirect khi thanh toán thành công.
     */
    private String returnUrl;

    /**
     * URL redirect khi hủy thanh toán.
     */
    private String cancelUrl;
}

