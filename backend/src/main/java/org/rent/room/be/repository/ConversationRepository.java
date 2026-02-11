package org.rent.room.be.repository;

import org.rent.room.be.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    @Query("SELECT c FROM Conversation c WHERE " +
            "(c.sender.userId = :u1 AND c.recipient.userId = :u2) OR " +
            "(c.sender.userId = :u2 AND c.recipient.userId = :u1)")
    Optional<Conversation> findBetweenUsers(UUID u1, UUID u2);

    List<Conversation> findAllBySenderUserIdOrRecipientUserIdOrderByUpdatedAtDesc(UUID u1, UUID u2);

    List<Conversation> findAllBySender_UserIdOrRecipient_UserId(UUID userId, UUID userId1);
}