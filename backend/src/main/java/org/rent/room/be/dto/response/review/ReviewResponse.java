package org.rent.room.be.dto.response.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import org.rent.room.be.dto.response.UserResponse;
import org.rent.room.be.dto.response.rental_area.RentalAreaResponse;

import java.util.UUID;

@Builder
@Getter
public class ReviewResponse {
    UUID reviewId;
    int rating;
    String comment;
    UUID bookingId;
    UUID userId;
    String userName;
    RentalAreaResponse rentalArea;
}
