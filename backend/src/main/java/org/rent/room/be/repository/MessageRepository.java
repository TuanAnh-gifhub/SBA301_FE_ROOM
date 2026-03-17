package org.rent.room.be.repository;

import org.rent.room.be.constant.MessageStatus;
import org.rent.room.be.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    Page<Message> findByConversation_ConversationIdOrderByCreatedAtDesc(UUID conversationId, Pageable pageable);

    List<Message> findByConversationConversationIdOrderByCreatedAtAsc(UUID conversationId);

    List<Message> findByConversation_ConversationIdAndRecipient_UserIdAndStatusNot(UUID conversationId, UUID userId, MessageStatus messageStatus);
}
