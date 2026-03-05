package org.rent.room.be.service;

import org.rent.room.be.dto.request.payment.CheckoutRequest;
import org.rent.room.be.dto.response.booking.BookingResponse;

import java.io.IOException;

public interface PaymentService {
   BookingResponse checkout(CheckoutRequest checkoutRequest) throws IOException;
}
