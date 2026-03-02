package org.rent.room.be.controller;

import org.rent.room.be.base.ApiResponse;
import org.rent.room.be.dto.request.payment.CheckoutRequest;
import org.rent.room.be.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController

@RequestMapping("/payments")
public class PaymentController {
    @Autowired
    private  PaymentService paymentService;


    @PostMapping("/checkout")
    public ApiResponse<?> checkout(
            @RequestBody CheckoutRequest request
    ) {
        return ApiResponse.success(
                paymentService.checkout(request)
        );
    }
}