package org.rent.room.be.dto.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerRoomSummaryResponse {
    private long totalRooms;
    private long activeRooms;
    private long maintenanceRooms;
    private long inactiveRooms;
}