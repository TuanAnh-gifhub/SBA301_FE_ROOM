package org.rent.room.be.dto.response.rental_area;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class RentalAreaResponse {
    UUID rentalAreaId;
    String rentalAreaName;
    String addressDetail;
    String ward;
    String district;
    String cityName;
}
