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
    @Query("""
            SELECT rc
            FROM RoomCopy rc
            WHERE rc.room.roomId = :roomId
            AND rc.roomCopyStatus = 'AVAILABLE'
            AND rc.roomCopyId NOT IN (
                SELECT s.roomCopy.roomCopyId
                FROM Slot s
                WHERE s.slotStatus = 'BOOKED'
                AND (
                    s.startTime < :endTime
                    AND s.endTime > :startTime
                )
            )
            """)
    List<RoomCopy> findAvailableRoomCopies(
            UUID roomId,
            LocalDateTime startTime,
            LocalDateTime endTime
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT rc
            FROM RoomCopy rc
            WHERE rc.room.roomId = :roomId
            AND rc.roomCopyStatus = 'AVAILABLE'
            AND rc.roomCopyId NOT IN (
                SELECT s.roomCopy.roomCopyId
                FROM Slot s
                WHERE s.slotStatus = 'BOOKED'
                AND (
                    s.startTime < :endTime
                    AND s.endTime > :startTime
                )
            )
            """)
    List<RoomCopy> findAvailableRoomCopiesForUpdate(
            UUID roomId,
            LocalDateTime startTime,
            LocalDateTime endTime
    );


}
