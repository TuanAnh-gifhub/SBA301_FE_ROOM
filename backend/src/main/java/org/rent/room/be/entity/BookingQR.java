package org.rent.room.be.entity;

import jakarta.persistence.*;
import lombok.*;
import org.rent.room.be.constant.QRType;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "booking_qr_code")
public class BookingQR {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "booking_qr_id")
    private UUID bookingQrId;

    @Column(name = "qr_token")
    private String qrToken;

    @Enumerated(EnumType.STRING)
    private QRType qrType;


    @Column(name ="expire_at")
    private LocalDateTime expireAt;

    @Column(name = "check_in_at")
    private LocalDateTime checkInAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;
}
