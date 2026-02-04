package org.rent.room.be.controller;

import lombok.RequiredArgsConstructor;
import org.rent.room.be.dto.request.chat.MessageRequest;
import org.rent.room.be.dto.response.chat.MessageResponse;
import org.rent.room.be.service.ChatService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
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
}