package org.rent.room.be.service;


import org.rent.room.be.dto.response.subscription.SubscriptionResponse;

import java.util.UUID;

public interface SubscriptionService {

    // User mua gói
    SubscriptionResponse subscribe(UUID packageId);

    // User xem gói đang dùng
    SubscriptionResponse getMySubscription();

    // Admin xem subscription của 1 user
    SubscriptionResponse getSubscriptionByUserId(UUID userId);
}