package org.rent.room.be.serviceImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.rent.room.be.constant.BookingStatus;
import org.rent.room.be.constant.WalletTxStatus;
import org.rent.room.be.constant.WalletTxType;
import org.rent.room.be.entity.Booking;
import org.rent.room.be.entity.CommissionConfig;
import org.rent.room.be.entity.User;
import org.rent.room.be.entity.Wallet;
import org.rent.room.be.entity.WalletTransaction;
import org.rent.room.be.repository.BookingRepository;
import org.rent.room.be.repository.CommissionConfigRepository;
import org.rent.room.be.repository.WalletRepository;
import org.rent.room.be.repository.WalletTransactionRepository;
import org.rent.room.be.service.WalletService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EscrowReleaseService {

    private static final int ESCROW_DAYS = 7;

    private final BookingRepository bookingRepository;
    private final WalletService walletService;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final CommissionConfigRepository commissionConfigRepository;

    @Transactional
    public int releaseCompletedBookingsAfterEscrow() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(ESCROW_DAYS);
        List<Booking> releasableBookings = bookingRepository
                .findByBookingStatusAndCheckOutIsNotNullAndCheckOutLessThanEqualAndEscrowReleasedAtIsNullAndDisputeFlagFalse(
                        BookingStatus.COMPLETED, cutoff
                );

        int releasedCount = 0;
        for (Booking booking : releasableBookings) {
            if (booking.getRentalArea() == null || booking.getRentalArea().getOwner() == null) {
                continue;
            }

            if (walletTransactionRepository.existsByBookingIdAndType(booking.getBookingId(), WalletTxType.BOOKING_INCOME)) {
                continue;
            }

            User owner = booking.getRentalArea().getOwner();
            Wallet ownerWallet = walletService.getOrCreateWallet(owner);

            BigDecimal gross = booking.getTotalPrice() == null ? BigDecimal.ZERO : booking.getTotalPrice();
            BigDecimal rate = resolveCommissionRate(owner);
            BigDecimal commission = gross.multiply(rate).setScale(2, RoundingMode.HALF_UP);
            if (commission.compareTo(gross) > 0) {
                commission = gross;
            }
            BigDecimal netIncome = gross.subtract(commission);

            BigDecimal balanceBefore = ownerWallet.getBalance();
            BigDecimal balanceAfter = balanceBefore.add(netIncome);
            ownerWallet.setBalance(balanceAfter);
            walletRepository.save(ownerWallet);

            if (commission.compareTo(BigDecimal.ZERO) > 0) {
                walletTransactionRepository.save(
                        WalletTransaction.builder()
                                .wallet(ownerWallet)
                                .type(WalletTxType.COMMISSION)
                                .status(WalletTxStatus.COMPLETED)
                                .amount(commission)
                                .balanceBefore(balanceBefore)
                                .balanceAfter(balanceBefore)
                                .description("Tru hoa hong booking " + booking.getBookingId())
                                .bookingId(booking.getBookingId())
                                .build()
                );
            }

            walletTransactionRepository.save(
                    WalletTransaction.builder()
                            .wallet(ownerWallet)
                            .type(WalletTxType.BOOKING_INCOME)
                            .status(WalletTxStatus.COMPLETED)
                            .amount(netIncome)
                            .balanceBefore(balanceBefore)
                            .balanceAfter(balanceAfter)
                            .description("Giai phong escrow booking " + booking.getBookingId() + " sau 7 ngay")
                            .bookingId(booking.getBookingId())
                            .build()
            );

            booking.setEscrowReleasedAt(LocalDateTime.now());
            bookingRepository.save(booking);

            releasedCount++;
        }

        if (releasedCount > 0) {
            log.info("Escrow release completed. releasedBookings={}", releasedCount);
        }
        return releasedCount;
    }

    private BigDecimal resolveCommissionRate(User owner) {
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
