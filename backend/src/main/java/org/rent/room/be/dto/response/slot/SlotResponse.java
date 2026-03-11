package org.rent.room.be.dto.response.slot;


import lombok.Builder;
import lombok.Getter;
import net.minidev.json.annotate.JsonIgnore;
import org.rent.room.be.constant.SlotStatus;
import org.rent.room.be.dto.response.booking.BookingShortResponse;
import org.rent.room.be.dto.response.room_copy.RoomCopyResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class SlotResponse {
    private UUID slotId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal price;
    private SlotStatus status;
    @JsonIgnore
    private RoomCopyResponse roomCopy;
    private BookingShortResponse booking;

}
