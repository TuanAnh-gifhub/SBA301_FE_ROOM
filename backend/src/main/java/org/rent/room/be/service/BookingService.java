package org.rent.room.be.service;


import org.rent.room.be.base.PageResponse;
import org.rent.room.be.constant.BookingStatus;

import org.rent.room.be.dto.request.booking.BookingRequest;
import org.rent.room.be.dto.request.booking.CheckSlotConflictRequest;
import org.rent.room.be.dto.request.booking.GetAvailableSlotsRequest;
import org.rent.room.be.dto.request.booking.UpdateBookingRequest;
import org.rent.room.be.dto.request.booking.UpdateBookingSlotRequest;
import org.rent.room.be.dto.response.booking.AvailableSlotResponse;
import org.rent.room.be.dto.response.booking.BookingDashboardResponse;
import org.rent.room.be.dto.response.booking.BookingIntentResponse;
import org.rent.room.be.dto.response.booking.BookingResponse;
import org.rent.room.be.dto.response.booking.BookingSummaryResponse;
import org.rent.room.be.dto.response.booking.ConflictBookingResponse;
import org.rent.room.be.dto.response.slot.SlotConflictResult;
import org.rent.room.be.entity.Payment;

import java.io.IOException;
import java.time.LocalDate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface BookingService {
    BookingIntentResponse getBookingIntentById(UUID bookingIntentId);

    BookingIntentResponse createBookingIntent(BookingRequest bookingRequest);

    BookingResponse createBooking(UUID bookingIntentID, Payment payment) throws IOException;

    BookingResponse updateBooking(UUID bookingId, UpdateBookingRequest bookingRequest);

    BookingResponse getBookingById(UUID bookingId);

    PageResponse<BookingResponse> getAllBookings(BookingStatus bookingStatus, String keyword, LocalDate from, LocalDate to, int page, int size);

    PageResponse<BookingResponse> getBookingsRentalId(UUID userId, BookingStatus bookingStatus, String keyword, LocalDate from, LocalDate to, int page, int size);

    PageResponse<BookingResponse> getMyBookings(UUID userId, BookingStatus bookingStatus, String keyword, LocalDate from, LocalDate to, int page, int size);

    BookingResponse cancelBooking(UUID bookingId);

    BookingSummaryResponse getBookingSummary(LocalDateTime from, LocalDateTime to, UUID userId);

    BookingDashboardResponse revenue(Integer month, Integer year);


}
