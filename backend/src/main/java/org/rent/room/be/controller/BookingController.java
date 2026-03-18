package org.rent.room.be.controller;

import com.sun.security.auth.UserPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.rent.room.be.base.ApiResponse;
import org.rent.room.be.constant.BookingStatus;
import org.rent.room.be.constant.QRType;
import org.rent.room.be.dto.request.booking.BookingRequest;
import org.rent.room.be.dto.request.booking.UpdateBookingRequest;
import org.rent.room.be.security.CustomUserDetails;
import org.rent.room.be.service.BookingQRService;
import org.rent.room.be.service.BookingService;
import org.rent.room.be.service.InvoicePdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/bookings")
@Tag(name = "12. Booking")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private BookingQRService bookingQRService;

    @Autowired
    private InvoicePdfService invoicePdfService;

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

    @GetMapping("/qr-scan")
    public ApiResponse<?> scan(@RequestParam String token) {

        String result = bookingQRService.scanBookingQR(token);

        return ApiResponse.success(200, "Scan QR successfully", result
        );
    }

    @PostMapping("/check-booking")
    public ApiResponse<?> checkIfUserBooked() {
        try {

            return
                    ApiResponse.success(200, "", null);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }

    }


    @GetMapping("/booking-intents/{intentId}")
    public ApiResponse<?> getBookingIntentById(@PathVariable UUID intentId) {
        try {
            return ApiResponse.builder()
                    .code(200)
                    .message("Get booking intent successfully")
                    .result(bookingService.getBookingIntentById(intentId))
                    .build();
        } catch (Exception e) {
            e.getStackTrace();
            return ApiResponse.builder()
                    .code(500)
                    .message(e.getMessage())
                    .build();
        }
    }


    @PostMapping("/booking-intents")
    public ApiResponse<?> createBookingIntent(@Valid @RequestBody BookingRequest request) {
        try {

            return ApiResponse.builder()
                    .code(200)
                    .message("Create booking intent successfully")
                    .result(bookingService.createBookingIntent(request))
                    .build();

        } catch (Exception e) {
            e.getStackTrace();
            return ApiResponse.builder()
                    .code(500)
                    .message(e.getMessage())
                    .build();
        }
    }


    @GetMapping
    public ApiResponse<?> getAllBooking(@RequestParam(required = false) BookingStatus bookingStatus,
                                        @RequestParam(required = false) String keyword,
                                        @RequestParam(required = false)
                                        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                                        LocalDate from,
                                        @RequestParam(required = false)
                                        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                                        LocalDate to,
                                        @RequestParam(defaultValue = "1", required = false) int page,
                                        @RequestParam(defaultValue = "10", required = false) int size,
                                        @AuthenticationPrincipal UserDetails principal) {
        try {
            UUID currentUserId = null;

            if (principal instanceof CustomUserDetails customUserDetails) {
                currentUserId = customUserDetails.getUserId();
            }

            if (currentUserId == null) {
                throw new RuntimeException("User not authenticated");
            }


            return ApiResponse.builder()
                    .code(200)
                    .message("Get all bookings successfully")
                    .result(bookingService.getAllBookings(bookingStatus, keyword, from, to, page, size))
                    .build();
        } catch (Exception e) {
            e.getStackTrace();
            return ApiResponse.builder()
                    .code(500)
                    .message("Api system have some problems " + e.getMessage())
                    .build();
        }
    }

    @GetMapping("/{bookId}")
    public ApiResponse<?> getBooking(@PathVariable("bookId") UUID bookId) {
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
                    .message("Api system have some problems " + e.getMessage())
                    .build();
        }
    }

    @GetMapping("/my-rentals")
    public ApiResponse<?> getMyRentals(@RequestParam UUID userId,
                                       @RequestParam(required = false) BookingStatus bookingStatus,
                                       @RequestParam(required = false) String keyword,
                                       @RequestParam(required = false)
                                       @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                                       LocalDate from,
                                       @RequestParam(required = false)
                                       @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                                       LocalDate to,
                                       @RequestParam(defaultValue = "1", required = false) int page,
                                       @RequestParam(defaultValue = "10", required = false) int size) {
        try {
            System.err.println("uẻ id "+ userId);
            return ApiResponse.builder()
                    .code(200)
                    .message("Get all bookings of rental successfully")
                    .result(bookingService.getBookingsRentalId(userId, bookingStatus, keyword, from, to, page, size))
                    .build();
        } catch (Exception e) {
            e.getStackTrace();
            return ApiResponse.builder()
                    .code(500)
                    .message("Api system have some problems " + e.getMessage())
                    .build();
        }
    }

    @GetMapping("/my-bookings")
    public ApiResponse<?> getMyBookings(@RequestParam UUID userId,
                                        @RequestParam(required = false) BookingStatus bookingStatus,
                                        @RequestParam(required = false) String keyword,
                                        @RequestParam(required = false)
                                        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                                        LocalDate from,
                                        @RequestParam(required = false)
                                        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                                        LocalDate to,
                                        @RequestParam(defaultValue = "1", required = false) int page,
                                        @RequestParam(defaultValue = "10", required = false) int size) {
        try {

            return ApiResponse.builder()
                    .code(200)
                    .message("Get all bookings of me successfully")
                    .result(bookingService.getMyBookings(userId, bookingStatus, keyword, from, to, page, size))
                    .build();
        } catch (Exception e) {
            e.getStackTrace();
            return ApiResponse.builder()
                    .code(500)
                    .message("Api system have some problems " + e.getMessage())
                    .build();
        }
    }

    @PatchMapping("/bookings/{bookingId}/cancel")
    public ApiResponse<?> cancelBooking(@PathVariable UUID bookingId) {
        try {

            return ApiResponse.builder()
                    .code(200)
                    .message("Cancel booking successfully")
                    .result(bookingService.cancelBooking(bookingId))
                    .build();
        } catch (Exception e) {
            e.getStackTrace();
            return ApiResponse.builder()
                    .code(500)
                    .message("Api system have some problems " + e.getMessage())
                    .build();
        }
    }

    @PutMapping("/{bookingId}")
    public ApiResponse<?> updateBooking(@PathVariable UUID bookingId, @Valid @RequestBody UpdateBookingRequest request) {
        try {

            return ApiResponse.builder()
                    .code(200)
                    .message("Update booking successfully")
                    .result(bookingService.updateBooking(bookingId, request))
                    .build();
        } catch (Exception e) {
            e.getStackTrace();
            return ApiResponse.builder()
                    .code(500)
                    .message("Api system have some problems " + e.getMessage())
                    .build();
        }
    }

    @GetMapping("/{bookingId}/invoice")
    public ResponseEntity<Resource> downloadInvoice(
            @PathVariable UUID bookingId
    ) throws IOException {

        Resource resource = invoicePdfService.downloadInvoice(bookingId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + resource.getFilename() + "\"")
                .header(HttpHeaders.PRAGMA, "no-cache")
                .body(resource);
    }

    @GetMapping("/dashboard/summary")
    public ApiResponse<?> summary(
            @RequestParam(required = false)
            LocalDateTime from,
            @RequestParam(required = false)
            LocalDateTime to,
            @AuthenticationPrincipal UserDetails principal) {
        try {
            UUID currentUserId = null;
            if (principal instanceof CustomUserDetails customUserDetails) {
                currentUserId = customUserDetails.getUserId();
            }
            if (currentUserId == null) {
                throw new RuntimeException("User not authenticated");
            }
            return ApiResponse.builder()
                    .code(200)
                    .message("Dashboard summary booking successfully")
                    .result(bookingService.getBookingSummary(from,to,currentUserId))
                    .build();
        } catch (Exception e) {
            e.getStackTrace();
            return ApiResponse.builder()
                    .code(500)
                    .message("Api system have some problems " + e.getMessage())
                    .build();
        }
    }

    @GetMapping("/dashboard/revenue")
    public ApiResponse<?> revenue(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {

        try {

            UUID ownerId = null;

            if (principal instanceof CustomUserDetails customUserDetails) {
                ownerId = customUserDetails.getUserId();
            }

            if (ownerId == null) {
                throw new RuntimeException("User not authenticated");
            }

            return ApiResponse.builder()
                    .code(200)
                    .message("Dashboard revenue booking successfully")
                    .result(bookingService.revenue(month, year))
                    .build();

        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.builder()
                    .code(500)
                    .message(e.getMessage())
                    .build();
        }
    }


}
