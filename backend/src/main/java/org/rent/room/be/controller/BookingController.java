package org.rent.room.be.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.rent.room.be.base.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/bookings")
@Tag(name = "5. Bookings", description = "API quản lý đặt phòng")
public class BookingController {

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



}
