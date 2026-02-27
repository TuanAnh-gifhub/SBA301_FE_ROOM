package org.rent.room.be.entity;

import jakarta.persistence.*;
import lombok.*;
import org.rent.room.be.constant.BookingIntentStatus;
import org.rent.room.be.constant.BookingType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "booking_intent")
public class BookingIntent {

    @Id
    @Column(name = "booking_intent_id")
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID bookingIntentId;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    @Column(name = "title", length = 100)
    private String title;

    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "number_of_months")
    private Integer numberOfMonths;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Enumerated(EnumType.STRING)
    private BookingIntentStatus status;

    @Enumerated(EnumType.STRING)
    private BookingType bookingType;

    @Column( name = "preview_price", precision = 19, scale = 2)
    private BigDecimal previewPrice;

    @OneToMany(mappedBy = "bookingIntent",fetch = FetchType.LAZY, cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<IntentSlot> slots;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;
}
