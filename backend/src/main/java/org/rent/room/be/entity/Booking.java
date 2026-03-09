package org.rent.room.be.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.*;
import org.rent.room.be.base.BaseEntity;
import org.rent.room.be.constant.BookingStatus;
import org.rent.room.be.constant.BookingType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Table(name = "bookings")
@Entity
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Booking extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "booking_id")
    UUID bookingId;

    @Column(name = "booking_title")
    private String bookingTitle;

    @Column(name = "booking_status", length = 20)
    BookingStatus bookingStatus;

    @Column(name = "total_price", precision = 19, scale = 2)
    BigDecimal totalPrice;

    @Column(name = "note", length = 500)
    String note;

    @Column(name = "start_time_booking")
    private LocalDateTime startTime;

    @Column(name = "end_time_booking")
    private LocalDateTime endTime;

    @Column(name = "check_in")
    LocalDateTime checkIn;

    @Column(name = "check_out")
    LocalDateTime checkOut;

    @Column(name = "escrow_released_at")
    LocalDateTime escrowReleasedAt;

    @Column(name = "dispute_flag")
    Boolean disputeFlag;

    @Column(name = "dispute_note", length = 500)
    String disputeNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "renter_id")
    User renter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id")
    Wallet wallet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id")
    Review review;

    @OneToMany(mappedBy = "booking", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    List<Slot> slots;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_type")
     BookingType bookingType;

    @OneToMany(mappedBy = "booking", fetch = FetchType.LAZY)
    private List<BookingQR> bookingQRs;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rental_area_id")
    private RentalArea rentalArea;

}