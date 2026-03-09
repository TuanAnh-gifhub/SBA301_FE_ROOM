package org.rent.room.be.dto.request.booking;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.rent.room.be.constant.BookingType;

import java.util.List;
import java.util.UUID;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class BookingRequest {
    @NotNull(message = "Mã người dùng không được bỏ trống")
    private UUID userId;
    private String userName;
    @NotNull(message = "Số điện thoại không được bỏ trống")
    private String userPhone;
    @Valid
    private List<SlotRequest> slotRequests;
    private String note;
    private BookingType bookingType;

}

