package org.rent.room.be.service;

import org.rent.room.be.dto.response.city.CityResponse;

import java.util.List;

public interface CityService {
    List<CityResponse> getAllCities();
}
