package org.rent.room.be.dto.request.chat;

import lombok.*;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageRequest {
    private String content;
    private UUID recipientId;
    private UUID conversationId;
}