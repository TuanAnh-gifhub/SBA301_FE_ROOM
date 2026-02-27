package org.rent.room.be.controller;

import lombok.RequiredArgsConstructor;
import org.rent.room.be.base.ApiResponse;
import org.rent.room.be.dto.request.chat.MessageRequest;
import org.rent.room.be.dto.response.chat.ConversationResponse;
import org.rent.room.be.dto.response.chat.MessageResponse;
import org.rent.room.be.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/chat")
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/chat")
    public void processMessage(@Payload MessageRequest messageRequest, Principal principal) {
        if (principal == null) {
            throw new RuntimeException("User not authenticated in WebSocket");
        }
        chatService.saveMessage(messageRequest, principal.getName());
    }

    @GetMapping("/conversations/{userId}")
    public ResponseEntity<ApiResponse<List<ConversationResponse>>> getConversations(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.<List<ConversationResponse>>builder()
                .result(chatService.getUserConversations(userId))
                .build());
    }

    @GetMapping("/history/{conversationId}")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getHistory(@PathVariable UUID conversationId) {
        return ResponseEntity.ok(ApiResponse.<List<MessageResponse>>builder()
                .result(chatService.getMessagesByConversation(conversationId))
                .build());
    }

    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<ApiResponse<ConversationResponse>> getConversation(@PathVariable UUID conversationId) {
        return ResponseEntity.ok(ApiResponse.<ConversationResponse>builder()
                .result(chatService.getConversationById(conversationId))
                .build());
    }

    @PatchMapping("/conversations/{conversationId}/read")
    public ResponseEntity<ApiResponse<Void>> markConversationAsRead(
            @PathVariable UUID conversationId,
            @RequestParam UUID userId) {

        chatService.markAllMessagesInConversationAsRead(conversationId, userId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .message("Conversation marked as read")
                .build());
    }
}
