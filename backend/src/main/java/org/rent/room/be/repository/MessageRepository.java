package org.rent.room.be.repository;

import org.rent.room.be.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByConversationConversationIdOrderByCreatedAtAsc(UUID conversationId);


    List<Message> findAllByConversationConversationIdAndRecipientUserIdAndIsReadFalse(UUID conversationId, UUID readerId);
}
