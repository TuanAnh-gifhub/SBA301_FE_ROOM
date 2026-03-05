package org.rent.room.be.dto.response.chat;

import lombok.*;
import java.util.UUID;

@Data
@AllArgsConstructor
public class ReadReceiptResponse {
    private UUID conversationId;
    private UUID readerId;
}