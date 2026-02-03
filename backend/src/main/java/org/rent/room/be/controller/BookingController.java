package org.rent.room.be.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.rent.room.be.base.ApiResponse;
import org.rent.room.be.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bookings")
@Tag(name = "3. Booking")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ApiResponse<?> booking() {
        try {
            return ApiResponse.builder()
                    .code(200)
                    .message("Create booking successfully")
                    .result(null)
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
    public ApiResponse<?>getAllBooking(){
        try {

            return ApiResponse.builder()
                    .code(200)
                    .message("Get all bookings successfully")
                    .result(null)
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
    public ApiResponse<?> getBooking(@PathVariable("bookId") String bookId){
        try {

            return ApiResponse.builder()
                    .code(200)
                    .message("Get all bookings successfully")
                    .result(null)
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
