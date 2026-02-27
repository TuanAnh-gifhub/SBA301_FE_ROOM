package org.rent.room.be.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "intent_slots")
public class IntentSlot {

    @Id
    @Column(name = "intent_slot_id")
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID intentSlotId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_intent_id")
    private BookingIntent bookingIntent;

    @ManyToOne
    RoomCopy roomCopy;

    LocalDateTime startTime;
    LocalDateTime endTime;
}
