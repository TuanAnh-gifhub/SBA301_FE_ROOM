package org.rent.room.be.serviceImpl;

import org.rent.room.be.base.PageResponse;
import org.rent.room.be.constant.BookingStatus;
import org.rent.room.be.constant.BookingType;
import org.rent.room.be.constant.QRType;

import org.rent.room.be.dto.request.booking.BookingRequest;
import org.rent.room.be.dto.request.booking.SlotRequest;
import org.rent.room.be.dto.response.UserResponse;
import org.rent.room.be.dto.response.booking.BookingResponse;
import org.rent.room.be.entity.*;
import org.rent.room.be.repository.*;
import org.rent.room.be.service.*;
import org.rent.room.be.specification.BookingSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class BookingServiceImpl implements BookingService {
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoomCopyRepository roomCopyRepository;
    @Autowired
    private RoomRepository roomRepository;

    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        User user = userRepository.findById(request.getUserId()).orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        validateBookingTime(request);

        Booking booking = Booking.builder()
                .bookingTitle("Đặt phòng theo " + (request.getBookingType().equals(BookingType.SHORT_TERM) ? "ngắn hạn" : "dài hạn"))
                .bookingStatus(BookingStatus.PENDING)
                .bookingType(request.getBookingType())
                .renter(user)
                .startTime(request.getSlotRequests().getFirst().getStartTime())
                .endTime(request.getSlotRequests().getLast().getEndTime())
                .build();


        System.err.println("Bắt đầu tạo slot");
        for (SlotRequest slotReq : request.getSlotRequests()) {
            List<RoomCopy> availableRooms =
                    roomCopyRepository.findAvailableRoomCopies(
                            slotReq.getRoomId(),
                            slotReq.getStartTime(),
                            slotReq.getEndTime()
                    );

            if (availableRooms.size() < slotReq.getQuantity()) {
                throw new RuntimeException("không đủ phòng trống cho thuê ,còn " + availableRooms.size() + "phòng");
            }


            List<RoomCopy> selectedRooms =
                    availableRooms.subList(0, slotReq.getQuantity());

            for (RoomCopy rc : selectedRooms) {
                Slot slot = Slot.builder()
                        .booking(booking)
                        .roomCopy(rc)
                        .startTime(slotReq.getStartTime())
                        .endTime(slotReq.getEndTime())
                        .status("BOOKED")
                        .build();

                if (booking.getSlots() == null) {
                    booking.setSlots(new ArrayList<>());
                }
                booking.getSlots().add(slot);
            }


        }
        BigDecimal totalPrice = BigDecimal.ZERO;

        for (SlotRequest sr : request.getSlotRequests()) {
            Room room = roomRepository.findById(sr.getRoomId()).orElse(null);
            BigDecimal slotPrice = room.getPrice()
                    .multiply(BigDecimal.valueOf(sr.getQuantity()));

            totalPrice = totalPrice.add(slotPrice);
        }

        booking.setTotalPrice(totalPrice);
        System.err.println("Tạo thành công slot và booking");
        bookingRepository.save(booking);
        return BookingResponse.builder().build();
    }

    private void validateBookingTime(BookingRequest request) {
        LocalDateTime now = LocalDateTime.now();

        if (request.getBookingType() == BookingType.SHORT_TERM) {

            LocalDateTime start = request.getSlotRequests().getFirst().getStartTime();
            LocalDateTime end = request.getSlotRequests().getLast().getEndTime();

            if (start.isBefore(now)) {
                throw new RuntimeException("Không thể đặt phòng trong quá khứ");
            }

            long hours = ChronoUnit.HOURS.between(start, end);

            if (hours < 1) {
                throw new RuntimeException("Booking ngắn hạn tối thiểu 1 giờ");
            }

            if (hours > 8) {
                throw new RuntimeException("Booking ngắn hạn tối đa 8 giờ");
            }

            if (start.isAfter(now.plusDays(30))) {
                throw new RuntimeException("Không được đặt phòng trước quá 30 ngày");
            }
        }

        if (request.getBookingType() == BookingType.LONG_TERM) {
            if (request.getNumberOfMonths() <= 0) {
                throw new RuntimeException("Số tháng thuê không hợp lệ");
            }
        }
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
//                .user(userResponse)
//                .checkIn(booking.getCheckIn())
//                .checkOut(booking.getCheckOut())
                .build();
    }

    @Override
    public PageResponse<BookingResponse> getAllBookings(
            String bookingStatus,
            String keyword,
            LocalDate from,
            LocalDate to,
            int page,
            int size
    ) {

        Pageable pageable =
                PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<Booking> spec =
                BookingSpecification.filter(bookingStatus, keyword, from, to);

        Page<Booking> bookingPage =
                bookingRepository.findAll(spec, pageable);

        List<BookingResponse> responses =
                bookingPage.getContent().stream()
                        .map(booking -> BookingResponse.builder()
                                .bookingId(booking.getBookingId())
                                .status(booking.getBookingStatus().name())
                                .build()
                        )
                        .toList();

        return PageResponse.<BookingResponse>builder()
                .currentPage(bookingPage.getNumber() + 1)
                .totalPages(bookingPage.getTotalPages())
                .pageSize(bookingPage.getSize())
                .totalElements(bookingPage.getTotalElements())
                .data(responses)
                .build();
    }


}
