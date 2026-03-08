package org.rent.room.be.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.rent.room.be.base.ApiResponse;
import org.rent.room.be.dto.request.wallet.CreateDepositLinkRequest;
import org.rent.room.be.dto.response.wallet.CommissionInfoResponse;
import org.rent.room.be.dto.response.wallet.DepositLinkResponse;
import org.rent.room.be.dto.response.wallet.RevenueOverviewResponse;
import org.rent.room.be.dto.response.wallet.WalletInfoResponse;
import org.rent.room.be.dto.response.wallet.WalletTransactionItemResponse;
import org.rent.room.be.base.PageResponse;
import org.rent.room.be.service.WalletDepositService;
import org.rent.room.be.service.WalletService;
import org.rent.room.be.serviceImpl.WalletQueryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/wallet")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "4. Wallet")
public class WalletController {

    WalletDepositService walletDepositService;
    WalletService walletService;
    WalletQueryService walletQueryService;

    @PostMapping("/deposit/create-link")
    @PreAuthorize("hasAnyRole('ADMIN','RENTER','OWNER')")
    public ResponseEntity<ApiResponse<DepositLinkResponse>> createDepositLink(
            @Valid @RequestBody CreateDepositLinkRequest request
    ) {
        DepositLinkResponse response = walletDepositService.createDepositLink(request);
        return ResponseEntity.ok(
                ApiResponse.<DepositLinkResponse>builder()
                        .code(200)
                        .message("Create deposit link successfully")
                        .result(response)
                        .build()
        );
    }

    @PostMapping("/deposit/webhook")
    public ResponseEntity<Map<String, Object>> handlePayOsWebhook(
            @RequestBody Map<String, Object> payload
    ) {
        return walletDepositService.handlePayOsWebhook(payload);
    }

    @GetMapping("/deposit/result")
    @PreAuthorize("hasAnyRole('ADMIN','RENTER','OWNER')")
    public ResponseEntity<ApiResponse<Map<String, String>>> handleDepositResult(
            @RequestParam String orderCode,
            @RequestParam String status
    ) {
        walletDepositService.handleDepositResult(orderCode, status);

        return ResponseEntity.ok(
                ApiResponse.<Map<String, String>>builder()
                        .code(200)
                        .message("Deposit result recorded")
                        .result(Map.of(
                            "orderCode", orderCode,
                            "status", status
                        ))
                        .build()
        );
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('RENTER','OWNER')")
    public ResponseEntity<ApiResponse<WalletInfoResponse>> getMyWallet() {
        WalletInfoResponse wallet = walletService.getMyWalletInfo();
        return ResponseEntity.ok(
                ApiResponse.<WalletInfoResponse>builder()
                        .code(200)
                        .message("Get my wallet successfully")
                        .result(wallet)
                        .build()
        );
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasAnyRole('RENTER','OWNER')")
    public ResponseEntity<ApiResponse<PageResponse<WalletTransactionItemResponse>>> getMyTransactions(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate
    ) {
        PageResponse<WalletTransactionItemResponse> result =
                walletQueryService.getMyTransactions(page, limit, type, status, fromDate, toDate);
        return ResponseEntity.ok(
                ApiResponse.<PageResponse<WalletTransactionItemResponse>>builder()
                        .code(200)
                        .message("Get wallet transactions successfully")
                        .result(result)
                        .build()
        );
    }

    @GetMapping("/commission")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<CommissionInfoResponse>> getMyCommission() {
        CommissionInfoResponse response = walletQueryService.getMyCommission();
        return ResponseEntity.ok(
                ApiResponse.<CommissionInfoResponse>builder()
                        .code(200)
                        .message("Get commission successfully")
                        .result(response)
                        .build()
        );
    }

    @GetMapping("/revenue")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<RevenueOverviewResponse>> getMyRevenue(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate
    ) {
        RevenueOverviewResponse response = walletQueryService.getMyRevenue(fromDate, toDate);
        return ResponseEntity.ok(
                ApiResponse.<RevenueOverviewResponse>builder()
                        .code(200)
                        .message("Get revenue successfully")
                        .result(response)
                        .build()
        );
    }
}

