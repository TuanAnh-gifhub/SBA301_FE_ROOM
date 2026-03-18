package org.rent.room.be.dto.request.booking;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GetAvailableSlotsRequest {
    @NotNull(message = "roomId cannot be null")
    private String roomId;

    @NotNull(message = "startTime cannot be null")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startTime;

    @NotNull(message = "duration cannot be null")
    @Positive(message = "duration must be positive")
    private Integer duration;
}
