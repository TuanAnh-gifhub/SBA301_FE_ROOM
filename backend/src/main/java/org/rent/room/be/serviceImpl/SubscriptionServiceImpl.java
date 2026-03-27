package org.rent.room.be.serviceImpl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.rent.room.be.constant.WalletStatus;
import org.rent.room.be.constant.WalletTxStatus;
import org.rent.room.be.constant.WalletTxType;
import org.rent.room.be.dto.response.subscription.SubscriptionResponse;
import org.rent.room.be.entity.*;
import org.rent.room.be.exception.AppException;
import org.rent.room.be.exception.ErrorCode;
import org.rent.room.be.mapper.SubscriptionMapper;
import org.rent.room.be.repository.*;
import org.rent.room.be.service.SubscriptionService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SubscriptionServiceImpl implements SubscriptionService {

    SubscriptionRepository subscriptionRepository;
    RentPackageRepository rentPackageRepository;
    UserRepository userRepository;
    SubscriptionMapper subscriptionMapper;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    // Lấy email từ JWT token
    private User getCurrentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        // Tránh lỗi NullPointer nếu endpoint lọt qua Security Filter (VD: permitAll)
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED); // Đảm bảo bạn có mã lỗi này
        }

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    @Override
    @Transactional
    public SubscriptionResponse subscribe(UUID packageId) {
        User user = getCurrentUser();

        // 1. Kiểm tra user có đang active subscription không
        if (subscriptionRepository.existsByUser_UserIdAndActiveTrue(user.getUserId())) {
            throw new AppException(ErrorCode.SUBSCRIPTION_ALREADY_ACTIVE);
        }

        // 2. Tìm package
        RentPackage pkg = rentPackageRepository.findById(packageId)
                .orElseThrow(() -> new AppException(ErrorCode.RENTPACKAGE_NOT_FOUND));

        // Lấy giá tiền của gói (Giả sử Entity RentPackage của bạn có trường "price" kiểu BigDecimal)
        BigDecimal packagePrice = pkg.getPrice();

        // 3. XỬ LÝ TRỪ TIỀN TRONG VÍ
        // Tìm ví của user
        Wallet wallet = walletRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.WALLET_NOT_FOUND));

        // Kiểm tra trạng thái ví có đang bị khóa không (Tùy thuộc vào Enum WalletStatus của bạn)
        if (wallet.getWalletStatus() != WalletStatus.ACTIVE) {
            throw new AppException(ErrorCode.WALLET_LOCKED);
        }

        // Kiểm tra số dư khả dụng (phải lớn hơn hoặc bằng giá gói)
        if (wallet.getBalance().compareTo(packagePrice) < 0) {
            throw new AppException(ErrorCode.INSUFFICIENT_BALANCE); // Không đủ số dư
        }

        // Lưu lại số dư hiện tại để ghi log
        BigDecimal balanceBefore = wallet.getBalance();

        // Thực hiện trừ tiền
        wallet.setBalance(balanceBefore.subtract(packagePrice));
        walletRepository.save(wallet);

        // 4. LƯU LỊCH SỬ GIAO DỊCH (WALLET TRANSACTION)
        WalletTransaction transaction = WalletTransaction.builder()
                .wallet(wallet)
                // Thay "PAYMENT" bằng Enum tương ứng trong WalletTxType của bạn (VD: PACKAGE_SUBSCRIPTION)
                .type(WalletTxType.PACKAGE_PURCHASE)
                // Thay "SUCCESS" bằng Enum tương ứng trong WalletTxStatus của bạn
                .status(WalletTxStatus.COMPLETED)
                .amount(packagePrice)
                .balanceBefore(balanceBefore)
                .balanceAfter(wallet.getBalance())
                .description("Thanh toán mua gói Premium: " + pkg.getRentPackageName())
                .build();
        walletTransactionRepository.save(transaction);

        // 5. TẠO VÀ LƯU SUBSCRIPTION
        LocalDateTime now = LocalDateTime.now();
        Subscription subscription = Subscription.builder()
                .user(user)
                .rentPackage(pkg)
                .startDate(now)
                .endDate(now.plusDays(pkg.getDurationDays()))
                .active(true)
                .build();

        Subscription saved = subscriptionRepository.save(subscription);

        log.info("User {} subscribed to package {}. Deducted {} from wallet.", user.getUserId(), packageId, packagePrice);

        return subscriptionMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SubscriptionResponse getMySubscription() {
        User user = getCurrentUser();

        Subscription sub = subscriptionRepository
                .findByUser_UserIdAndActiveTrue(user.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_NOT_FOUND));

        return subscriptionMapper.toResponse(sub);
    }

    @Override
    @Transactional(readOnly = true)
    public SubscriptionResponse getSubscriptionByUserId(UUID userId) {
        Subscription sub = subscriptionRepository
                .findByUser_UserIdAndActiveTrue(userId)
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_NOT_FOUND));

        return subscriptionMapper.toResponse(sub);
    }
}