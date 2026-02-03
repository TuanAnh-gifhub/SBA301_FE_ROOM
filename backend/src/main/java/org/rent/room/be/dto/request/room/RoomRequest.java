package org.rent.room.be.dto.request.room;

import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.rent.room.be.constant.RoomStatus;

import java.math.BigDecimal;

@Builder
@Getter

public class RoomRequest {
    private String roomName;
    private BigDecimal price;
    private String description;
    private RoomStatus roomStatus;
}
