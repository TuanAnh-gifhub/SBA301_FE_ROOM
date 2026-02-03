package org.rent.room.be.dto.response.booking;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public class SlotResponse {
    @NotNull(message = "Ngày không bỏ trống")
    LocalDate date;
    @NotNull(message = "Khung giờ không bỏ trống")
    LocalTime startTime;
    @NotNull(message = "Khung giờ không bỏ trống")
    LocalTime endTime;
}
