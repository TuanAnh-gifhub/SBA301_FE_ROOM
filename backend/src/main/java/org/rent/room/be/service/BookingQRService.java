package org.rent.room.be.service;

import org.rent.room.be.constant.QRType;
import org.rent.room.be.entity.Booking;
import org.rent.room.be.entity.BookingQR;

import java.util.UUID;

public interface BookingQRService {

    public void createBookingQR(Booking booking, QRType qrType);
    void updateBooingQR(UUID bookingQrId);
    void getBookingQrById(UUID bookingQrId);
    byte[] generateBookingQr(UUID bookingId, QRType type);

}
