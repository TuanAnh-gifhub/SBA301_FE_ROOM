package org.rent.room.be.dto.response.chat;

import lombok.*;
import org.rent.room.be.constant.MessageStatus;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MessageResponse {
    private UUID messageId;
    private UUID conversationId;
    private String content;
    private String senderName;
    private UUID senderId;
    private LocalDateTime createdAt;
    private MessageStatus status;
    private LocalDateTime readAt;
}