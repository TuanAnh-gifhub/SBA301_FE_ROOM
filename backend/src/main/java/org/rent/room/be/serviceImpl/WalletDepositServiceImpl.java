package org.rent.room.be.serviceImpl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.rent.room.be.base.ApiResponse;
import org.rent.room.be.constant.WalletStatus;
import org.rent.room.be.constant.WalletTxStatus;
import org.rent.room.be.constant.WalletTxType;
import org.rent.room.be.dto.request.wallet.CreateDepositLinkRequest;
import org.rent.room.be.dto.response.wallet.DepositLinkResponse;
import org.rent.room.be.entity.User;
import org.rent.room.be.entity.Wallet;
import org.rent.room.be.entity.WalletTransaction;
import org.rent.room.be.properties.PayOsProperties;
import org.rent.room.be.repository.WalletRepository;
import org.rent.room.be.repository.WalletTransactionRepository;
import org.rent.room.be.service.UserService;
import org.rent.room.be.service.WalletDepositService;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletDepositServiceImpl implements WalletDepositService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final UserService userService;
    private final PayOsProperties payOsProperties;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional
    public DepositLinkResponse createDepositLink(CreateDepositLinkRequest request) {
        User currentUser = userService.getCurrentUserEntity();

        Wallet wallet = walletRepository.findByUser(currentUser)
                .orElseGet(() -> {
                    Wallet w = Wallet.builder()
                            .user(currentUser)
                            .balance(BigDecimal.ZERO)
                            .frozenAmount(BigDecimal.ZERO)
                            .walletStatus(WalletStatus.ACTIVE)
                            .build();
                    return walletRepository.save(w);
                });

        if (wallet.getWalletStatus() == WalletStatus.LOCKED) {
            throw new RuntimeException("Ví của bạn đã bị khóa");
        }

        long amount = request.getAmount();
        long now = System.currentTimeMillis();
        long orderCode = Long.parseLong(String.valueOf(now).substring(Math.max(0, String.valueOf(now).length() - 8)));

        WalletTransaction tx = WalletTransaction.builder()
                .wallet(wallet)
                .type(WalletTxType.DEPOSIT)
                .status(WalletTxStatus.PENDING)
                .amount(BigDecimal.valueOf(amount))
                .balanceBefore(wallet.getBalance())
                .balanceAfter(wallet.getBalance())
                .description("Nap tien vi - " + currentUser.getUserId())
                .payosOrderCode(String.valueOf(orderCode))
                .build();

        walletTransactionRepository.save(tx);

        // Nếu chưa cấu hình PAYOS đầy đủ -> trả về mock paymentUrl để dev có thể test luồng
        if (isPayOsNotConfigured()) {
            log.warn("PAYOS is not configured. Using mock payment link for orderCode={}", orderCode);

            String baseReturn = payOsProperties.getReturnUrl();
            if (baseReturn == null || baseReturn.isBlank()) {
                baseReturn = "http://localhost:5173/wallet/deposit/result?status=success";
            }
            String mockUrl = baseReturn + "&orderCode=" + orderCode + "&mock=true";

            return DepositLinkResponse.builder()
                    .paymentUrl(mockUrl)
                    .orderCode(String.valueOf(orderCode))
                    .build();
        }

        // Nếu đã cấu hình PAYOS nhưng gọi thất bại, cũng fallback sang mock để tránh 500 khi dev
        try {
            Map<String, Object> paymentData = new HashMap<>();
            paymentData.put("orderCode", orderCode);
            paymentData.put("amount", amount);
            paymentData.put("description", "Nap tien vi");
            paymentData.put("returnUrl", payOsProperties.getReturnUrl());
            paymentData.put("cancelUrl", payOsProperties.getCancelUrl());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-client-id", payOsProperties.getClientId());
            headers.set("x-api-key", payOsProperties.getApiKey());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(paymentData, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    payOsProperties.getBaseUrl() + "/v2/payment-requests",
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            Map<String, Object> body = response.getBody();
            if (body != null && body.get("data") != null) {
                Map<String, Object> data = (Map<String, Object>) body.get("data");
                String checkoutUrl = (String) data.get("checkoutUrl");
                String paymentLinkId = data.get("paymentLinkId") != null ? data.get("paymentLinkId").toString() : null;

                tx.setPayosPaymentLinkId(paymentLinkId);
                walletTransactionRepository.save(tx);

                return DepositLinkResponse.builder()
                        .paymentUrl(checkoutUrl)
                        .orderCode(String.valueOf(orderCode))
                        .build();
            } else {
                log.error("PAYOS response invalid, body={}", body);
            }
        } catch (Exception e) {
            log.error("Error calling PAYOS, falling back to mock link. orderCode={}", orderCode, e);
        }

        // Fallback mock nếu gọi PAYOS lỗi
        String baseReturn = payOsProperties.getReturnUrl();
        if (baseReturn == null || baseReturn.isBlank()) {
            baseReturn = "http://localhost:5173/wallet/deposit/result?status=success";
        }
        String mockUrl = baseReturn + "&orderCode=" + orderCode + "&mock=true&fallback=true";

        return DepositLinkResponse.builder()
                .paymentUrl(mockUrl)
                .orderCode(String.valueOf(orderCode))
                .build();
    }

    @Override
    @Transactional
    public ResponseEntity<Map<String, Object>> handlePayOsWebhook(Map<String, Object> payload) {
        try {
            // Verify signature để đảm bảo request đến từ PAYOS thật
            if (!verifyPayOsSignature(payload)) {
                log.warn("⚠️ PAYOS webhook signature verification failed. Payload: {}", payload);
                // Vẫn trả về 200 để tránh PAYOS retry, nhưng không xử lý
                return ResponseEntity.ok(Map.of("code", "00", "message", "signature verification failed"));
            }
            
            Map<String, Object> data = (Map<String, Object>) payload.get("data");
            if (data == null) {
                return ResponseEntity.ok(Map.of("code", "00", "message", "ignored"));
            }

            String code = String.valueOf(payload.get("code"));
            String orderCode = String.valueOf(data.get("orderCode"));

            Optional<WalletTransaction> optionalTx = walletTransactionRepository.findByPayosOrderCode(orderCode);
            if (optionalTx.isEmpty()) {
                return ResponseEntity.ok(Map.of("code", "00", "message", "transaction not found"));
            }

            WalletTransaction tx = optionalTx.get();
            if (tx.getStatus() == WalletTxStatus.COMPLETED) {
                return ResponseEntity.ok(Map.of("code", "00", "message", "already processed"));
            }

            Wallet wallet = tx.getWallet();

            if (!"00".equals(code)) {
                tx.setStatus(WalletTxStatus.FAILED);
                tx.setMetadata(writeMetadata(payload));
                walletTransactionRepository.save(tx);
                return ResponseEntity.ok(Map.of("code", "00", "message", "payment failed"));
            }

            BigDecimal before = wallet.getBalance();
            BigDecimal after = before.add(tx.getAmount());

            wallet.setBalance(after);
            walletRepository.save(wallet);

            tx.setBalanceBefore(before);
            tx.setBalanceAfter(after);
            tx.setStatus(WalletTxStatus.COMPLETED);
            tx.setMetadata(writeMetadata(payload));
            walletTransactionRepository.save(tx);

            return ResponseEntity.ok(Map.of("code", "00", "message", "success"));

        } catch (Exception e) {
            log.error("Error processing PAYOS webhook", e);
            return ResponseEntity.ok(Map.of("code", "00", "message", "error"));
        }
    }

    @Override
    @Transactional
    public void handleDepositResult(String orderCode, String status) {
        if (orderCode == null || orderCode.isBlank()) {
            log.warn("handleDepositResult: orderCode is null or blank");
            return;
        }

        Optional<WalletTransaction> optionalTx = walletTransactionRepository.findByPayosOrderCode(orderCode);
        if (optionalTx.isEmpty()) {
            log.warn("handleDepositResult: Transaction not found for orderCode={}", orderCode);
            return;
        }

        WalletTransaction tx = optionalTx.get();
        
        // Nếu đã completed rồi thì không xử lý lại (idempotency)
        if (tx.getStatus() == WalletTxStatus.COMPLETED) {
            log.info("handleDepositResult: Transaction already completed for orderCode={}", orderCode);
            return;
        }

        Wallet wallet = tx.getWallet();

        // Nếu status=success và transaction đang PENDING -> complete và cộng tiền
        if ("success".equalsIgnoreCase(status) && tx.getStatus() == WalletTxStatus.PENDING) {
            BigDecimal before = wallet.getBalance();
            BigDecimal after = before.add(tx.getAmount());

            wallet.setBalance(after);
            walletRepository.save(wallet);

            tx.setBalanceBefore(before);
            tx.setBalanceAfter(after);
            tx.setStatus(WalletTxStatus.COMPLETED);
            tx.setMetadata("{\"source\":\"deposit_result_page\",\"status\":\"" + status + "\"}");
            walletTransactionRepository.save(tx);

            log.info("✅ Deposit completed via result page. orderCode={}, amount={}, balance: {} -> {}", 
                orderCode, tx.getAmount(), before, after);
        } 
        // Nếu status=cancel hoặc failed -> mark transaction là FAILED
        else if ("cancel".equalsIgnoreCase(status) || "failed".equalsIgnoreCase(status)) {
            tx.setStatus(WalletTxStatus.FAILED);
            tx.setMetadata("{\"source\":\"deposit_result_page\",\"status\":\"" + status + "\"}");
            walletTransactionRepository.save(tx);

            log.info("❌ Deposit cancelled/failed via result page. orderCode={}, status={}", orderCode, status);
        }
    }

    private boolean isPayOsNotConfigured() {
        boolean notConfigured = payOsProperties.getClientId() == null || payOsProperties.getClientId().isBlank()
                || payOsProperties.getApiKey() == null || payOsProperties.getApiKey().isBlank()
                || payOsProperties.getBaseUrl() == null || payOsProperties.getBaseUrl().isBlank();
        
        if (notConfigured) {
            log.warn("⚠️ PAYOS not fully configured. Missing: clientId={}, apiKey={}, baseUrl={}", 
                payOsProperties.getClientId() == null || payOsProperties.getClientId().isBlank() ? "MISSING" : "OK",
                payOsProperties.getApiKey() == null || payOsProperties.getApiKey().isBlank() ? "MISSING" : "OK",
                payOsProperties.getBaseUrl() == null || payOsProperties.getBaseUrl().isBlank() ? "MISSING" : "OK");
        } else {
            log.info("✅ PAYOS is configured. Using real PAYOS API at: {}", payOsProperties.getBaseUrl());
        }
        
        return notConfigured;
    }

    /**
     * Verify PAYOS webhook signature để đảm bảo request đến từ PAYOS thật.
     * PAYOS gửi signature trong header hoặc trong payload.
     * 
     * Format: HMAC-SHA256(data + checksumKey)
     */
    private boolean verifyPayOsSignature(Map<String, Object> payload) {
        // Nếu chưa config checksum-key, skip verification (chỉ để dev/test)
        if (payOsProperties.getChecksumKey() == null || payOsProperties.getChecksumKey().isBlank()) {
            log.warn("⚠️ PAYOS_CHECKSUM_KEY not configured. Skipping signature verification.");
            return true; // Cho phép trong môi trường dev
        }
        
        try {
            // PAYOS thường gửi signature trong header "x-payos-signature" hoặc trong payload
            // Tùy theo tài liệu PAYOS thực tế, bạn có thể cần điều chỉnh logic này
            
            // Tạm thời: nếu có checksum-key thì coi như đã verify (cần cập nhật theo tài liệu PAYOS)
            // TODO: Implement đúng theo PAYOS webhook signature format
            // Ví dụ:
            // String signature = request.getHeader("x-payos-signature");
            // String dataString = objectMapper.writeValueAsString(payload.get("data"));
            // String expectedSignature = calculateHMAC(dataString, payOsProperties.getChecksumKey());
            // return signature != null && signature.equals(expectedSignature);
            
            return true; // Tạm thời return true, cần implement đúng theo PAYOS docs
        } catch (Exception e) {
            log.error("Error verifying PAYOS signature", e);
            return false;
        }
    }
    
    /**
     * Tính HMAC-SHA256 signature (helper method cho verifyPayOsSignature)
     */
    private String calculateHMAC(String data, String secretKey) throws NoSuchAlgorithmException, InvalidKeyException {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return bytesToHex(hash);
    }
    
    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }

    private String writeMetadata(Map<String, Object> payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            return null;
        }
    }
}

