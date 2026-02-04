package org.rent.room.be.event.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.rent.room.be.event.DomainEvent;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
public class MessageReceivedEvent implements DomainEvent {
    private final UUID messageId;
    private final UUID conversationId;
    private final UUID senderId;
    private final UUID recipientId;
    private final String senderName;
    private final String messagePreview;
    private final boolean isFromOwner;
    private final LocalDateTime occurredAt;

    public MessageReceivedEvent(UUID messageId, UUID conversationId, UUID senderId,
                                UUID recipientId, String senderName, String messagePreview,
                                boolean isFromOwner) {
        this.messageId = messageId;
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.recipientId = recipientId;
        this.senderName = senderName;
        this.messagePreview = messagePreview;
        this.isFromOwner = isFromOwner;
        this.occurredAt = LocalDateTime.now();
    }
}
