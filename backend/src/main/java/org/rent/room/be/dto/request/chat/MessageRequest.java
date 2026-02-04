package org.rent.room.be.dto.request.chat;

import lombok.*;

import java.util.UUID;

@Data
@Builder
public class MessageRequest {
    private String content;
    private UUID senderId;
    private UUID recipientId;
    private UUID conversationId;
}