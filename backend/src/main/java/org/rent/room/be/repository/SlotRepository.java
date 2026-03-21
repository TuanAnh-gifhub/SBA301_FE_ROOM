package org.rent.room.be.repository;

import org.rent.room.be.constant.BookingType;
import org.rent.room.be.entity.RoomCopy;
import org.rent.room.be.entity.Slot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Repository
public interface SlotRepository extends JpaRepository<Slot, UUID> {
    @Query("""
    SELECT s
    FROM Slot s
    WHERE s.roomCopy = :roomCopy
      AND s.startTime < :endTime
      AND s.endTime > :startTime
""")
    List<Slot> findOverlappingSlots(
            @Param("roomCopy") RoomCopy roomCopy,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    // Find conflicting bookings by roomCode
    @Query("""
    SELECT s
    FROM Slot s
    WHERE s.roomCopy.roomCode = :roomCode
      AND s.startTime < :endTime
      AND s.endTime > :startTime
      AND s.booking.bookingId != COALESCE(:excludeBookingId, s.booking.bookingId)
      AND s.booking.bookingStatus IN ('BOOKED', 'COMPLETED')
    """)
    List<Slot> findConflictingSlots(
            @Param("roomCode") String roomCode,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("excludeBookingId") UUID excludeBookingId
    );




    @Query("""
    SELECT COUNT(s) > 0 FROM Slot s
    JOIN s.roomCopy rc
    JOIN rc.room r
    WHERE r.roomId = :roomId
      AND s.slotId <> :excludeSlotId
      AND s.slotStatus <> 'CANCELLED'
      AND s.startTime < :newEnd
      AND s.endTime > :newStart
    """)
    boolean existsConflictByRoom(
            @Param("roomId") UUID roomId,
            @Param("newStart") LocalDateTime newStart,
            @Param("newEnd") LocalDateTime newEnd,
            @Param("excludeSlotId") UUID excludeSlotId
    );
}
