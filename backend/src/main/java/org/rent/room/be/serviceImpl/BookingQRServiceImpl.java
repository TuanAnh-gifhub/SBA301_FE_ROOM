package org.rent.room.be.serviceImpl;

import org.rent.room.be.constant.QRType;
import org.rent.room.be.entity.Booking;
import org.rent.room.be.entity.BookingQR;
import org.rent.room.be.repository.BookingQRRepository;
import org.rent.room.be.service.BookingQRService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class BookingQRServiceImpl implements BookingQRService {
    @Autowired
    private BookingQRRepository bookingQRRepository;

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
