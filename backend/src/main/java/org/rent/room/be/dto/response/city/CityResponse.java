package org.rent.room.be.dto.response.city;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CityResponse {
    private Long cityId;
    private String cityName;
}
