package org.rent.room.be.repository;

import org.rent.room.be.entity.RoomCopy;
import org.springframework.data.jpa.repository.JpaRepository;

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
      AND NOT EXISTS (
          SELECT 1 FROM Slot b
          WHERE b.roomCopy = rc
            AND b.startTime < :endTime
            AND b.endTime > :startTime
      )
""")
    List<RoomCopy> findAvailableRoomCopies(
            UUID roomId,
            LocalDateTime startTime,
            LocalDateTime endTime
    );
}
