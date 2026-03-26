package org.rent.room.be.serviceImpl;

import lombok.RequiredArgsConstructor;
import org.rent.room.be.constant.BookingStatus;
import org.rent.room.be.base.PageResponse;
import org.rent.room.be.constant.WalletTxStatus;
import org.rent.room.be.constant.WalletTxType;
import org.rent.room.be.dto.response.wallet.*;
import org.rent.room.be.entity.Booking;
import org.rent.room.be.entity.CommissionConfig;
import org.rent.room.be.entity.User;
import org.rent.room.be.entity.Wallet;
import org.rent.room.be.entity.WalletTransaction;
import org.rent.room.be.repository.BookingRepository;
import org.rent.room.be.repository.CommissionConfigRepository;
import org.rent.room.be.repository.WalletTransactionRepository;
import org.rent.room.be.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WalletQueryService {

    private final UserService userService;
    private final WalletServiceImpl walletServiceImpl;
    private final WalletTransactionRepository walletTransactionRepository;
    private final CommissionConfigRepository commissionConfigRepository;
    private final BookingRepository bookingRepository;

    @Transactional(readOnly = true)
    public PageResponse<WalletTransactionItemResponse> getMyTransactions(
            int page,
            int limit,
            String type,
            String status,
            String fromDate,
            String toDate
    ) {
        if (limit > 100) {
            limit = 100;
        }
        if (page < 1) {
            page = 1;
        }
        Pageable pageable = PageRequest.of(page - 1, limit,
                Sort.by(Sort.Direction.DESC, "createdAt"));

        User currentUser = userService.getCurrentUserEntity();
        Wallet wallet = walletServiceImpl.getOrCreateWallet(currentUser);

        LocalDateTime from = parseDateOrDefault(fromDate, LocalDate.now().minusMonths(1).atStartOfDay());
        LocalDateTime to = parseDateOrDefault(toDate, LocalDateTime.now());

        Page<WalletTransaction> txPage =
                walletTransactionRepository.findByWalletAndCreatedAtBetween(wallet, from, to, pageable);

        List<WalletTransactionItemResponse> items = txPage.getContent().stream()
                .filter(tx -> filterByTypeAndStatus(tx, type, status))
                .map(this::toItemResponse)
                .toList();

        return PageResponse.<WalletTransactionItemResponse>builder()
                .currentPage(txPage.getNumber() + 1)
                .totalPages(txPage.getTotalPages())
                .pageSize(txPage.getSize())
                .totalElements(txPage.getTotalElements())
                .data(items)
                .build();
    }

    @Transactional(readOnly = true)
    public CommissionInfoResponse getMyCommission() {
        User currentUser = userService.getCurrentUserEntity();

        CommissionConfig config = commissionConfigRepository.findByOwner(currentUser)
                .orElseGet(() ->
                        commissionConfigRepository.findByIsDefaultTrue()
                                .or(() -> commissionConfigRepository.findByOwnerIsNull())
                                .orElse(null)
                );

        if (config == null) {
            return CommissionInfoResponse.builder()
                    .rate(BigDecimal.ZERO)
                    .isCustom(false)
                    .effectiveFrom(null)
                    .build();
        }

        boolean isCustom = config.getOwner() != null;

        return CommissionInfoResponse.builder()
                .rate(config.getRate())
                .isCustom(isCustom)
                .effectiveFrom(config.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public RevenueOverviewResponse getMyRevenue(String fromDate, String toDate) {
        User currentUser = userService.getCurrentUserEntity();
        Wallet wallet = walletServiceImpl.getOrCreateWallet(currentUser);

        LocalDateTime from = parseDateOrDefault(fromDate, LocalDate.now().minusMonths(1).atStartOfDay());
        LocalDateTime to   = parseDateOrDefault(toDate, LocalDateTime.now());

        // FIX: dùng SUM query trực tiếp trên DB
        // Cũ: load Pageable(0, 1000) vào memory rồi reduce → SAI khi > 1000 transactions
        // Mới: SELECT SUM() → luôn đúng dù có bao nhiêu records
        BigDecimal totalIncome = walletTransactionRepository.sumAmountByWalletTypeStatus(
                wallet,
                WalletTxType.BOOKING_INCOME,
                WalletTxStatus.COMPLETED,
                from,
                to
        );

        BigDecimal totalCommission = walletTransactionRepository.sumAmountByWalletTypeStatus(
                wallet,
                WalletTxType.COMMISSION,
                WalletTxStatus.COMPLETED,
                from,
                to
        );

        if (totalIncome == null)      totalIncome = BigDecimal.ZERO;
        if (totalCommission == null)  totalCommission = BigDecimal.ZERO;

        BigDecimal netRevenue = totalIncome.subtract(totalCommission);

        // Lấy 50 transaction gần nhất để hiển thị (tách biệt với tính tổng)
        Pageable pageable = PageRequest.of(0, 50, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<WalletTransaction> recentTx = walletTransactionRepository
                .findByWalletAndTypeAndStatusAndCreatedAtBetween(
                        wallet,
                        WalletTxType.BOOKING_INCOME,
                        WalletTxStatus.COMPLETED,
                        from,
                        to,
                        pageable
                );

        List<WalletTransactionItemResponse> incomeTx = recentTx.getContent().stream()
                .map(this::toItemResponse)
                .toList();

        return RevenueOverviewResponse.builder()
                .totalIncome(totalIncome)
                .totalCommission(totalCommission)
                .netRevenue(netRevenue)
                .transactions(incomeTx)
                .build();
    }

    @Transactional(readOnly = true)
    public EscrowSummaryResponse getMyPendingEscrow() {
        User currentUser = userService.getCurrentUserEntity();
        Pageable pageable = PageRequest.of(0, 200, Sort.by(Sort.Direction.DESC, "checkOut"));
        Page<Booking> bookingPage = bookingRepository
                .findByRentalArea_OwnerAndBookingStatusAndEscrowReleasedAtIsNull(
                        currentUser, BookingStatus.COMPLETED, pageable
                );

        List<EscrowItemResponse> items = bookingPage.getContent().stream()
                .map(this::toEscrowItem)
                .toList();

        BigDecimal totalHolding = items.stream()
                .map(EscrowItemResponse::getGrossAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCommission = items.stream()
                .map(EscrowItemResponse::getCommissionAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalNet = items.stream()
                .map(EscrowItemResponse::getNetAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return EscrowSummaryResponse.builder()
                .totalHoldingAmount(totalHolding)
                .totalCommissionAmount(totalCommission)
                .totalNetAmount(totalNet)
                .items(items)
                .build();
    }

    private WalletTransactionItemResponse toItemResponse(WalletTransaction tx) {
        return WalletTransactionItemResponse.builder()
                .transactionId(tx.getWalletTransactionId())
                .type(tx.getType())
                .status(tx.getStatus())
                .amount(tx.getAmount())
                .balanceBefore(tx.getBalanceBefore())
                .balanceAfter(tx.getBalanceAfter())
                .description(tx.getDescription())
                .payosOrderCode(tx.getPayosOrderCode())
                .createdAt(tx.getCreatedAt())
                .build();
    }

    private boolean filterByTypeAndStatus(WalletTransaction tx, String type, String status) {
        boolean matchType = true;
        boolean matchStatus = true;

        if (type != null && !type.isBlank()) {
            try {
                WalletTxType txType = WalletTxType.valueOf(type);
                matchType = tx.getType() == txType;
            } catch (IllegalArgumentException ignored) {
                matchType = true;
            }
        }

        if (status != null && !status.isBlank()) {
            try {
                WalletTxStatus txStatus = WalletTxStatus.valueOf(status);
                matchStatus = tx.getStatus() == txStatus;
            } catch (IllegalArgumentException ignored) {
                matchStatus = true;
            }
        }

        return matchType && matchStatus;
    }

    private LocalDateTime parseDateOrDefault(String value, LocalDateTime defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        try {
            return LocalDateTime.parse(value);
        } catch (DateTimeParseException e) {
            try {
                LocalDate date = LocalDate.parse(value);
                return date.atStartOfDay();
            } catch (DateTimeParseException ignored) {
                return defaultValue;
            }
        }
    }

    private EscrowItemResponse toEscrowItem(Booking booking) {
        User owner = booking.getRentalArea() == null ? null : booking.getRentalArea().getOwner();
        BigDecimal gross = booking.getTotalPrice() == null ? BigDecimal.ZERO : booking.getTotalPrice();
        BigDecimal rate = resolveCommissionRate(owner);
        BigDecimal commission = gross.multiply(rate).setScale(2, RoundingMode.HALF_UP);
        if (commission.compareTo(gross) > 0) {
            commission = gross;
        }
        BigDecimal net = gross.subtract(commission);
        LocalDateTime endedAt = booking.getCheckOut() != null ? booking.getCheckOut() : booking.getEndTime();
        LocalDateTime expectedRelease = endedAt == null ? null : endedAt.plusDays(7);

        return EscrowItemResponse.builder()
                .bookingId(booking.getBookingId())
                .grossAmount(gross)
                .commissionRate(rate)
                .commissionAmount(commission)
                .netAmount(net)
                .bookingEndedAt(endedAt)
                .expectedReleaseAt(expectedRelease)
                .disputeFlag(Boolean.TRUE.equals(booking.getDisputeFlag()))
                .disputeNote(booking.getDisputeNote())
                .build();
    }

    private BigDecimal resolveCommissionRate(User owner) {
        if (owner == null) {
            return BigDecimal.ZERO;
        }
        CommissionConfig config = commissionConfigRepository.findByOwner(owner)
                .or(() -> commissionConfigRepository.findByIsDefaultTrue())
                .or(() -> commissionConfigRepository.findByOwnerIsNull())
                .orElse(null);
        if (config == null || config.getRate() == null) {
            return BigDecimal.ZERO;
        }
        return config.getRate();
    }
}

