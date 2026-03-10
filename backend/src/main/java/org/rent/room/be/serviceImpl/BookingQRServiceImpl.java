package org.rent.room.be.serviceImpl;

import org.rent.room.be.constant.BookingStatus;
import org.rent.room.be.constant.QRType;
import org.rent.room.be.dto.response.booking.BookingResponse;
import org.rent.room.be.dto.response.qr.BookingQrResponse;
import org.rent.room.be.dto.response.rental_area.RentalAreaResponse;
import org.rent.room.be.dto.response.room_copy.RoomCopyResponse;
import org.rent.room.be.dto.response.slot.SlotResponse;
import org.rent.room.be.entity.Booking;
import org.rent.room.be.entity.BookingQR;
import org.rent.room.be.entity.RoomCopy;
import org.rent.room.be.exception.AppException;
import org.rent.room.be.exception.ErrorCode;
import org.rent.room.be.repository.BookingQRRepository;
import org.rent.room.be.repository.BookingRepository;
import org.rent.room.be.service.BookingQRService;
import org.rent.room.be.utils.ZXingHelper;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingQRServiceImpl implements BookingQRService {
    @Autowired
    private BookingQRRepository bookingQRRepository;
    @Value("${app.base-url}")
    private String baseUrl;
   @Autowired
    private BookingRepository bookingRepository;

    @Override
    public byte[] generateBookingQr(UUID bookingId, QRType type) {
        BookingQR qr = bookingQRRepository
                .findByBooking_BookingIdAndQrType(bookingId, type)
                .orElseThrow(() ->
                        new RuntimeException("QR không tồn tại cho booking " + bookingId)
                );

        String content = baseUrl+"/api/v1/rent-room/bookings/scan?token=" + qr.getQrToken();
        System.err.println("QR content: " + content);
        try {
            return ZXingHelper.getQRCodeImage(content, 150, 150);
        } catch (Exception e) {
            throw new RuntimeException("Không tạo được QR code", e);
        }
    }

    @Override
    @Transactional
    public String scanBookingQR(String qrToken) {

        BookingQR qr = bookingQRRepository.findByQrToken(qrToken)
                .orElseThrow(() ->
                        new AppException(ErrorCode.QR_INVALID));

        if (qr.getUsedAt() != null) {
            throw new AppException(ErrorCode.QR_ALREADY_USED);
        }

        if (qr.getExpireAt().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.QR_EXPIRED);
        }

        Booking booking = bookingRepository
                .findById(qr.getBooking().getBookingId())
                .orElseThrow(() ->
                        new AppException(ErrorCode.BOOKING_NOT_FOUND));

//        LocalDateTime now = LocalDateTime.now();

        if (qr.getQrType() == QRType.CHECK_IN) {

//            if (now.isBefore(booking.getStartTime())) {
//                throw new AppException(ErrorCode.CANNOT_CHECKIN_BEFORE_START_TIME);
//            }

            if (booking.getBookingStatus() == BookingStatus.CHECKED_IN) {
                throw new AppException(ErrorCode.BOOKING_ALREADY_CHECKED_IN);
            }

//            booking.setCheckIn(now);
            booking.setBookingStatus(BookingStatus.CHECKED_IN);

        } else {

            if (booking.getBookingStatus() != BookingStatus.CHECKED_IN) {
                throw new AppException(ErrorCode.CANNOT_CHECKOUT_BEFORE_CHECKIN);
            }

//            booking.setCheckOut(now);
            booking.setBookingStatus(BookingStatus.COMPLETED);
        }

        qr.setUsedAt(LocalDateTime.now());

        return "SUCCESS " + qr.getQrType();
    }

    @Override
    public void createBookingQR(Booking booking, QRType qrType,LocalDateTime checkDate) {

        BookingQR bookingQR = BookingQR.builder()
                .qrToken(UUID.randomUUID().toString())
                .booking(booking)
                .qrType(qrType)
                .expireAt(checkDate.plusHours(1))
                .usedAt(null)
                .build();

        bookingQRRepository.save(bookingQR);
    }

    @Override
    public BookingQrResponse getBookingQrById(UUID bookingQrId) {
        BookingQR  bookingQR=  bookingQRRepository.findById(bookingQrId)
                .orElseThrow(() ->
                        new AppException(ErrorCode.QR_NOT_FOUND));

        Booking booking = bookingRepository.findById(bookingQR.getBooking().getBookingId()).orElseThrow(() ->
                new RuntimeException("Không tìm thấy booking với id trong QR"));
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

        BookingResponse bookingResponse =  BookingResponse.builder()
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
        return BookingQrResponse.builder()
                .bookingQrId(bookingQR.getBookingQrId())
                .qrToken(bookingQR.getQrToken())
                .qrType(bookingQR.getQrType())
                .expireAt(bookingQR.getExpireAt())
                .usedAt(bookingQR.getUsedAt())
                .bookingResponse(bookingResponse)
                .build();
    }
}
