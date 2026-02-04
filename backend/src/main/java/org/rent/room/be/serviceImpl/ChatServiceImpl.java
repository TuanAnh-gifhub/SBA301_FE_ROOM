package org.rent.room.be.serviceImpl;

import jakarta.transaction.Transactional;
import lombok.*;
import org.rent.room.be.dto.request.chat.MessageRequest;
import org.rent.room.be.dto.response.chat.MessageResponse;
import org.rent.room.be.entity.Conversation;
import org.rent.room.be.entity.Message;
import org.rent.room.be.entity.User;
import org.rent.room.be.repository.ConversationRepository;
import org.rent.room.be.repository.MessageRepository;
import org.rent.room.be.repository.UserRepository;
import org.rent.room.be.service.ChatService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {
    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    @Transactional
    public MessageResponse saveMessage(MessageRequest request) {
        User sender = userRepository.findById(request.getSenderId()).orElseThrow();
        User recipient = userRepository.findById(request.getRecipientId()).orElseThrow();
        Conversation conversation = conversationRepository.findById(request.getConversationId()).orElseThrow();

        Message newMessage = Message.builder()
                .messageBody(request.getContent())
                .sender(sender)
                .recipient(recipient)
                .conversation(conversation)
                .build();

        Message saved = messageRepository.save(newMessage);

        return MessageResponse.builder()
                .messageId(saved.getMessageId())
                .content(saved.getMessageBody())
                .senderName(sender.getUserName())
                .createdAt(LocalDateTime.now())
                .build();
    }
}