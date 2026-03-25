package org.rent.room.be.dto.request.rental_area;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateRentalAreaRequest {
    @NotBlank
    String rentalAreaName;
    @NotBlank
    String address;
    String contactName;
    String contactPhone;
    @NotNull
    Long cityId;

    @JsonFormat(pattern = "HH:mm")
    LocalTime openTime;

    @JsonFormat(pattern = "HH:mm")
    LocalTime closeTime;
}
