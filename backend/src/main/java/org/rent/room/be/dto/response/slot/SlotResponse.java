package org.rent.room.be.dto.response.slot;


import lombok.Builder;
import lombok.Getter;
import org.rent.room.be.constant.SlotStatus;
import org.rent.room.be.dto.response.room_copy.RoomCopyResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class SlotResponse {
  private   UUID slotId;
    private LocalDateTime startTime;
    private  LocalDateTime endTime;
    private BigDecimal price;
    private SlotStatus status;
    private LocalDate specificDate;
    private  RoomCopyResponse roomCopy;

}
