package org.rent.room.be.serviceImpl;

import jakarta.transaction.Transactional;
import lombok.*;
import org.rent.room.be.constant.MessageStatus;
import org.rent.room.be.dto.request.chat.MessageRequest;
import org.rent.room.be.dto.response.chat.ConversationResponse;
import org.rent.room.be.dto.response.chat.MessageResponse;
import org.rent.room.be.dto.response.chat.ReadReceiptResponse;
import org.rent.room.be.entity.Conversation;
import org.rent.room.be.entity.Message;
import org.rent.room.be.entity.User;
import org.rent.room.be.mapper.ChatMapper;
import org.rent.room.be.repository.ConversationRepository;
import org.rent.room.be.repository.MessageRepository;
import org.rent.room.be.repository.UserRepository;
import org.rent.room.be.service.ChatService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final ChatMapper chatMapper;

    @Transactional
    @Override
    public MessageResponse saveMessage(MessageRequest request) {
        User sender = userRepository.findById(request.getSenderId()).orElseThrow(() -> new RuntimeException("Người gửi không tồn tại"));
        User recipient = userRepository.findById(request.getRecipientId()).orElseThrow(() -> new RuntimeException("Người nhận không tồn tại"));

        Conversation conversation;

        if (request.getConversationId() != null) {
            conversation = conversationRepository.findById(request.getConversationId())
                    .orElseThrow(() -> new RuntimeException("Cuộc hội thoại không tồn tại"));
        }
        else {
            conversation = conversationRepository
                    .findBetweenUsers(sender.getUserId(), recipient.getUserId())
                    .orElseGet(() -> conversationRepository.save(
                            Conversation.builder()
                                    .user1(sender)
                                    .user2(recipient)
                                    .conversationTitle(sender.getUserName() + " & " + recipient.getUserName())
                                    .build()
                    ));
        }

        Message newMessage = Message.builder()
                .messageBody(request.getContent())
                .sender(sender)
                .recipient(recipient)
                .conversation(conversation)
                .status(MessageStatus.SENT)
                .createdAt(LocalDateTime.now())
                .build();

        Message saved = messageRepository.save(newMessage);

        // Đừng quên cập nhật updatedAt của Conversation để danh sách chat nhảy lên đầu
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        return MessageResponse.builder()
                .messageId(saved.getMessageId())
                .content(saved.getMessageBody())
                .senderName(sender.getUserName())
                .conversationId(conversation.getConversationId())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Override
    public List<ConversationResponse> getUserConversations(UUID userId) {
        return conversationRepository
                .findAllByUser1UserIdOrUser2UserIdOrderByUpdatedAtDesc(userId, userId)
                .stream()
                .map(chatMapper::toConversationResponse)
                .toList();
    }

    @Override
    public List<MessageResponse> getMessagesByConversation(UUID conversationId) {
        // 1. Kiểm tra xem cuộc hội thoại có tồn tại không (Optional)
        if (!conversationRepository.existsById(conversationId)) {
            throw new RuntimeException("Conversation not found");
        }

        // 2. Lấy danh sách tin nhắn từ Repository, sắp xếp theo thời gian tăng dần (cũ đến mới)
        return messageRepository.findByConversationConversationIdOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(msg -> MessageResponse.builder()
                        .messageId(msg.getMessageId())
                        .conversationId(msg.getConversation().getConversationId())
                        .content(msg.getMessageBody())
                        .senderName(msg.getSender().getUserName())
                        .senderId(msg.getSender().getUserId())
                        .createdAt(msg.getCreatedAt())
                        .status(msg.getStatus())
                        .build())
                .toList();
    }

    @Override
    public ConversationResponse getConversationById(UUID conversationId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Phòng chat không tồn tại"));

        return chatMapper.toConversationResponse(conv);
    }

    @Transactional
    public void markAllMessagesInConversationAsRead(UUID conversationId, UUID userId) {
        System.out.println("DEBUG: Bat dau danh dau da doc cho conversation: " + conversationId);

        List<Message> unreadMessages = messageRepository
                .findByConversation_ConversationIdAndRecipient_UserIdAndStatusNot(conversationId, userId, MessageStatus.READ);

        System.out.println("DEBUG: So luong tin nhan chua doc tim thay: " + unreadMessages.size());

        if (unreadMessages.isEmpty()) return;

        unreadMessages.forEach(msg -> {
            msg.setStatus(MessageStatus.READ);
            msg.setReadAt(LocalDateTime.now());
        });
        messageRepository.saveAll(unreadMessages);

        // FIX: Lay senderId tu tin nhan dau tien de thong bao cho ho
        UUID senderId = unreadMessages.get(0).getSender().getUserId();

        System.out.println("DEBUG: Dang gui ReadReceipt toi User (Sender): " + senderId);

        messagingTemplate.convertAndSendToUser(
                senderId.toString(),
                "/queue/read-receipt",
                new ReadReceiptResponse(conversationId, userId)
        );

        System.out.println("DEBUG: Da gui tin hieu WebSocket thanh cong");
    }
}