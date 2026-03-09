package org.rent.room.be.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.*;
import org.rent.room.be.base.BaseEntity;
import org.rent.room.be.constant.SlotStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@SuperBuilder
@Entity
@Table(name = "slots")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Slot extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "slot_id")
    UUID slotId;

    @Column(name = "start_time", nullable = false)
    LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    LocalDateTime endTime;

    @Column(name = "price", precision = 19, scale = 2)
    BigDecimal price;


    @Enumerated(EnumType.STRING)
    @Column(name = "slot_status")
    SlotStatus slotStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_copy_id")
    RoomCopy roomCopy;
}