package org.rent.room.be.serviceImpl;

import jakarta.transaction.Transactional;
import lombok.*;
import org.rent.room.be.dto.request.chat.MessageRequest;
import org.rent.room.be.dto.response.chat.ConversationResponse;
import org.rent.room.be.dto.response.chat.MessageResponse;
import org.rent.room.be.entity.Conversation;
import org.rent.room.be.entity.Message;
import org.rent.room.be.entity.User;
import org.rent.room.be.mapper.ChatMapper;
import org.rent.room.be.repository.ConversationRepository;
import org.rent.room.be.repository.MessageRepository;
import org.rent.room.be.repository.UserRepository;
import org.rent.room.be.service.ChatService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final ChatMapper chatMapper;

    @Transactional
    @Override
    public MessageResponse saveMessage(MessageRequest request) {
        User sender = userRepository.findById(request.getSenderId()).orElseThrow();
        User recipient = userRepository.findById(request.getRecipientId()).orElseThrow();

        // Tìm hoặc tạo mới cuộc hội thoại
        Conversation conversation = conversationRepository
                .findBetweenUsers(sender.getUserId(), recipient.getUserId())
                .orElseGet(() -> conversationRepository.save(
                        Conversation.builder()
                                .sender(sender)
                                .recipient(recipient)
                                .conversationTitle(sender.getUserName() + " & " + recipient.getUserName())
                                .build()
                ));

        Message newMessage = Message.builder()
                .messageBody(request.getContent())
                .sender(sender)
                .recipient(recipient)
                .conversation(conversation)
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
    @Transactional
    public List<ConversationResponse> getUserConversations(UUID userId) {
        return conversationRepository.findAllBySenderUserIdOrRecipientUserIdOrderByUpdatedAtDesc(userId, userId)
                .stream()
                .map(conv -> {
                    // Xác định người kia là ai để lấy tên/ảnh
                    User otherUser = conv.getSender().getUserId().equals(userId) ? conv.getRecipient() : conv.getSender();

                    // Lấy tin nhắn cuối cùng
                    Message lastMsg = conv.getMessages().isEmpty() ? null :
                            conv.getMessages().getLast();

                    return ConversationResponse.builder()
                            .conversationId(conv.getConversationId())
                            .conversationTitle(otherUser.getUserName())
                            .lastMessage(lastMsg != null ? lastMsg.getMessageBody() : "Bắt đầu cuộc trò chuyện")
                            .lastSenderName(lastMsg != null ? lastMsg.getSender().getUserName() : "")
                            .updatedAt(conv.getUpdatedAt())
                            .build();
                })
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
                        .createdAt(msg.getCreatedAt()) // Lấy từ BaseEntity
                        .build())
                .toList();
    }

    @Override
    public ConversationResponse getConversationById(UUID conversationId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Phòng chat không tồn tại"));

        return chatMapper.toConversationResponse(conv);
    }

    @Override
    public List<ConversationResponse> getAllConversations(UUID userId) {
        // Tìm tất cả phòng mà user là sender HOẶC recipient
        List<Conversation> convs = conversationRepository.findAllBySender_UserIdOrRecipient_UserId(userId, userId);

        return convs.stream()
                .map(chatMapper::toConversationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAllMessagesInConversationAsRead(UUID conversationId, UUID readerId) {
        // 1. Tìm tất cả tin nhắn chưa đọc trong cuộc hội thoại mà readerId là người nhận
        List<Message> unreadMessages = messageRepository
                .findAllByConversationConversationIdAndRecipientUserIdAndIsReadFalse(conversationId, readerId);

        if (!unreadMessages.isEmpty()) {
            // 2. Cập nhật trạng thái
            unreadMessages.forEach(msg -> msg.setRead(true));

            // 3. Lưu hàng loạt vào DB
            messageRepository.saveAll(unreadMessages);

            // 4. (Tùy chọn) Gửi thông báo WebSocket cho người gửi biết tin nhắn đã được đọc
            // unreadMessages.forEach(msg -> messagingTemplate.convertAndSendToUser(...));
        }
    }
}