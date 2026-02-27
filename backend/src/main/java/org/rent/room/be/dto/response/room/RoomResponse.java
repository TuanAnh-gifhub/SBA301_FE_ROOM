package org.rent.room.be.dto.response.room;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.rent.room.be.constant.RoomStatus;
import org.rent.room.be.dto.response.room_copy.RoomCopyResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomResponse {
    UUID roomId;
    UUID rentalAreaId;
    String roomName;
    String description;
    BigDecimal price;
    RoomStatus roomStatus;
    Integer capacity;
    Double area;
    Integer categoryId;
    String categoryName;
    Set<AmenityItem> amenities;
    List<RoomImageResponse> images;

    List<RoomCopyResponse> roomCopies;
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AmenityItem {
        Long amenityId;
        String amenityName;
    }
}
