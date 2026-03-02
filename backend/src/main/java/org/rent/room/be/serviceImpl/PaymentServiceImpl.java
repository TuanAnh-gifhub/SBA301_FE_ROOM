package org.rent.room.be.serviceImpl;

import org.rent.room.be.constant.PaymentMethod;
import org.rent.room.be.constant.PaymentStatus;
import org.rent.room.be.dto.request.payment.CheckoutRequest;
import org.rent.room.be.dto.response.booking.BookingResponse;
import org.rent.room.be.entity.BookingIntent;
import org.rent.room.be.entity.Payment;
import org.rent.room.be.repository.BookingIntentRepository;

import org.rent.room.be.repository.PaymentRepository;
import org.rent.room.be.service.BookingService;
import org.rent.room.be.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class PaymentServiceImpl implements PaymentService {
    @Autowired
    private BookingService bookingService;
    @Autowired
    private BookingIntentRepository bookingIntentRepository;
    @Autowired
    private PaymentRepository paymentRepository;

    @Override
    @Transactional
    public BookingResponse checkout(CheckoutRequest checkoutRequest) {
        BookingIntent intent =
                bookingIntentRepository
                        .findById(checkoutRequest.getBookingIntentId())
                        .orElseThrow(() ->
                                new RuntimeException("Intent not found"));


        Payment payment = Payment.builder()
                .bookingIntent(intent)
                .amount(intent.getPreviewPrice())
                .paymentMethod(PaymentMethod.valueOf(checkoutRequest.getPaymentMethod()))
                .paymentStatus(PaymentStatus.SUCCESS)
                .createdAt(LocalDateTime.now())
                .build();

        paymentRepository.save(payment);


        return bookingService.createBooking(
                checkoutRequest.getBookingIntentId()
        );
    }
}
