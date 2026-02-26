package org.rent.room.be.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.rent.room.be.dto.response.review.ReviewResponse;
import org.rent.room.be.entity.Review;

@Mapper(componentModel = "spring", uses = {RentalAreaMapper.class})
public interface ReviewMapper {

    @Mapping(target = "bookingId", source = "booking.bookingId")
    @Mapping(target = "userId", source = "user.userId")
    @Mapping(target = "userName", source = "user.userName")
    @Mapping(target = "rentalArea", source = "rental")
    ReviewResponse toResponse(Review review);
}