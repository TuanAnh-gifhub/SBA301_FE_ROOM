package org.rent.room.be.serviceImpl;

import org.rent.room.be.base.PageResponse;
import org.rent.room.be.constant.BookingStatus;
import org.rent.room.be.constant.BookingType;
import org.rent.room.be.constant.QRType;

import org.rent.room.be.constant.SlotStatus;
import org.rent.room.be.dto.request.booking.BookingRequest;
import org.rent.room.be.dto.request.booking.SlotRequest;
import org.rent.room.be.dto.response.UserResponse;
import org.rent.room.be.dto.response.booking.BookingResponse;
import org.rent.room.be.dto.response.qr.ScanQRResponse;
import org.rent.room.be.dto.response.room_copy.RoomCopyResponse;
import org.rent.room.be.dto.response.slot.SlotResponse;
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
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
    @Autowired
    private BookingQRService bookingQRService;

    @Autowired
    private BookingQRRepository bookingQRRepository;

    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        User user = userRepository.findById(request.getUserId()).orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        validateBookingTime(request);

        Booking booking = Booking.builder()
                .bookingTitle("Đặt phòng theo " + request.getBookingType())
                .bookingStatus(BookingStatus.PENDING)
                .bookingType(request.getBookingType())
                .renter(user)
                .startTime(request.getSlotRequests().getFirst().getStartTime())
                .endTime(request.getSlotRequests().getLast().getEndTime())
                .createdAt(LocalDateTime.now())
                .build();


        System.err.println("Bắt đầu tạo slot");
        List<SlotResponse> slotResponses = null;
        for (SlotRequest slotReq : request.getSlotRequests()) {
            Room room = roomRepository.findById(slotReq.getRoomId()).orElseThrow(() -> new RuntimeException("Không tìm thấy phòng với id " + slotReq.getRoomId()));

            List<RoomCopy> availableRooms =
                    roomCopyRepository.findAvailableRoomCopies(
                            slotReq.getRoomId(),
                            slotReq.getStartTime(),
                            slotReq.getEndTime()
                    );



            if (availableRooms.size() < slotReq.getQuantity()) {
                throw new RuntimeException("Phòng " + room.getRoomName() + " không đủ phòng trống cho thuê ,còn " + availableRooms.size() + "phòng");

            }


            List<RoomCopy> selectedRooms =
                    availableRooms.subList(0, slotReq.getQuantity());
            slotResponses = new ArrayList<>();

            for (RoomCopy rc : selectedRooms) {
                Slot slot = Slot.builder()
                        .booking(booking)
                        .roomCopy(rc)
                        .startTime(slotReq.getStartTime())
                        .endTime(slotReq.getEndTime())
                        .availabilityStatus(SlotStatus.BOOKED)
                        .build();

                if (booking.getSlots() == null) {
                    booking.setSlots(new ArrayList<>());
                }

                booking.getSlots().add(slot);

                RoomCopyResponse roomCopyResponse = RoomCopyResponse.builder()
                        .roomCopyId(rc.getRoomCopyId())
                        .roomCode(rc.getRoomCode())
                        .build();

                SlotResponse slotResponse = SlotResponse.builder()
                        .slotId(slot.getSlotId())
                        .startTime(slotReq.getStartTime())
                        .endTime(slotReq.getEndTime())
                        .roomCopy(roomCopyResponse)
                        .address(room.getRentalArea().getAddress())
                        .build();

                slotResponses.add(slotResponse);
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
        bookingQRService.createBookingQR(booking, QRType.CHECK_IN);
        bookingQRService.createBookingQR(booking, QRType.CHECK_OUT);

        bookingRepository.save(booking);


        return BookingResponse.builder()
                .bookingId(booking.getBookingId())
                .userName(user.getUserName())
                .startTime(request.getSlotRequests().getFirst().getStartTime())
                .endTime(request.getSlotRequests().getLast().getEndTime())
                .status(BookingStatus.BOOKED)
                .numberOfMonths(Math.max(request.getNumberOfMonths(), 0))
                .note(request.getNote())
                .totalPrice(totalPrice)
                .statusPayment("")
                .slots(slotResponses)
                .createdAt(booking.getCreatedAt())
                .build();
    }

    private void validateBookingTime(BookingRequest request) {
        LocalDateTime now = LocalDateTime.now();

        if (request.getBookingType() == BookingType.DAILY || request.getBookingType() == BookingType.HOURLY) {

            LocalDateTime start = request.getSlotRequests().getFirst().getStartTime();
            LocalDateTime end = request.getSlotRequests().getLast().getEndTime();

            if (start.isBefore(now)) {
                throw new RuntimeException("Không thể đặt phòng trong quá khứ");
            }
            Duration duration = Duration.between(start, end);
            long minutes = duration.toMinutes();

            if (minutes < 60) {
                throw new RuntimeException("Booking ngắn hạn tối thiểu 1 giờ");
            }

            if (minutes > 24 * 60) {
                throw new RuntimeException("Vui lòng đặt dài hạn cho booking trên 1 ngày");
            }

            if (start.isAfter(now.plusDays(30))) {
                throw new RuntimeException("Không được đặt phòng trước quá 30 ngày");
            }
        }

        if (request.getBookingType() == BookingType.MONTHLY) {
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
                                .status(booking.getBookingStatus())
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

    @Override
    public ScanQRResponse scan(String token) {
        BookingQR qr = bookingQRRepository.findByQrToken(token)
                .orElseThrow(() -> new RuntimeException("QR không hợp lệ"));

        if (qr.getUsedAt() != null){
            return ScanQRResponse.builder()
                    .success(false)
                    .message("QR đã được sử dụng ")
                    .usedAt(qr.getUsedAt())
                    .build();
        }



        Booking booking = bookingRepository.findById(qr.getBooking().getBookingId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã booking ko scan dc"));


        if (qr.getQrType() == QRType.CHECK_IN) {
            booking.setCheckIn(LocalDateTime.now());
            booking.setBookingStatus(BookingStatus.CHECKED_IN);

        }
        if(qr.getQrType() == QRType.CHECK_OUT){
            booking.setCheckOut(LocalDateTime.now());
            booking.setBookingStatus(BookingStatus.COMPLETED);

        }
        qr.setUsedAt(LocalDateTime.now());

        bookingRepository.save(booking);
        bookingQRRepository.save(qr);
        return ScanQRResponse.builder()
                .success(true)
                .message("Quét mã "+ qr.getQrType()+" thành công")
                .status(booking.getBookingStatus())
                .build();
    }


}
