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
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/chat")
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    @MessageMapping("/chat")
    public void processMessage(@Payload MessageRequest messageRequest) {

        MessageResponse savedMessage = chatService.saveMessage(messageRequest);

        messagingTemplate.convertAndSendToUser(
                messageRequest.getRecipientId().toString(),
                "/queue/messages",
                savedMessage
        );
    }

    @GetMapping("/conversations/{userId}")
    public ResponseEntity<ApiResponse<List<ConversationResponse>>> getConversations(@PathVariable UUID userId) {
        ApiResponse<List<ConversationResponse>> response = ApiResponse.<List<ConversationResponse>>builder()
                .result(chatService.getUserConversations(userId))
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/history/{conversationId}")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getHistory(
            @PathVariable UUID conversationId) {

        ApiResponse<List<MessageResponse>> response =
                ApiResponse.<List<MessageResponse>>builder()
                        .result(chatService.getMessagesByConversation(conversationId))
                        .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<ApiResponse<ConversationResponse>> getConversation(
            @PathVariable UUID conversationId) {

        ApiResponse<ConversationResponse> response = ApiResponse.<ConversationResponse>builder()
                .result(chatService.getConversationById(conversationId))
                .build();

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/conversations/{conversationId}/read")
    public ResponseEntity<ApiResponse<Void>> markConversationAsRead(
            @PathVariable UUID conversationId,
            @RequestParam UUID userId) {

        chatService.markAllMessagesInConversationAsRead(conversationId, userId);

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .message("Conversation marked as read")
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/send-test")
    public ResponseEntity<ApiResponse<MessageResponse>> sendTest(
            @RequestBody MessageRequest messageRequest) {

        MessageResponse savedMessage = chatService.saveMessage(messageRequest);

        messagingTemplate.convertAndSendToUser(
                messageRequest.getRecipientId().toString(),
                "/queue/messages",
                savedMessage
        );

        ApiResponse<MessageResponse> response =
                ApiResponse.<MessageResponse>builder()
                        .message("Message sent and room created successfully")
                        .result(savedMessage)
                        .build();

        return ResponseEntity.status(201).body(response);
    }
}
