package org.rent.room.be.repository;

import jakarta.persistence.LockModeType;
import org.rent.room.be.entity.RoomCopy;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface RoomCopyRepository extends JpaRepository<RoomCopy, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT rc
            FROM RoomCopy rc
            WHERE rc.room.roomId = :roomId
            AND (
                  rc.roomCopyStatus = 'AVAILABLE'
               OR (rc.roomCopyStatus = 'HOLD'
                   AND rc.heldUntil < :now)
            )
            AND NOT EXISTS (
                SELECT 1 FROM Slot s
                WHERE s.roomCopy = rc
                  AND s.startTime < :endTime
                  AND s.endTime > :startTime
            )
            """)
    List<RoomCopy> findHoldableRoomCopies(
            UUID roomId,
            LocalDateTime startTime,
            LocalDateTime endTime,
            LocalDateTime now
    );

    @Query("""
    SELECT rc
    FROM RoomCopy rc
    WHERE rc.roomCopyStatus = 'HOLD'
      AND rc.heldUntil <= :now
""")
    List<RoomCopy> findExpiredHeldRooms(
            LocalDateTime now
    );
}
