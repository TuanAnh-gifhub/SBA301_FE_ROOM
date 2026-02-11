package org.rent.room.be.service;

import org.rent.room.be.dto.request.chat.MessageRequest;
import org.rent.room.be.dto.response.chat.ConversationResponse;
import org.rent.room.be.dto.response.chat.MessageResponse;

import java.util.List;
import java.util.UUID;

public interface ChatService {
    MessageResponse saveMessage(MessageRequest request);

    List<ConversationResponse> getUserConversations(UUID userId);

    List<MessageResponse> getMessagesByConversation(UUID conversationId);

    ConversationResponse getConversationById(UUID conversationId);

    List<ConversationResponse> getAllConversations(UUID userId);

    void markAllMessagesInConversationAsRead(UUID conversationId, UUID recipientId);
}
