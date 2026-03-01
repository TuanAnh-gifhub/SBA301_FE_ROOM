package org.rent.room.be.repository;


import org.rent.room.be.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    // Tìm subscription đang active của user
    Optional<Subscription> findByUser_UserIdAndActiveTrue(UUID userId);

    // Kiểm tra user có đang active subscription không
    boolean existsByUser_UserIdAndActiveTrue(UUID userId);
}
