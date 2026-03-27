package org.rent.room.be.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.rent.room.be.base.ApiResponse;
import org.rent.room.be.dto.request.room_copy.RoomCopyAllRequest;
import org.rent.room.be.dto.response.room_copy.RoomCopyResponse;
import org.rent.room.be.service.RoomCopyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/room-copies")
@Tag(name = "15. Room")
public class RoomCopyController {

    @Autowired
    private RoomCopyService roomCopyService;
    @GetMapping("/rental-area/{rentalAreaId}")
    public ApiResponse<List<RoomCopyResponse>> getRoomCopiesByRentalArea(
            @PathVariable UUID rentalAreaId) {

        return ApiResponse.<List<RoomCopyResponse>>builder()
                .result(roomCopyService.getAllRoomCopiesByRentalArea(rentalAreaId))
                .build();
    }
    @PostMapping
    public ApiResponse<?> createRoomCopy(@RequestBody @Valid RoomCopyAllRequest roomCopy) {
        try {
            roomCopyService.createRoomCopy(roomCopy);
            return ApiResponse.success(201, "create room copy successfully", null);
        } catch (Exception e) {

            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/{roomCopyId}")
    public ApiResponse<RoomCopyResponse> getRoomCopy(@PathVariable UUID roomCopyId) {
        try {

            return ApiResponse.success(200,
                    "get room copy by id successfully",
                    roomCopyService.getRoomCopyById(roomCopyId));
        } catch (Exception e) {

            return ApiResponse.error(e.getMessage());
        }
    }


}
