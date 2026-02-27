package org.rent.room.be.dto.response.chat;

import lombok.Data;

import java.util.UUID;

@Data
public class UserChatResponse {
    private UUID userId;
    private String userName;
    private String avatar;
}