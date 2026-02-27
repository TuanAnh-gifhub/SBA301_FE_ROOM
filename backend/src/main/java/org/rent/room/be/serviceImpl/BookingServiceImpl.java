package org.rent.room.be.serviceImpl;

import org.rent.room.be.base.PageResponse;
import org.rent.room.be.constant.*;

import org.rent.room.be.dto.request.booking.BookingRequest;
import org.rent.room.be.dto.request.booking.SlotRequest;
import org.rent.room.be.dto.response.UserResponse;
import org.rent.room.be.dto.response.booking.BookingIntentResponse;
import org.rent.room.be.dto.response.booking.BookingResponse;
import org.rent.room.be.dto.response.booking.IntentSlotResponse;
import org.rent.room.be.dto.response.qr.ScanQRResponse;
import org.rent.room.be.dto.response.room_copy.RoomCopyResponse;
import org.rent.room.be.dto.response.slot.SlotResponse;
import org.rent.room.be.entity.*;
import org.rent.room.be.entity.BookingIntent;
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
    private SlotRepository slotRepository;
    @Autowired
    private BookingQRRepository bookingQRRepository;

    @Autowired
    private BookingIntentRepository bookingIntentRepository;

    @Transactional
    public void releaseExpiredHolds() {

        List<RoomCopy> heldRooms =
                roomCopyRepository.findExpiredHeldRooms(LocalDateTime.now());

        for (RoomCopy rc : heldRooms) {
            rc.setRoomCopyStatus(RoomCopyStatus.AVAILABLE);
            rc.setHeldUntil(null);
        }
    }

    @Override
    public BookingIntentResponse getBookingIntentById(UUID postId) {
        BookingIntent bookingIntent = bookingIntentRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã đặt lịch dự định với id " + postId));
        List<IntentSlotResponse> intentSlotResponses =
                bookingIntent.getSlots().stream().map(intentSlot -> {

                    RoomCopy rc = intentSlot.getRoomCopy();
                    Room room = rc.getRoom();

                    return IntentSlotResponse.builder()
                            .intentSlotId(intentSlot.getIntentSlotId())
                            .startTime(intentSlot.getStartTime())
                            .endTime(intentSlot.getEndTime())
                            .roomCopyResponse(
                                    RoomCopyResponse.builder()
                                            .roomCopyId(rc.getRoomCopyId())
                                            .roomCode(rc.getRoomCode())
                                            .roomCopyStatus(rc.getRoomCopyStatus())

                                            .build()
                            )
                            .address(room.getRentalArea().getAddress())
                            .build();
                }).toList();


        return BookingIntentResponse.builder()
                .intentId(bookingIntent.getBookingIntentId())
                .previewPrice(bookingIntent.getPreviewPrice())
                .status(bookingIntent.getStatus())
                .expiresAt(bookingIntent.getExpiresAt())
                .slots(intentSlotResponses)
                .title(bookingIntent.getTitle())
                .note(bookingIntent.getNote())
                .userName(bookingIntent.getUser().getUserName())
                .userPhone(bookingIntent.getUser().getPhone())
                .bookingType(bookingIntent.getBookingType())
                .numberOfMonths(bookingIntent.getNumberOfMonths())
                .startTime(bookingIntent.getStartTime())
                .endTime(bookingIntent.getEndTime())
                .build();
    }

    @Override
    @Transactional
    public BookingIntentResponse createBookingIntent(
            BookingRequest bookingRequest
    ) {

        validateBookingTime(bookingRequest);

        User user = userRepository.findById(
                bookingRequest.getUserId()
        ).orElseThrow(() ->
                new RuntimeException("Không tìm thấy người dùng"));


        String title = switch (bookingRequest.getBookingType()) {
            case HOURLY -> "Đặt phòng theo giờ";
            case DAILY -> "Đặt phòng theo ngày";
            case MONTHLY -> "Đặt phòng theo tháng";
        };


        BookingIntent bookingIntent = BookingIntent.builder()
                .title(title)
                .note(bookingRequest.getNote())
                .user(user)
                .bookingType(bookingRequest.getBookingType())
                .status(BookingIntentStatus.HOLDING)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();

        BigDecimal totalPrice = BigDecimal.ZERO;
        List<IntentSlot> intentSlots = new ArrayList<>();


        for (SlotRequest slotReq : bookingRequest.getSlotRequests()) {

            Room room = roomRepository.findById(
                    slotReq.getRoomId()
            ).orElseThrow(() ->
                    new RuntimeException("Không tìm thấy phòng"));

            List<RoomCopy> holdableRooms =
                    roomCopyRepository.findHoldableRoomCopies(
                            slotReq.getRoomId(),
                            slotReq.getStartTime(),
                            slotReq.getEndTime(),
                            LocalDateTime.now()
                    );

            if (holdableRooms.size() < slotReq.getQuantity()) {
                throw new RuntimeException(
                        "Phòng " + room.getRoomName()
                                + " không đủ phòng trống, còn "
                                + holdableRooms.size()
                );
            }

            List<RoomCopy> selectedRooms =
                    holdableRooms.subList(0, slotReq.getQuantity());


            for (RoomCopy rc : selectedRooms) {
                rc.setRoomCopyStatus(RoomCopyStatus.HOLD);
                rc.setHeldUntil(LocalDateTime.now().plusMinutes(10));
                IntentSlot intentSlot = IntentSlot.builder()
                        .bookingIntent(bookingIntent)
                        .roomCopy(rc)
                        .startTime(slotReq.getStartTime())
                        .endTime(slotReq.getEndTime())
                        .build();
                intentSlots.add(intentSlot);
                totalPrice = totalPrice.add(room.getPrice());
            }
        }

        bookingIntent.setStartTime(bookingRequest.getSlotRequests().getFirst().getStartTime());
        bookingIntent.setEndTime(bookingRequest.getSlotRequests().getLast().getEndTime());
        bookingIntent.setSlots(intentSlots);
        bookingIntent.setPreviewPrice(totalPrice);


        bookingIntentRepository.save(bookingIntent);


        List<IntentSlotResponse> intentSlotResponses =
                intentSlots.stream().map(intentSlot -> {

                    RoomCopy rc = intentSlot.getRoomCopy();
                    Room room = rc.getRoom();

                    return IntentSlotResponse.builder()
                            .intentSlotId(intentSlot.getIntentSlotId())
                            .startTime(intentSlot.getStartTime())
                            .endTime(intentSlot.getEndTime())
                            .roomCopyResponse(
                                    RoomCopyResponse.builder()
                                            .roomCopyId(rc.getRoomCopyId())
                                            .roomCode(rc.getRoomCode())
                                            .roomCopyStatus(rc.getRoomCopyStatus())

                                            .build()
                            )
                            .address(room.getRentalArea().getAddress())
                            .build();
                }).toList();

        return BookingIntentResponse.builder()
                .intentId(bookingIntent.getBookingIntentId())
                .previewPrice(totalPrice)
                .status(bookingIntent.getStatus())
                .expiresAt(bookingIntent.getExpiresAt())
                .slots(intentSlotResponses)
                .title(bookingIntent.getTitle())
                .note(bookingIntent.getNote())
                .userName(bookingIntent.getUser().getUserName())
                .userPhone(bookingIntent.getUser().getPhone())
                .bookingType(bookingIntent.getBookingType())
                .numberOfMonths(bookingIntent.getNumberOfMonths())
                .startTime(bookingIntent.getStartTime())
                .endTime(bookingIntent.getEndTime())
                .build();
    }

    @Transactional
    public BookingResponse createBooking(UUID bookingIntentId) {
        BookingIntent bookingIntent = bookingIntentRepository.findById(bookingIntentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã đặt lịch dự định với id " + bookingIntentId));

        if (bookingIntent.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Thông tin đặt lịch  đã hết hạn trong thời gian giữ,vui lòng đặt lại");
        }

        Booking booking = Booking.builder()
                .bookingTitle(bookingIntent.getTitle())
                .bookingStatus(BookingStatus.BOOKED)
                .bookingType(bookingIntent.getBookingType())
                .renter(bookingIntent.getUser())
                .totalPrice(bookingIntent.getPreviewPrice())
                .startTime(bookingIntent.getSlots().getFirst().getStartTime())
                .endTime(bookingIntent.getSlots().getFirst().getEndTime())
                .createdAt(LocalDateTime.now())
                .build();


        List<SlotResponse> slotResponses = null;
        for (IntentSlot intentSlot : bookingIntent.getSlots()) {
            RoomCopy rc = intentSlot.getRoomCopy();

            rc.setRoomCopyStatus(RoomCopyStatus.BOOKED);
            rc.setHeldUntil(null);
            roomCopyRepository.save(rc);

            Slot slot = Slot.builder()
                    .booking(booking)
                    .roomCopy(rc)
                    .startTime(intentSlot.getStartTime())
                    .endTime(intentSlot.getEndTime())
                    .slotStatus(SlotStatus.BOOKED)
                    .build();

            slotRepository.save(slot);

            slotResponses = booking.getSlots().stream().map(s -> {
                RoomCopy roomCopy = s.getRoomCopy();
                Room room = roomCopy.getRoom();
                RoomCopyResponse roomCopyResponse = RoomCopyResponse.builder()
                        .roomCopyId(roomCopy.getRoomCopyId())
                        .roomCode(roomCopy.getRoomCode())
                        .build();

                return SlotResponse.builder()
                        .slotId(s.getSlotId())
                        .startTime(s.getStartTime())
                        .endTime(s.getEndTime())
                        .roomCopy(roomCopyResponse)
                        .address(room.getRentalArea().getAddress())
                        .build();
            }).toList();


        }

        bookingQRService.createBookingQR(booking, QRType.CHECK_IN);
        bookingQRService.createBookingQR(booking, QRType.CHECK_OUT);
        bookingRepository.save(booking);


        return BookingResponse.builder()
                .bookingId(booking.getBookingId())
                .userName(booking.getRenter().getUserName())
                .phoneNumber(booking.getRenter().getPhone() != null ? booking.getRenter().getPhone() : "")
                .bookingType(booking.getBookingType())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .status(BookingStatus.BOOKED)
//                .numberOfMonths(Math.max(request.getNumberOfMonths(), 0))
                .note(booking.getNote())
                .totalPrice(booking.getTotalPrice())
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
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() ->
                new RuntimeException("Không tìm thấy booking với id " + bookingId));


        List<SlotResponse> slotResponses = booking.getSlots().stream().map(slot -> {

            RoomCopy rc = slot.getRoomCopy();
            RoomCopyResponse roomCopyResponse = RoomCopyResponse.builder()
                    .roomCopyId(rc.getRoomCopyId())
                    .roomCode(rc.getRoomCode())
                    .roomCopyStatus(rc.getRoomCopyStatus())
                    .build();


            return SlotResponse.builder()
                    .slotId(slot.getSlotId())
                    .startTime(slot.getStartTime())
                    .endTime(slot.getEndTime())
                    .address(slot.getRoomCopy().getRoom().getRentalArea().getAddress())
                    .roomCopy(roomCopyResponse)
                    .build();
        }).toList();

        return BookingResponse.builder()
                .bookingId(bookingId)
                .userName(booking.getRenter().getUserName())
                .phoneNumber(booking.getRenter().getPhone() != null ? booking.getRenter().getPhone() : "")
                .slots(slotResponses)
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .totalPrice(booking.getTotalPrice())
                .bookingType(booking.getBookingType())
                .createdAt(booking.getCreatedAt())
                .checkIn(booking.getCheckIn())
                .checkOut(booking.getCheckOut())
                .build();
    }

    @Override
    public PageResponse<BookingResponse> getAllBookings(
            BookingStatus bookingStatus,
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
                        .map(booking -> {

                            List<SlotResponse> slotResponses = booking.getSlots().stream()
                                    .map(slot -> {
                                        RoomCopy roomCopy = slot.getRoomCopy();
                                        Room room = roomCopy.getRoom();
                                        RoomCopyResponse roomCopyResponse = RoomCopyResponse.builder()
                                                .roomCopyId(roomCopy.getRoomCopyId())
                                                .roomCode(roomCopy.getRoomCode())
                                                .build();

                                        return SlotResponse.builder()
                                                .slotId(slot.getSlotId())
                                                .startTime(slot.getStartTime())
                                                .endTime(slot.getEndTime())
                                                .roomCopy(roomCopyResponse)
                                                .status(slot.getSlotStatus())
                                                .address(room.getRentalArea().getAddress())
                                                .build();
                                    })
                                    .toList();


                            return BookingResponse.builder()
                                    .bookingId(booking.getBookingId())
                                    .userName(booking.getRenter().getUserName())
                                    .phoneNumber(booking.getRenter().getPhone())
                                    .startTime(booking.getStartTime())
                                    .endTime(booking.getEndTime())
                                    .totalPrice(booking.getTotalPrice())
                                    .note(booking.getNote())
                                    .createdAt(booking.getCreatedAt())
                                    .status(booking.getBookingStatus())
                                    .bookingType(booking.getBookingType())
                                    .statusPayment("")
                                    .slots(slotResponses)
                                    .build();
                        })
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

        if (qr.getUsedAt() != null) {
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
        if (qr.getQrType() == QRType.CHECK_OUT) {
            booking.setCheckOut(LocalDateTime.now());
            booking.setBookingStatus(BookingStatus.COMPLETED);

        }
        qr.setUsedAt(LocalDateTime.now());

        bookingRepository.save(booking);
        bookingQRRepository.save(qr);
        return ScanQRResponse.builder()
                .success(true)
                .message("Quét mã " + qr.getQrType() + " thành công")
                .status(booking.getBookingStatus())
                .build();
    }


}
