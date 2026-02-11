package org.rent.room.be.controller;

import lombok.RequiredArgsConstructor;
import org.rent.room.be.dto.request.chat.MessageRequest;
import org.rent.room.be.dto.response.chat.MessageResponse;
import org.rent.room.be.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/chat")
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    @MessageMapping("/chat")
    public void processMessage(@Payload MessageRequest messageRequest) {
        // 1. Lưu vào DB
        MessageResponse savedMessage = chatService.saveMessage(messageRequest);

        // 2. Gửi cho người nhận thông qua queue riêng của họ
        // Client người nhận cần subscribe vào: /user/{userId}/queue/messages
        messagingTemplate.convertAndSendToUser(
                messageRequest.getRecipientId().toString(),
                "/queue/messages",
                savedMessage
        );
    }

    @GetMapping("/conversations/{userId}")
    public ResponseEntity<?> getConversations(@PathVariable UUID userId) {
        return ResponseEntity.ok(chatService.getUserConversations(userId));
    }

    @GetMapping("/history/{conversationId}")
    public ResponseEntity<?> getHistory(@PathVariable UUID conversationId) {
        return ResponseEntity.ok(chatService.getMessagesByConversation(conversationId));
    }

    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<?> getConversation(@PathVariable UUID conversationId) {
        return ResponseEntity.ok(chatService.getConversationById(conversationId));
    }

    @PatchMapping("/conversations/{conversationId}/read")
    public ResponseEntity<?> markConversationAsRead(
            @PathVariable UUID conversationId,
            @RequestParam UUID userId) {
        chatService.markAllMessagesInConversationAsRead(conversationId, userId);
        return ResponseEntity.ok().build();
    }
}