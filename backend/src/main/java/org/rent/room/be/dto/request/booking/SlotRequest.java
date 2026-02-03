package org.rent.room.be.dto.request.booking;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class SlotRequest {
    @NotNull(message = "Ngày không bỏ trống")
    LocalDate date;
    @NotNull(message = "Khung giờ không bỏ trống")
    LocalTime startTime;
    @NotNull(message = "Khung giờ không bỏ trống")
    LocalTime endTime;
}
