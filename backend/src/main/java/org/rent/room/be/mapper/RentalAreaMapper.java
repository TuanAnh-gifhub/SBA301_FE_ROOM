package org.rent.room.be.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.rent.room.be.dto.response.rental_area.RentalAreaResponse;
import org.rent.room.be.entity.RentalArea;

@Mapper(componentModel = "spring")
public interface RentalAreaMapper {
    @Mapping(target = "cityName", source = "city.cityName")
    RentalAreaResponse toResponse(RentalArea rentalArea);
}

