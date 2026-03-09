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
import org.rent.room.be.dto.response.rental_area.RentalAreaResponse;
import org.rent.room.be.dto.response.room.RoomImageResponse;
import org.rent.room.be.dto.response.room.RoomResponse;
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
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

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

    @Autowired
    private RentalAreaRepository rentalAreaRepository;

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
    public BookingIntentResponse getBookingIntentById(UUID bookingIntentId) {


        BookingIntent bookingIntent = bookingIntentRepository.findById(bookingIntentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã đặt lịch dự định với id " + bookingIntentId));
        List<IntentSlotResponse> intentSlotResponses =
                bookingIntent.getSlots().stream().map(intentSlot -> {


                    Room room = intentSlot.getRoom();
                    Set<RoomResponse.AmenityItem> amenities = room.getAmenities().stream()
                            .map(amenity ->RoomResponse.AmenityItem.builder()
                                    .amenityId(amenity.getAmenityId())
                                    .amenityName(amenity.getAmenityName())
                                    .icon(amenity.getIconKey())
                                    .build()
                            ).collect(Collectors.toSet());

                    List<RoomImageResponse> images = room.getImages().stream().map(image ->RoomImageResponse.builder()
                            .roomImageId(image.getRoomImageId())
                            .imageUrl(image.getImageUrl())
                            .build() ).toList();
                    RoomResponse roomResponse = RoomResponse.builder()
                            .roomId(room.getRoomId())
                            .roomName(room.getRoomName())
                            .amenities(amenities)
                            .price(room.getPrice())
                            .capacity(room.getCapacity())
                            .categoryId(room.getCategory().getCategoryId())
                            .categoryName(room.getCategory().getCategoryName())
                            .images(images)
                            .build();
                    return IntentSlotResponse.builder()
                            .intentSlotId(intentSlot.getIntentSlotId())
                            .startTime(intentSlot.getStartTime())
                            .endTime(intentSlot.getEndTime())
                            .room(roomResponse)
                            .quantity(intentSlot.getQuantity())
                            .address(room.getRentalArea().getAddress())
                            .build();
                }).toList();

        BigDecimal tax  = BigDecimal.ZERO;
        //hàm tính tax
        BigDecimal discount  = BigDecimal.ZERO;
      //hàm tính giảm giá
      BigDecimal totalPrice = bookingIntent.getPreviewPrice().add(tax).subtract(discount);
        return BookingIntentResponse.builder()
                .bookingIntentId(bookingIntent.getBookingIntentId())
                .tax(tax)
                .discount(discount)
                .previewPrice(bookingIntent.getPreviewPrice())
                .totalAmount(totalPrice)
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
                .status(BookingIntentStatus.ACTIVE)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();

        BigDecimal totalPrice = BigDecimal.ZERO;
        List<IntentSlot> intentSlots = new ArrayList<>();
        RentalArea rentalArea = null;

        for (SlotRequest slotReq : bookingRequest.getSlotRequests()) {

            Room room = roomRepository.findById(
                    slotReq.getRoomId()
            ).orElseThrow(() ->
                    new RuntimeException("Không tìm thấy phòng"));
            if (rentalArea == null) {
                rentalArea = room.getRentalArea();
            }
            else if (!rentalArea.getRentalAreaId()
                    .equals(room.getRentalArea().getRentalAreaId())) {

                throw new RuntimeException(
                        "Tất cả phòng phải thuộc cùng một khu vực"
                );
            }


            List<RoomCopy> availableRooms =
                    roomCopyRepository.findAvailableRoomCopies(
                            slotReq.getRoomId(),
                            slotReq.getStartTime(),
                            slotReq.getEndTime()
                    );

            if (availableRooms.size() < slotReq.getQuantity()) {
                throw new RuntimeException(
                        "Phòng " + room.getRoomName()
                                + " chỉ còn "
                                + availableRooms.size()
                );
            }

            IntentSlot intentSlot = IntentSlot.builder()
                    .bookingIntent(bookingIntent)
                    .room(room)
                    .quantity(slotReq.getQuantity())
                    .startTime(slotReq.getStartTime())
                    .endTime(slotReq.getEndTime())
                    .build();

            intentSlots.add(intentSlot);

            totalPrice = totalPrice.add(
                    room.getPrice()
                            .multiply(BigDecimal.valueOf(slotReq.getQuantity()))
            );
        }

        RentalAreaResponse rentalAreaResponse = RentalAreaResponse.builder()
                .rentalAreaName(rentalArea.getRentalAreaName())
                .address(rentalArea.getAddress())
                .cityName(rentalArea.getCity().getCityName())
                .contactPhone(rentalArea.getContactPhone())
                .build();


       bookingIntent.setRentalArea(rentalArea);
        bookingIntent.setStartTime(bookingRequest.getSlotRequests().getFirst().getStartTime());
        bookingIntent.setEndTime(bookingRequest.getSlotRequests().getLast().getEndTime());
        bookingIntent.setSlots(intentSlots);
        bookingIntent.setPreviewPrice(totalPrice);


        bookingIntentRepository.save(bookingIntent);


        List<IntentSlotResponse> intentSlotResponses =
                intentSlots.stream().map(intentSlot -> {

                    Room room = intentSlot.getRoom();

                    RoomResponse roomResponse = RoomResponse.builder()
                            .roomId(room.getRoomId())
                            .roomName(room.getRoomName())
                            .build();
                    return IntentSlotResponse.builder()
                            .intentSlotId(intentSlot.getIntentSlotId())
                            .startTime(intentSlot.getStartTime())
                            .endTime(intentSlot.getEndTime())
                            .room(roomResponse)
                            .quantity(intentSlot.getQuantity())
                            .address(room.getRentalArea().getAddress())
                            .build();
                }).toList();



        return BookingIntentResponse.builder()
                .bookingIntentId(bookingIntent.getBookingIntentId())
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
                .rentalAreaResponse(rentalAreaResponse)
                .build();
    }
    @Override
    @Transactional
    public BookingIntentResponse updateBookingIntent(
            UUID bookingIntentId,
            BookingRequest bookingRequest
    ) {

     return  null;
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
                .disputeFlag(false)
                .createdAt(LocalDateTime.now())
                .rentalArea(bookingIntent.getRentalArea())
                .build();

        bookingRepository.save(booking);
        List<SlotResponse> slotResponses = null;
        for (IntentSlot intentSlot : bookingIntent.getSlots()) {

            List<RoomCopy> availableRooms =
                    roomCopyRepository.findAvailableRoomCopiesForUpdate(
                            intentSlot.getRoom().getRoomId(),
                            intentSlot.getStartTime(),
                            intentSlot.getEndTime()
                    );
            if (availableRooms.size() < intentSlot.getQuantity()) {
                throw new RuntimeException(
                        "Phòng đã được đặt. Chỉ còn "
                                + availableRooms.size()
                );
            }

            List<RoomCopy> selected =
                    availableRooms.subList(0, intentSlot.getQuantity());

            for (RoomCopy rc : selected) {

                Slot slot = Slot.builder()
                        .booking(booking)
                        .roomCopy(rc)
                        .startTime(intentSlot.getStartTime())
                        .endTime(intentSlot.getEndTime())
                        .slotStatus(SlotStatus.BOOKED)
                        .build();

                SlotResponse slotResponse = SlotResponse.builder()
                        .slotId(slot.getSlotId())
                        .startTime(slot.getStartTime())
                        .endTime(slot.getEndTime())
                        .roomCopy(RoomCopyResponse.builder()
                                .roomCopyId(rc.getRoomCopyId())
                                .roomCode(rc.getRoomCode())
                                .build())
                        .status(slot.getSlotStatus())
                        .build();

                slotRepository.save(slot);
                if(slotResponses == null) {
                    slotResponses = new ArrayList<>();
                }
                slotResponses.add(slotResponse);
            }
        }



        bookingQRService.createBookingQR(booking, QRType.CHECK_IN);
        bookingQRService.createBookingQR(booking, QRType.CHECK_OUT);


        RentalAreaResponse rentalAreaResponse = RentalAreaResponse.builder()
                .rentalAreaName(bookingIntent.getRentalArea().getRentalAreaName())
                .address(bookingIntent.getRentalArea().getAddress())
                .cityName(bookingIntent.getRentalArea().getCity().getCityName())
                .contactPhone(bookingIntent.getRentalArea().getContactPhone())
                .build();

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
                .rentalArea(rentalAreaResponse)
                .qrCodeUrl(null)
                .invoicePdfUrl(null)
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
                    .roomCopy(roomCopyResponse)
                    .build();
        }).toList();
        RentalAreaResponse rentalAreaResponse = RentalAreaResponse.builder()
                .rentalAreaName(booking.getRentalArea().getRentalAreaName())
                .address(booking.getRentalArea().getAddress())
                .cityName(booking.getRentalArea().getCity().getCityName())
                .contactPhone(booking.getRentalArea().getContactPhone())
                .build();

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
                .rentalArea(rentalAreaResponse)
                .qrCodeUrl(null)
                .invoicePdfUrl(null)
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
