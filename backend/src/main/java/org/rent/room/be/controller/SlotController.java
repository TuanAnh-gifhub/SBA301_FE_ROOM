package org.rent.room.be.controller;
import org.rent.room.be.base.ApiResponse;
import org.rent.room.be.dto.request.slot.SlotExtendCheckRequest;
import org.rent.room.be.dto.request.slot.SlotSwapCheckRequest;
import org.rent.room.be.dto.response.slot.SlotExtendCheckResponse;
import org.rent.room.be.dto.response.slot.SlotSwapCheckResponse;
import org.rent.room.be.service.SlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/slots")
public class SlotController {

    @Autowired
    private SlotService slotService;


    @PostMapping("/{bookingId}/{slotId}/extend/check")
    public ApiResponse<SlotExtendCheckResponse> checkExtend(
            @PathVariable UUID bookingId,
            @PathVariable UUID slotId,
            @RequestBody SlotExtendCheckRequest req
    ) {
        return ApiResponse.<SlotExtendCheckResponse>builder()
                .result(slotService.checkExtend(bookingId, slotId, req))
                .build();
    }

    @PostMapping("/{bookingId}/{slotId}/extend/confirm")
    public ApiResponse<Void> confirmExtend(
            @PathVariable UUID bookingId,
            @PathVariable UUID slotId,
            @RequestBody SlotExtendCheckRequest req
    ) throws IOException {
        slotService.confirmExtend(bookingId, slotId, req);
        return ApiResponse.<Void>builder()
                .message("Gia hạn slot thành công")
                .build();
    }



    @PostMapping("/{bookingId}/{slotId}/swap/check")
    public ApiResponse<SlotSwapCheckResponse> checkSwap(
            @PathVariable UUID bookingId,
            @PathVariable UUID slotId,
            @RequestBody SlotSwapCheckRequest req
    ) {
        return ApiResponse.<SlotSwapCheckResponse>builder()
                .result(slotService.checkSwap(bookingId, slotId, req))
                .build();
    }

    @PostMapping("/{bookingId}/{slotId}/swap/confirm")
    public ApiResponse<Void> confirmSwap(
            @PathVariable UUID bookingId,
            @PathVariable UUID slotId,
            @RequestBody SlotSwapCheckRequest req
    ) throws IOException {
        slotService.confirmSwap(bookingId, slotId, req);
        return ApiResponse.<Void>builder()
                .message("Chuyển slot thành công")
                .build();
    }
}
