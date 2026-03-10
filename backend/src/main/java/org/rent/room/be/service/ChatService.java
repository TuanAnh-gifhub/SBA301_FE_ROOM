package org.rent.room.be.service;

import org.rent.room.be.dto.request.chat.MessageRequest;
import org.rent.room.be.dto.response.chat.ConversationResponse;
import org.rent.room.be.dto.response.chat.MessageResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface ChatService {
    void saveMessage(MessageRequest request, String currentUserEmail);

    MessageResponse saveMessageWithFile(MessageRequest request, String currentUserEmail, MultipartFile file);

    List<ConversationResponse> getUserConversations(UUID userId);

    List<MessageResponse> getMessagesByConversation(
            UUID conversationId, String currentUser, int page, int size);

    ConversationResponse getConversationById(UUID conversationId);

    void markAllMessagesInConversationAsRead(UUID conversationId, UUID recipientId);

}
