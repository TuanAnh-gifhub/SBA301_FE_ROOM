package org.rent.room.be.dto.request.slot;


import lombok.Data;

@Data
public class SlotExtendCheckRequest {
    private int amount;
    private String unit;
}