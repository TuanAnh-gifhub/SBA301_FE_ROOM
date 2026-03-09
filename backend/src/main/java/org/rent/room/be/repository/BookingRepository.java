package org.rent.room.be.repository;

import org.rent.room.be.constant.BookingStatus;
import org.rent.room.be.constant.BookingType;
import org.rent.room.be.entity.User;
import org.rent.room.be.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID>, JpaSpecificationExecutor<Booking> {

    List<Booking> findByBookingStatusAndCheckOutIsNotNullAndCheckOutLessThanEqual(
            BookingStatus bookingStatus,
            LocalDateTime checkOut
    );

    List<Booking> findByBookingStatusAndCheckOutIsNotNullAndCheckOutLessThanEqualAndEscrowReleasedAtIsNullAndDisputeFlagFalse(
            BookingStatus bookingStatus,
            LocalDateTime checkOut
    );

    Page<Booking> findByRentalArea_OwnerAndBookingStatusAndEscrowReleasedAtIsNull(
            User owner,
            BookingStatus bookingStatus,
            Pageable pageable
    );

    Page<Booking> findByBookingStatusAndEscrowReleasedAtIsNull(
            BookingStatus bookingStatus,
            Pageable pageable
    );
}
