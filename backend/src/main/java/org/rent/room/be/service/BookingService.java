package org.rent.room.be.service;


import org.rent.room.be.base.PageResponse;
import org.rent.room.be.constant.BookingStatus;

import org.rent.room.be.dto.request.booking.BookingRequest;
import org.rent.room.be.dto.response.booking.BookingIntentResponse;
import org.rent.room.be.dto.response.booking.BookingResponse;
import org.rent.room.be.dto.response.qr.ScanQRResponse;
import org.rent.room.be.entity.Payment;

import java.io.IOException;
import java.time.LocalDate;
import java.util.UUID;

public interface BookingService {
   void releaseExpiredHolds();
    BookingIntentResponse getBookingIntentById(UUID bookingIntentId);
    BookingIntentResponse createBookingIntent(BookingRequest bookingRequest);
  BookingResponse createBooking(UUID bookingIntentID, Payment payment) throws IOException;
    BookingIntentResponse updateBookingIntent(UUID bookingIntentId,BookingRequest bookingRequest);
  BookingResponse updateBooking(BookingRequest bookingRequest);
  BookingResponse getBookingById(UUID bookingId);
  PageResponse<BookingResponse> getAllBookings(BookingStatus bookingStatus, String keyword,
                                               LocalDate from, LocalDate to, int page, int size);

}
