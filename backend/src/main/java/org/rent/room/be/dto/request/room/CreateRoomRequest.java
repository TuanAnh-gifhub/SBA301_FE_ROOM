package org.rent.room.be.dto.request.room;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateRoomRequest {

    @NotBlank
    @Size(max = 100)
    String roomName;

    String description;

    BigDecimal price;

    Integer capacity;

    Double area;

    Integer categoryId;

    Set<Long> amenityIds;

    @NotNull(message = "mã phòng không bỏ trống")
    @Size(min = 1, message = "phải có ít nhất 1 mã phòng")
    List< @NotBlank(message = "mã phòng không được rỗng") String> roomCodes;
}
