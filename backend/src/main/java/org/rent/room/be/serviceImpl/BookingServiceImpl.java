package org.rent.room.be.serviceImpl;

import org.rent.room.be.base.PageResponse;
import org.rent.room.be.constant.*;

import org.rent.room.be.dto.request.booking.BookingRequest;
import org.rent.room.be.dto.request.booking.SlotRequest;
import org.rent.room.be.dto.response.booking.BookingIntentResponse;
import org.rent.room.be.dto.response.booking.BookingResponse;
import org.rent.room.be.dto.response.booking.IntentSlotResponse;
import org.rent.room.be.dto.request.booking.UpdateBookingRequest;

import org.rent.room.be.dto.response.booking.*;

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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
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

    @Autowired
    private InvoicePdfService invoicePdfService;



    @Override
    public BookingIntentResponse getBookingIntentById(UUID bookingIntentId) {


        BookingIntent bookingIntent = bookingIntentRepository.findById(bookingIntentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã đặt lịch dự định với id " + bookingIntentId));
        List<IntentSlotResponse> intentSlotResponses =
                bookingIntent.getSlots().stream().map(intentSlot -> {


                    Room room = intentSlot.getRoom();
                    Set<RoomResponse.AmenityItem> amenities = room.getAmenities().stream()
                            .map(amenity -> RoomResponse.AmenityItem.builder()
                                    .amenityId(amenity.getAmenityId())
                                    .amenityName(amenity.getAmenityName())
                                    .iconKey(amenity.getIconKey())
                                    .build()
                            ).collect(Collectors.toSet());

                    List<RoomImageResponse> images = room.getImages().stream().map(image -> RoomImageResponse.builder()
                            .roomImageId(image.getRoomImageId())
                            .imageUrl(image.getImageUrl())
                            .build()).toList();
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

        BigDecimal tax = BigDecimal.ZERO;
        //hàm tính tax
        BigDecimal discount = BigDecimal.ZERO;
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


        User user = userRepository.findById(
                bookingRequest.getUserId()
        ).orElse(null);


        String title = switch (bookingRequest.getBookingType()) {
            case HOURLY -> "Đặt phòng theo giờ";
            case DAILY -> "Đặt phòng theo ngày";
            case MONTHLY -> "Đặt phòng theo tháng";
        };


        if (user.getPhone() == null || user.getPhone().isEmpty()) {
            throw new RuntimeException("Vui lòng cập nhật số điện thoại trước khi đặt phòng");
        }

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
            } else if (!rentalArea.getRentalAreaId()
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
                        room.getRoomName()
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
            long minutes = Duration.between(slotReq.getStartTime(), slotReq.getEndTime()).toMinutes();
            BigDecimal hours = BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
            BigDecimal slotPrice = room.getPrice()
                    .multiply(BigDecimal.valueOf(slotReq.getQuantity()))
                    .multiply(hours);

            totalPrice = totalPrice.add(slotPrice);
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



    @Transactional
    public BookingResponse createBooking(UUID bookingIntentId, Payment payment) throws IOException {
        BookingIntent bookingIntent = bookingIntentRepository.findById(bookingIntentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã đặt lịch dự định với id " + bookingIntentId));

        if (bookingIntent.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Thông tin đặt lịch  đã hết hạn trong thời gian giữ,vui lòng đặt lại");
        }

//        if(bookingIntent.getUser().getPhone() == null){
//            User user = bookingIntent.getUser();
//            user.setPhone(phone);
//            userRepository.save(user);
//        }

        Booking booking = Booking.builder()
                .bookingTitle(bookingIntent.getTitle())
                .bookingStatus(BookingStatus.BOOKED)
                .bookingType(bookingIntent.getBookingType())
                .renter(bookingIntent.getUser())
                .totalPrice(bookingIntent.getPreviewPrice())
                .startTime(bookingIntent.getSlots().getFirst().getStartTime())
                .endTime(bookingIntent.getSlots().getLast().getEndTime())
                .createdAt(LocalDateTime.now())
                .rentalArea(bookingIntent.getRentalArea())
                .note(bookingIntent.getNote() != null ?  bookingIntent.getNote():"")
                .build();

        bookingRepository.save(booking);
        List<SlotResponse> slotResponses = new ArrayList<>();
        ;
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


                slotRepository.save(slot);
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

                slotResponses.add(slotResponse);
            }
        }


        bookingQRService.createBookingQR(booking, QRType.CHECK_IN, booking.getStartTime());
        bookingQRService.createBookingQR(booking, QRType.CHECK_OUT, booking.getEndTime());

        String urlPdfInvoice = invoicePdfService.generateInvoice(booking, slotResponses, payment);
        booking.setInvoiceUrl(urlPdfInvoice);
        bookingRepository.save(booking);
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
                .note(booking.getNote())
                .totalPrice(booking.getTotalPrice())
                .statusPayment("")
                .slots(slotResponses)
                .createdAt(booking.getCreatedAt())
                .rentalArea(rentalAreaResponse)
                .qrCodeUrl(null)
                .invoicePdfUrl(urlPdfInvoice)
                .build();
    }


    @Override
    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    public BookingResponse updateBooking(UUID bookingId, UpdateBookingRequest bookingRequest) {

        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() ->
                new RuntimeException("Không tìm thấy booking với id " + bookingId));

        booking.setBookingStatus(bookingRequest.getBookingStatus());
        booking.setNote(bookingRequest.getNote());

        bookingRepository.save(booking);
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
                .phoneNumber(booking.getRenter().getPhone())
                .bookingType(booking.getBookingType())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .status(booking.getBookingStatus())
                .note(booking.getNote())
                .totalPrice(booking.getTotalPrice())
                .statusPayment("")
                .slots(slotResponses)
                .createdAt(booking.getCreatedAt())
                .rentalArea(rentalAreaResponse)
                .qrCodeUrl(null)
                .invoicePdfUrl(booking.getInvoiceUrl())
                .build();


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
                .status(booking.getBookingStatus())
                .note(booking.getNote())
                .totalPrice(booking.getTotalPrice())
                .statusPayment("")
                .slots(slotResponses)
                .createdAt(booking.getCreatedAt())
                .rentalArea(rentalAreaResponse)
                .qrCodeUrl(null)
                .invoicePdfUrl(booking.getInvoiceUrl())
                .build();
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN')")
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
    public PageResponse<BookingResponse> getMyBookings(UUID userId, BookingStatus bookingStatus, String keyword, LocalDate from, LocalDate to, int page, int size) {
       User user  = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("user not found"));


        Pageable pageable =
                PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<Booking> spec =
                BookingSpecification.filterBookingsByUserId(
                        userId,
                        bookingStatus,
                        keyword,
                        from,
                        to
                );

        Page<Booking> bookingPage = bookingRepository.findAll(spec,pageable);

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
                                    .invoicePdfUrl(booking.getInvoiceUrl())
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
    public BookingResponse cancelBooking(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() ->
                new RuntimeException("Không tìm thấy booking với id " + bookingId));

        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking đã được hủy trước đó");
        }

        booking.setBookingStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
        List<SlotResponse> slotResponse = booking.getSlots().stream().map(slot -> {
            RoomCopy roomCopy = slot.getRoomCopy();
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
        }).toList();

        BookingResponse bookingResponse = BookingResponse.builder()
                .bookingId(booking.getBookingId())
                .userName(booking.getRenter().getUserName())
                .phoneNumber(booking.getRenter().getPhone() != null ? booking.getRenter().getPhone() : "")
                .bookingType(booking.getBookingType())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .status(booking.getBookingStatus())
                .slots(slotResponse)
                .build();

        return bookingResponse;
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    public BookingSummaryResponse getBookingSummary(LocalDateTime from, LocalDateTime to, UUID userId) {

        userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        List<RentalArea> rentalAreas = rentalAreaRepository.findByOwnerId(userId);

        BigDecimal totalRevenue;
        long totalBookings;
        long totalCompleted;
        long totalCanceled;

        // OWNER có rental area
        if (rentalAreas != null && !rentalAreas.isEmpty()) {

            List<UUID> rentalAreaIds = rentalAreas.stream()
                    .map(RentalArea::getRentalAreaId)
                    .toList();

            totalRevenue = bookingRepository.sumRevenueByRentalAreas(from, to, rentalAreaIds);
            totalBookings = bookingRepository.countByRentalAreasAndCreatedAtBetween(rentalAreaIds, from, to);
            totalCompleted = bookingRepository.countByRentalAreasAndStatus(rentalAreaIds, BookingStatus.COMPLETED, from, to);
            totalCanceled = bookingRepository.countByRentalAreasAndStatus(rentalAreaIds, BookingStatus.CANCELLED, from, to);

        } else {

            // ADMIN xem toàn hệ thống
            totalRevenue = bookingRepository.sumRevenue(from, to);
            totalBookings = bookingRepository.countByCreatedAtBetween(from, to);
            totalCompleted = bookingRepository.countByStatusAndCreatedAtBetween(BookingStatus.COMPLETED, from, to);
            totalCanceled = bookingRepository.countByStatusAndCreatedAtBetween(BookingStatus.CANCELLED, from, to);
        }

        return BookingSummaryResponse.builder()
                .totalRevenue(totalRevenue)
                .totalBookings(totalBookings)
                .completedBookings(totalCompleted)
                .cancelledBookings(totalCanceled)
                .build();
    }

    @Override
    public BookingDashboardResponse revenue(Integer month, Integer year) {

        LocalDate today = LocalDate.now();

        if (year == null) {
            year = today.getYear();
        }

        if (month == null) {
            month = today.getMonthValue();
        }


        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.atTime(23,59,59);

        BigDecimal revenueToday = bookingRepository.revenueToday(start, end);

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        List<Object[]> last7 = bookingRepository.revenueLast7Days(sevenDaysAgo);

        List<Object[]> monthData = bookingRepository.revenueByMonth(year);
        List<Object[]> dayData = bookingRepository.revenueByDay(year, month);

        return BookingDashboardResponse.builder()
                .revenueToday(revenueToday)
                .revenueLast7Days(mapRevenue(last7))
                .revenueByMonth(mapRevenue(monthData))
                .revenueByDay(mapRevenue(dayData))
                .build();
    }
    private List<BookingRevenueItem> mapRevenue(List<Object[]> data) {

        return data.stream()
                .map(r -> new BookingRevenueItem(
                        String.valueOf(r[0]),
                        (BigDecimal) r[1]
                ))
                .toList();
    }
    @Override
    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    public PageResponse<BookingResponse> getBookingsRentalId(
            UUID userId,
            BookingStatus bookingStatus,
            String keyword,
            LocalDate fromDate,
            LocalDate toDate,
            int page,
            int size
    ) {
        Pageable pageable =
                PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<Booking> spec =
                BookingSpecification.filterBookingsByOwner(
                        userId,
                        bookingStatus,
                        keyword,
                        fromDate,
                        toDate
                );

        Page<Booking> bookingPage = bookingRepository.findAll(spec, pageable);

        List<BookingResponse> responses =
                bookingPage.getContent().stream()
                        .map(this::mapToBookingResponse)
                        .toList();

        return PageResponse.<BookingResponse>builder()
                .currentPage(bookingPage.getNumber() + 1)
                .totalPages(bookingPage.getTotalPages())
                .pageSize(bookingPage.getSize())
                .totalElements(bookingPage.getTotalElements())
                .data(responses)
                .build();
    }

    private BookingResponse mapToBookingResponse(Booking booking) {

        List<SlotResponse> slotResponses = booking.getSlots().stream()
                .map(slot -> {

                    RoomCopy roomCopy = slot.getRoomCopy();

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
    }
}
