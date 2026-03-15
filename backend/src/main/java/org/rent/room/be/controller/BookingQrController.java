package org.rent.room.be.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.rent.room.be.base.ApiResponse;
import org.rent.room.be.service.BookingQRService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;
@RestController
@RequestMapping("/booking-qr")
@Tag(name = "8. Booking QR")
public class BookingQrController {
    @Autowired
    private BookingQRService bookingQRService;

    @GetMapping("/{bookingQrId}")
    public ApiResponse<?> getBookingQr(@PathVariable UUID bookingQrId) {
        try{
            return ApiResponse.success(200, "Get booking QR successfully", bookingQRService.getBookingQrById(bookingQrId));
        }catch(Exception e){
            return ApiResponse.error(500, e.getMessage());
        }

    }

}
