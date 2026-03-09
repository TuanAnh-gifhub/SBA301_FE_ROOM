package org.rent.room.be.serviceImpl;

import com.itextpdf.io.exceptions.IOException;
import org.rent.room.be.constant.PaymentStatus;
import org.rent.room.be.dto.request.payment.CheckoutRequest;
import org.rent.room.be.dto.response.booking.BookingResponse;
import org.rent.room.be.entity.BookingIntent;
import org.rent.room.be.entity.Payment;
import org.rent.room.be.entity.User;
import org.rent.room.be.repository.BookingIntentRepository;
import org.rent.room.be.repository.PaymentRepository;
import org.rent.room.be.repository.UserRepository;
import org.rent.room.be.service.BookingService;
import org.rent.room.be.service.PaymentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class PaymentServiceImpl implements PaymentService {



    @Autowired
    private BookingIntentRepository bookingIntentRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingService bookingService;


    @Override
    @Transactional
    public BookingResponse checkout(CheckoutRequest checkoutRequest) throws IOException, java.io.IOException {
        BookingIntent intent =
                bookingIntentRepository
                        .findById(checkoutRequest.getBookingIntentId())
                        .orElseThrow(() ->
                                new RuntimeException("Intent not found"));

        if(intent.getUser().getPhone() == null || intent.getUser().getPhone().isEmpty()){
            User user = intent.getUser();
            user.setPhone(checkoutRequest.getPhoneNumber());
            userRepository.save(user);
        }


        Payment payment = Payment.builder()
                .bookingIntent(intent)
                .amount(intent.getPreviewPrice())
                .paymentMethod(checkoutRequest.getPaymentMethod())
                .paymentStatus(PaymentStatus.SUCCESS)
                .transactionDate(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .build();

        paymentRepository.save(payment);

        return  bookingService.createBooking(checkoutRequest.getBookingIntentId(), payment, checkoutRequest.getNote());
    }
}