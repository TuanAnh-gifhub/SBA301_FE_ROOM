package org.rent.room.be.dto.response.slot;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SlotConflictResult {
    private boolean available;
    private List<String> conflictRooms;
}