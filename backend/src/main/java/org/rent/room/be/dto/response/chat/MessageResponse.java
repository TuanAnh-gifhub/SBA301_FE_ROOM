package org.rent.room.be.dto.response.chat;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class MessageResponse {
    private UUID messageId;
    private UUID conversationId;
    private String content;
    private String senderName;
    private UUID senderId;
    private LocalDateTime createdAt;
}