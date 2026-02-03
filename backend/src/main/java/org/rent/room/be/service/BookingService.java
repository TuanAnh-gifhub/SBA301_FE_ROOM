package org.rent.room.be.service;


import org.rent.room.be.base.PageResponse;
import org.rent.room.be.dto.request.booking.BookingRequest;
import org.rent.room.be.dto.response.booking.BookingResponse;

import java.time.LocalDate;
import java.util.UUID;

public interface BookingService {

  BookingResponse createBooking(BookingRequest bookingRequest);
  BookingResponse updateBooking(BookingRequest bookingRequest);
  BookingResponse getBookingById(UUID bookingId);
  PageResponse<BookingResponse> getAllBookings(int page, int size, String keyword, LocalDate from, LocalDate to);

}
