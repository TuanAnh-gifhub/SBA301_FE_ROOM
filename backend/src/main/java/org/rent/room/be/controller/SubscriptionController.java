package org.rent.room.be.controller;


import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.rent.room.be.base.ApiResponse;
import org.rent.room.be.dto.request.subscription.SubscriptionRequest;
import org.rent.room.be.dto.response.subscription.SubscriptionResponse;
import org.rent.room.be.service.SubscriptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/subscriptions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Validated
@Tag(name = "7. Subscription")
public class SubscriptionController {

    SubscriptionService subscriptionService;

    // User mua gói
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> subscribe(
            @Valid @RequestBody SubscriptionRequest request) {

        SubscriptionResponse response = subscriptionService.subscribe(request.getPackageId());

        return ResponseEntity.ok(ApiResponse.<SubscriptionResponse>builder()
                .code(201)
                .message("Subscribed successfully")
                .result(response)
                .build());
    }

    // User xem gói của mình
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> getMySubscription() {

        SubscriptionResponse response = subscriptionService.getMySubscription();

        return ResponseEntity.ok(ApiResponse.<SubscriptionResponse>builder()
                .code(200)
                .message("Get subscription successfully")
                .result(response)
                .build());
    }

    // Admin xem subscription của user bất kỳ
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> getByUserId(
            @PathVariable UUID userId) {

        SubscriptionResponse response = subscriptionService.getSubscriptionByUserId(userId);

        return ResponseEntity.ok(ApiResponse.<SubscriptionResponse>builder()
                .code(200)
                .message("Get subscription successfully")
                .result(response)
                .build());
    }
}
