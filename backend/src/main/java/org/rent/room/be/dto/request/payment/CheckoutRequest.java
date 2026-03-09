package org.rent.room.be.dto.request.payment;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import org.rent.room.be.constant.PaymentMethod;

import java.util.UUID;

@Getter
public class CheckoutRequest {
    @NotNull(message = "Mã booking intent không được bỏ trống")
    private UUID bookingIntentId;
    @NotNull(message = "Phương thức thanh toán không được bỏ trống")
    private PaymentMethod paymentMethod;
    private String note;
    @NotNull(message = "Số điện thoại không được bỏ trống")
    private String phoneNumber;
}
