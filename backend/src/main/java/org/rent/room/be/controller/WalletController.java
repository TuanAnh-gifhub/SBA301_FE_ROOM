package org.rent.room.be.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.rent.room.be.base.ApiResponse;
import org.rent.room.be.constant.WithdrawStatus;
import org.rent.room.be.dto.request.wallet.AdminWithdrawRejectRequest;
import org.rent.room.be.dto.request.wallet.CreateDepositLinkRequest;
import org.rent.room.be.dto.request.wallet.CreateWithdrawRequest;
import org.rent.room.be.dto.request.wallet.UpdateWalletFreezeRequest;
import org.rent.room.be.dto.response.wallet.AdminWalletStatusResponse;
import org.rent.room.be.dto.response.wallet.AdminWithdrawRequestItemResponse;
import org.rent.room.be.dto.response.wallet.CommissionInfoResponse;
import org.rent.room.be.dto.response.wallet.DepositLinkResponse;
import org.rent.room.be.dto.response.wallet.RevenueOverviewResponse;
import org.rent.room.be.dto.response.wallet.WalletInfoResponse;
import org.rent.room.be.dto.response.wallet.WalletTransactionItemResponse;
import org.rent.room.be.dto.response.wallet.WithdrawRequestItemResponse;
import org.rent.room.be.base.PageResponse;
import org.rent.room.be.service.WalletAdminService;
import org.rent.room.be.service.WalletDepositService;
import org.rent.room.be.service.WalletService;
import org.rent.room.be.service.WalletWithdrawService;
import org.rent.room.be.serviceImpl.WalletQueryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/wallet")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "4. Wallet")
public class WalletController {

    WalletDepositService walletDepositService;
    WalletService walletService;
    WalletQueryService walletQueryService;
    WalletWithdrawService walletWithdrawService;
    WalletAdminService walletAdminService;

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

    @PostMapping("/withdraw-requests")
    @PreAuthorize("hasAnyRole('RENTER','OWNER')")
    public ResponseEntity<ApiResponse<WithdrawRequestItemResponse>> createWithdrawRequest(
            @Valid @RequestBody CreateWithdrawRequest request
    ) {
        WithdrawRequestItemResponse response = walletWithdrawService.createWithdrawRequest(request);
        return ResponseEntity.ok(
                ApiResponse.<WithdrawRequestItemResponse>builder()
                        .code(200)
                        .message("Create withdraw request successfully")
                        .result(response)
                        .build()
        );
    }

    @GetMapping("/withdraw-requests")
    @PreAuthorize("hasAnyRole('RENTER','OWNER')")
    public ResponseEntity<ApiResponse<PageResponse<WithdrawRequestItemResponse>>> getMyWithdrawRequests(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) WithdrawStatus status
    ) {
        PageResponse<WithdrawRequestItemResponse> result =
                walletWithdrawService.getMyWithdrawRequests(page, limit, status);
        return ResponseEntity.ok(
                ApiResponse.<PageResponse<WithdrawRequestItemResponse>>builder()
                        .code(200)
                        .message("Get my withdraw requests successfully")
                        .result(result)
                        .build()
        );
    }

    @GetMapping("/admin/withdraw-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<AdminWithdrawRequestItemResponse>>> getAllWithdrawRequests(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) WithdrawStatus status,
            @RequestParam(required = false) UUID userId
    ) {
        PageResponse<AdminWithdrawRequestItemResponse> result =
                walletWithdrawService.getAllWithdrawRequests(page, limit, status, userId);
        return ResponseEntity.ok(
                ApiResponse.<PageResponse<AdminWithdrawRequestItemResponse>>builder()
                        .code(200)
                        .message("Get withdraw requests successfully")
                        .result(result)
                        .build()
        );
    }

    @PatchMapping("/admin/withdraw-requests/{withdrawRequestId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> approveWithdrawRequest(
            @PathVariable UUID withdrawRequestId
    ) {
        walletWithdrawService.approveWithdrawRequest(withdrawRequestId);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .code(200)
                        .message("Approve withdraw request successfully")
                        .build()
        );
    }

    @PatchMapping("/admin/withdraw-requests/{withdrawRequestId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> rejectWithdrawRequest(
            @PathVariable UUID withdrawRequestId,
            @Valid @RequestBody AdminWithdrawRejectRequest request
    ) {
        walletWithdrawService.rejectWithdrawRequest(withdrawRequestId, request.getAdminNote());
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .code(200)
                        .message("Reject withdraw request successfully")
                        .build()
        );
    }

    @PatchMapping("/admin/users/{userId}/freeze")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminWalletStatusResponse>> updateWalletFreezeStatus(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateWalletFreezeRequest request
    ) {
        AdminWalletStatusResponse response = walletAdminService.updateWalletFreezeStatus(userId, request);
        return ResponseEntity.ok(
                ApiResponse.<AdminWalletStatusResponse>builder()
                        .code(200)
                        .message("Update wallet freeze status successfully")
                        .result(response)
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

