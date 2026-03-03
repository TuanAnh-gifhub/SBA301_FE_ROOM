package org.rent.room.be.serviceImpl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.rent.room.be.dto.response.subscription.SubscriptionResponse;
import org.rent.room.be.entity.RentPackage;
import org.rent.room.be.entity.Subscription;
import org.rent.room.be.entity.User;
import org.rent.room.be.exception.AppException;
import org.rent.room.be.exception.ErrorCode;
import org.rent.room.be.mapper.SubscriptionMapper;
import org.rent.room.be.repository.RentPackageRepository;
import org.rent.room.be.repository.SubscriptionRepository;
import org.rent.room.be.repository.UserRepository;
import org.rent.room.be.service.SubscriptionService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        // 3. (Đã xóa bỏ query User thừa ở đây vì getCurrentUser() đã xử lý rồi)

        // 4. Tạo subscription
        LocalDateTime now = LocalDateTime.now();
        Subscription subscription = Subscription.builder()
                .user(user)
                .rentPackage(pkg)
                .startDate(now)
                // Lưu ý: Đảm bảo pkg.getDurationDays() không trả về null
                .endDate(now.plusDays(pkg.getDurationDays()))
                .active(true)
                .build();

        Subscription saved = subscriptionRepository.save(subscription);
        log.info("User {} subscribed to package {}", user.getUserId(), packageId);

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