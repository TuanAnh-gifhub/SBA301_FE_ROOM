package org.rent.room.be.repository;

import org.rent.room.be.constant.RoomStatus;
import org.rent.room.be.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID> {
    @Query("""
        select r
        from Room r
        where r.roomStatus <> org.rent.room.be.constant.RoomStatus.INACTIVE
    """)
    List<Room> findAllNotInactive();
@Query("""
    select r
    from Room r
    where r.rentalArea.owner.userId = :userId
""")
List<Room> findAllRoomsByOwnerId(@Param("userId") UUID userId);

    @Query("""
    select r
    from Room r
    where r.roomStatus <> org.rent.room.be.constant.RoomStatus.INACTIVE
      and r.rentalArea.rentalAreaId = :rentalAreaId
    """)
    List<Room> findByRentalAreaIdNotInactive(@Param("rentalAreaId") UUID rentalAreaId);

    /**
     * Đếm tổng số phòng theo owner (mọi trạng thái).
     */
    @Query("""
            SELECT COUNT(r)
            FROM Room r
            WHERE r.rentalArea.owner.userId = :ownerId
            """)
    long countByOwnerId(@Param("ownerId") UUID ownerId);

    /**
     * Đếm số phòng theo owner và trạng thái cụ thể.
     */
    @Query("""
            SELECT COUNT(r)
            FROM Room r
            WHERE r.rentalArea.owner.userId = :ownerId
              AND r.roomStatus = :status
            """)
    long countByOwnerIdAndStatus(
            @Param("ownerId") UUID ownerId,
            @Param("status") RoomStatus status
    );

    List<Room> findByRentalArea_RentalAreaId(UUID rentalAreaId);

    @Query("""
    select count(r) > 0
    from Room r
    where r.rentalArea.rentalAreaId = :rentalAreaId
      and r.roomStatus <> org.rent.room.be.constant.RoomStatus.INACTIVE
""")
    boolean existsActiveRoomByRentalAreaId(@Param("rentalAreaId") UUID rentalAreaId);
}
