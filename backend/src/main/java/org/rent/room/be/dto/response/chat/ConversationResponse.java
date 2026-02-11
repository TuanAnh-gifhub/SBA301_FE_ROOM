package org.rent.room.be.dto.response.chat;

import lombok.*;
import org.rent.room.be.dto.response.UserResponse; // Import UserResponse của bạn

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ConversationResponse {
    private UUID conversationId;
    private String conversationTitle;
    private String lastMessage;
    private String lastSenderName;
    private UserResponse sender;
    private UserResponse recipient;
    private LocalDateTime updatedAt;
}