package org.rent.room.be.serviceImpl;

import lombok.RequiredArgsConstructor;
import org.rent.room.be.constant.WalletStatus;
import org.rent.room.be.dto.request.wallet.UpdateEscrowDisputeRequest;
import org.rent.room.be.dto.request.wallet.UpsertCommissionConfigRequest;
import org.rent.room.be.dto.request.wallet.UpdateWalletFreezeRequest;
import org.rent.room.be.dto.response.wallet.AdminCommissionConfigListResponse;
import org.rent.room.be.dto.response.wallet.AdminCommissionConfigResponse;
import org.rent.room.be.entity.CommissionConfig;
import org.rent.room.be.entity.Booking;
import org.rent.room.be.entity.User;
import org.rent.room.be.dto.response.wallet.AdminWalletStatusResponse;
import org.rent.room.be.entity.Wallet;
import org.rent.room.be.repository.BookingRepository;
import org.rent.room.be.repository.CommissionConfigRepository;
import org.rent.room.be.repository.WalletRepository;
import org.rent.room.be.service.UserService;
import org.rent.room.be.service.WalletAdminService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WalletAdminServiceImpl implements WalletAdminService {

    private final WalletRepository walletRepository;
    private final BookingRepository bookingRepository;
    private final CommissionConfigRepository commissionConfigRepository;
    private final UserService userService;
    private final EscrowReleaseService escrowReleaseService;

    @Override
    @Transactional
    public AdminWalletStatusResponse updateWalletFreezeStatus(UUID userId, UpdateWalletFreezeRequest request) {
        Wallet wallet = walletRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví của user"));

        if (Boolean.TRUE.equals(request.getLocked())) {
            if (request.getReason() == null || request.getReason().isBlank()) {
                throw new RuntimeException("Vui lòng nhập lý do khóa ví");
            }
            wallet.setWalletStatus(WalletStatus.LOCKED);
            wallet.setFrozenReason(request.getReason());
        } else {
            wallet.setWalletStatus(WalletStatus.ACTIVE);
            wallet.setFrozenReason(null);
        }

        walletRepository.save(wallet);

        return AdminWalletStatusResponse.builder()
                .walletId(wallet.getWalletId())
                .userId(wallet.getUser().getUserId())
                .userName(wallet.getUser().getUserName())
                .balance(wallet.getBalance())
                .frozenAmount(wallet.getFrozenAmount())
                .walletStatus(wallet.getWalletStatus())
                .frozenReason(wallet.getFrozenReason())
                .build();
    }

    @Override
    @Transactional
    public AdminCommissionConfigResponse upsertDefaultCommission(UpsertCommissionConfigRequest request) {
        User admin = userService.getCurrentUserEntity();
        CommissionConfig config = commissionConfigRepository.findByIsDefaultTrue()
                .or(() -> commissionConfigRepository.findByOwnerIsNull())
                .orElseGet(CommissionConfig::new);

        config.setOwner(null);
        config.setIsDefault(true);
        config.setRate(request.getRate());
        config.setLegacyRate(request.getRate());
        config.setNote(request.getNote());
        config.setCreatedBy(admin.getUserId());

        return toAdminCommissionResponse(commissionConfigRepository.save(config));
    }

    @Override
    @Transactional
    public AdminCommissionConfigResponse upsertOwnerCommission(UUID ownerId, UpsertCommissionConfigRequest request) {
        User admin = userService.getCurrentUserEntity();
        User owner = userService.findByUserId(ownerId);
        if (owner.getRole() == null || !"OWNER".equalsIgnoreCase(owner.getRole().getRoleName())) {
            throw new RuntimeException("User không thuộc role OWNER");
        }

        CommissionConfig config = commissionConfigRepository.findByOwner(owner)
                .orElseGet(CommissionConfig::new);
        config.setOwner(owner);
        config.setIsDefault(false);
        config.setRate(request.getRate());
        config.setLegacyRate(request.getRate());
        config.setNote(request.getNote());
        config.setCreatedBy(admin.getUserId());

        return toAdminCommissionResponse(commissionConfigRepository.save(config));
    }

    @Override
    @Transactional(readOnly = true)
    public AdminCommissionConfigListResponse getCommissionConfigs() {
        AdminCommissionConfigResponse defaultConfig = commissionConfigRepository.findByIsDefaultTrue()
                .or(() -> commissionConfigRepository.findByOwnerIsNull())
                .map(this::toAdminCommissionResponse)
                .orElse(null);

        List<AdminCommissionConfigResponse> ownerConfigs = commissionConfigRepository.findAllByOwnerIsNotNull()
                .stream()
                .sorted(Comparator.comparing(CommissionConfig::getCreatedAt).reversed())
                .map(this::toAdminCommissionResponse)
                .toList();

        return AdminCommissionConfigListResponse.builder()
                .defaultConfig(defaultConfig)
                .ownerConfigs(ownerConfigs)
                .build();
    }

    private AdminCommissionConfigResponse toAdminCommissionResponse(CommissionConfig config) {
        User owner = config.getOwner();
        boolean isDefault = Boolean.TRUE.equals(config.getIsDefault()) || owner == null;
        return AdminCommissionConfigResponse.builder()
                .commissionConfigId(config.getCommissionConfigId())
                .isDefault(isDefault)
                .ownerId(isDefault ? null : owner.getUserId())
                .ownerName(isDefault ? null : owner.getUserName())
                .ownerEmail(isDefault ? null : owner.getEmail())
                .rate(config.getRate())
                .note(config.getNote())
                .createdBy(config.getCreatedBy())
                .createdAt(config.getCreatedAt())
                .updatedAt(config.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public void updateEscrowDispute(UUID bookingId, UpdateEscrowDisputeRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking"));
        booking.setDisputeFlag(Boolean.TRUE.equals(request.getDisputed()));
        booking.setDisputeNote(request.getNote());
        bookingRepository.save(booking);
    }

    @Override
    @Transactional
    public int triggerEscrowReleaseNow() {
        return escrowReleaseService.releaseCompletedBookingsAfterEscrow();
    }
}
