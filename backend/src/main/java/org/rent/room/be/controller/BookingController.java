package org.rent.room.be.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.rent.room.be.base.ApiResponse;
import org.rent.room.be.constant.BookingStatus;
import org.rent.room.be.constant.QRType;
import org.rent.room.be.constant.ReportStatus;
import org.rent.room.be.dto.request.booking.BookingRequest;
import org.rent.room.be.dto.response.booking.BookingResponse;
import org.rent.room.be.entity.BookingQR;
import org.rent.room.be.service.BookingQRService;
import org.rent.room.be.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/bookings")
@Tag(name = "3. Booking")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private  BookingQRService bookingQRService;

    @GetMapping("/{bookingId}/qr")
    public ResponseEntity<byte[]> getQr(
            @PathVariable UUID bookingId,
            @RequestParam QRType type
    ) {
        byte[] image = bookingQRService.generateBookingQr(bookingId, type);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        headers.setCacheControl(CacheControl.noCache());

        return new ResponseEntity<>(image, headers, HttpStatus.OK);
    }

    @PostMapping("/check-booking")
    public  ApiResponse<?> checkIfUserBooked(){
        try {

            return
                    ApiResponse.success(200,"",null);
        }catch (Exception e){
            return ApiResponse.error(e.getMessage());
        }

    }


    @PostMapping
    public ApiResponse<?> booking(@Valid @RequestBody  BookingRequest request) {
        try {

            return ApiResponse.builder()
                    .code(200)
                    .message("Create booking successfully")
                    .result(bookingService.createBooking(request))
                    .build();

        } catch (Exception e) {
            e.getStackTrace();
            return ApiResponse.builder()
                    .code(500)
                    .message("Api system have some problems " + e.getMessage())
                    .build();
        }
    }


    @GetMapping
    public ApiResponse<?>getAllBooking(    @RequestParam(required = false) BookingStatus bookingStatus,
                                           @RequestParam(required = false)String keyword,
                                           @RequestParam(required = false)
                                               @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                                               LocalDate from,
                                           @RequestParam(required = false)
                                               @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                                               LocalDate to,
                                           @RequestParam(defaultValue = "1", required = false) int page,
                                           @RequestParam(defaultValue = "10", required = false) int size){
        try {


            return ApiResponse.builder()
                    .code(200)
                    .message("Get all bookings successfully")
                    .result( bookingService.getAllBookings(bookingStatus,keyword,from,to,page, size))
                    .build();
        } catch (Exception e) {
            e.getStackTrace();
            return ApiResponse.builder()
                    .code(500)
                    .message("Api system have some problems "+ e.getMessage())
                    .build();
        }
    }

    @GetMapping("/{bookId}")
    public ApiResponse<?> getBooking(@PathVariable("bookId") UUID bookId){
        try {

            return ApiResponse.builder()
                    .code(200)
                    .message("Get all bookings successfully")
                    .result(bookingService.getBookingById(bookId))
                    .build();
        } catch (Exception e) {
            e.getStackTrace();
            return ApiResponse.builder()
                    .code(500)
                    .message("Api system have some problems "+ e.getMessage())
                    .build();
        }
    }



}
