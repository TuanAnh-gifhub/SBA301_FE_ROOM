package org.rent.room.be.dto.request.booking;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BookingRequest {
    @NotNull(message = "User id không được bỏ trống")
    private UUID userId;
    @NotNull(message = "Room id không được bỏ trống")
    private UUID roomId;
//    @NotNull(message = "Category id không được bỏ trống")
//    private UUID categoryId;
    @NotNull(message = "Thuê dài hạn hay không,không được bỏ trống ")
    private boolean isLongTerm;
    private List<@Valid SlotRequest> slotRequests;
    private int numberOfMonths;
    private int quantityRoom;
    private String note;
}

