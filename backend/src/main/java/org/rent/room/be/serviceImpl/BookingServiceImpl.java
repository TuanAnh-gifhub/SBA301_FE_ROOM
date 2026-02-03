package org.rent.room.be.serviceImpl;

import org.rent.room.be.base.PageResponse;
import org.rent.room.be.constant.BookingStatus;
import org.rent.room.be.constant.QRType;
import org.rent.room.be.constant.ScheduleStatus;
import org.rent.room.be.dto.request.booking.BookingRequest;
import org.rent.room.be.dto.request.booking.SlotRequest;
import org.rent.room.be.dto.response.UserResponse;
import org.rent.room.be.dto.response.booking.BookingResponse;
import org.rent.room.be.entity.*;
import org.rent.room.be.repository.BookingRepository;
import org.rent.room.be.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.awt.print.Book;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class BookingServiceImpl implements BookingService {
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private UserService userService;
    @Autowired
    private RoomService roomService;
    @Autowired
    private BookingQRService bookingQRService;
    @Autowired
    private ScheduleService scheduleService;
    @Autowired
    private SlotService slotService;

    @Override
    public BookingResponse createBooking(BookingRequest bookingRequest) {

        User user = userService.findByUserId(bookingRequest.getUserId());
        if (user == null) {
            throw new RuntimeException("User not found to booking");
        }

        Room room = roomService.findById(bookingRequest.getRoomId());
        if (room == null) {
            throw new RuntimeException("Room not found to booking");
        }


        for (int i = 1; i <= bookingRequest.getSlotRequests().size(); i++) {
            SlotRequest slotRequest = bookingRequest.getSlotRequests().get(i);
            Slot slot = Slot.builder()
                    .startTime(slotRequest.getStartTime())
                    .endTime(slotRequest.getEndTime())
                    .room(room)
                    .build();
            slotService.createSlot(slot);
            scheduleService.createSchedule(slotRequest.getDate());


        }


        Booking booking = Booking.builder()

                .bookingStatus(BookingStatus.PENDING)
                .renter(user)
                .build();


        bookingRepository.save(booking);
        bookingQRService.createBookingQR(booking, QRType.CHECK_IN);
        bookingQRService.createBookingQR(booking, QRType.CHECK_OUT);

        return null;
    }

    @Override
    public BookingResponse updateBooking(BookingRequest bookingRequest) {
        return null;
    }

    @Override
    public BookingResponse getBookingById(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElse(null);

        UserResponse userResponse = UserResponse.builder()
                .userId(booking.getRenter().getUserId())
                .userName(booking.getRenter().getUserName())
                .email(booking.getRenter().getEmail())
                .build();

        return BookingResponse.builder()
                .bookingId(bookingId)
                .user(userResponse)
                .checkIn(booking.getCheckIn())
                .checkOut(booking.getCheckOut())
                .build();
    }

    @Override
    public PageResponse<BookingResponse> getAllBookings(int page, int size, String keyword, LocalDate from, LocalDate to) {
        return null;
    }
}
