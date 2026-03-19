package org.rent.room.be.service;


import org.rent.room.be.dto.request.slot.SlotExtendCheckRequest;
import org.rent.room.be.dto.request.slot.SlotSwapCheckRequest;
import org.rent.room.be.dto.response.slot.SlotExtendCheckResponse;
import org.rent.room.be.dto.response.slot.SlotSwapCheckResponse;
import org.rent.room.be.entity.Slot;

import java.io.IOException;
import java.util.UUID;


public interface SlotService {
    Slot createSlot(Slot slot);

    // ── Extend ──
    SlotExtendCheckResponse checkExtend(UUID bookingId, UUID slotId, SlotExtendCheckRequest req);
    void confirmExtend(UUID bookingId, UUID slotId, SlotExtendCheckRequest req) throws IOException;

    // ── Swap ──
    SlotSwapCheckResponse checkSwap(UUID bookingId, UUID slotId, SlotSwapCheckRequest req);
    void confirmSwap(UUID bookingId, UUID slotId, SlotSwapCheckRequest req) throws IOException;
}
