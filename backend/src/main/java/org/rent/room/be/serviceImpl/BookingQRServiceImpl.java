package org.rent.room.be.serviceImpl;

import lombok.Value;
import org.rent.room.be.constant.QRType;
import org.rent.room.be.entity.Booking;
import org.rent.room.be.entity.BookingQR;
import org.rent.room.be.repository.BookingQRRepository;
import org.rent.room.be.service.BookingQRService;
import org.rent.room.be.utils.ZXingHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class BookingQRServiceImpl implements BookingQRService {
    @Autowired
    private BookingQRRepository bookingQRRepository;


    @Override
    public byte[] generateBookingQr(UUID bookingId, QRType type) {
        BookingQR qr = bookingQRRepository
                .findByBookingIdAndType(bookingId, type)
                .orElseThrow(() ->
                        new RuntimeException("QR không tồn tại cho booking " + bookingId)
                );

        String content = "http://localhost:8080/api/bookings/scan" + "?token=" + qr.getQrToken();

        try {
            return ZXingHelper.getQRCodeImage(content, 300, 300);
        } catch (Exception e) {
            throw new RuntimeException("Không tạo được QR code", e);
        }
    }
    @Override
    public void createBookingQR(Booking booking, QRType qrType) {

        BookingQR bookingQR = BookingQR.builder()
                .qrToken(UUID.randomUUID().toString())
                .booking(booking)
                .expireAt(LocalDateTime.now().plusDays(5))
                .build();

        bookingQRRepository.save(bookingQR);
    }

    @Override
    public void updateBooingQR(UUID bookingQrId) {

    }

    @Override
    public void getBookingQrById(UUID bookingQrId) {

    }
}
