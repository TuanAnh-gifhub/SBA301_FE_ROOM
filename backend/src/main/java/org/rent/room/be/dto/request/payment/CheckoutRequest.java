package org.rent.room.be.dto.request.payment;

import lombok.Getter;

import java.util.UUID;

@Getter
public class CheckoutRequest {
    private UUID bookingIntentId;
    private String paymentMethod;
}
