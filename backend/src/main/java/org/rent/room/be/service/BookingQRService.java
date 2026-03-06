package org.rent.room.be.service;

import org.rent.room.be.constant.QRType;
import org.rent.room.be.dto.response.qr.BookingQrResponse;
import org.rent.room.be.entity.Booking;
import java.time.LocalDateTime;
import java.util.UUID;

public interface BookingQRService {

    String scanBookingQR(String qrToken);
     void createBookingQR(Booking booking, QRType qrType,LocalDateTime checkDate);
    BookingQrResponse getBookingQrById(UUID bookingQrId);
    byte[] generateBookingQr(UUID bookingId, QRType type);

}
