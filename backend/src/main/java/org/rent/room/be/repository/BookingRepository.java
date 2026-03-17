package org.rent.room.be.repository;

import org.rent.room.be.constant.BookingStatus;
import org.rent.room.be.constant.BookingType;
import org.rent.room.be.entity.User;
import org.rent.room.be.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID>, JpaSpecificationExecutor<Booking> {

    @Query("""
            SELECT SUM(b.totalPrice)
            FROM Booking b
            WHERE b.bookingStatus = org.rent.room.be.constant.BookingStatus.COMPLETED
            AND b.createdAt BETWEEN :from AND :to
            """)
    BigDecimal sumRevenue(LocalDateTime from, LocalDateTime to);

    @Query("""
            SELECT COUNT(b)
            FROM Booking b
            WHERE b.createdAt BETWEEN :from AND :to
            """)
    long countByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    @Query("""
            SELECT COUNT(b)
            FROM Booking b
            WHERE b.bookingStatus = :status
            AND b.createdAt BETWEEN :from AND :to
            """)
    long countByStatusAndCreatedAtBetween(
            BookingStatus status,
            LocalDateTime from,
            LocalDateTime to
    );


    @Query("""
       SELECT COALESCE(SUM(b.totalPrice),0)
       FROM Booking b
       WHERE b.bookingStatus = org.rent.room.be.constant.BookingStatus.COMPLETED
       AND b.createdAt BETWEEN :start AND :end
       """)
    BigDecimal revenueToday(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("""
            SELECT DATE(b.createdAt), COALESCE(SUM(b.totalPrice),0)
            FROM Booking b
            WHERE b.bookingStatus = org.rent.room.be.constant.BookingStatus.COMPLETED
            AND b.createdAt >= :from
            GROUP BY DATE(b.createdAt)
            ORDER BY DATE(b.createdAt)
            """)
    List<Object[]> revenueLast7Days(LocalDateTime from);

    @Query("""
SELECT MONTH(b.createdAt), COALESCE(SUM(b.totalPrice),0)
FROM Booking b
WHERE b.bookingStatus = org.rent.room.be.constant.BookingStatus.COMPLETED
AND YEAR(b.createdAt) = :year
GROUP BY MONTH(b.createdAt)
ORDER BY MONTH(b.createdAt)
""")
    List<Object[]> revenueByMonth(int year);

    @Query("""
SELECT DAY(b.createdAt), COALESCE(SUM(b.totalPrice),0)
FROM Booking b
WHERE b.bookingStatus = org.rent.room.be.constant.BookingStatus.COMPLETED
AND YEAR(b.createdAt) = :year
AND MONTH(b.createdAt) = :month
GROUP BY DAY(b.createdAt)
ORDER BY DAY(b.createdAt)
""")
    List<Object[]> revenueByDay(int year, int month);



    @Query("""
SELECT COALESCE(SUM(b.totalPrice),0)
FROM Booking b
WHERE b.rentalArea.rentalAreaId IN :rentalAreaIds
AND b.createdAt BETWEEN :from AND :to
""")
    BigDecimal sumRevenueByRentalAreas(
            LocalDateTime from,
            LocalDateTime to,
            List<UUID> rentalAreaIds
    );

    @Query("""
SELECT COUNT(b)
FROM Booking b
WHERE b.rentalArea.rentalAreaId IN :rentalAreaIds
AND b.createdAt BETWEEN :from AND :to
""")
    long countByRentalAreasAndCreatedAtBetween(
            List<UUID> rentalAreaIds,
            LocalDateTime from,
            LocalDateTime to
    );

    @Query("""
            SELECT COUNT(b)
            FROM Booking b
            WHERE b.rentalArea.rentalAreaId IN :rentalAreaIds
            AND b.bookingStatus = :status
            AND b.createdAt BETWEEN :from AND :to
            """)
    long countByRentalAreasAndStatus(
            List<UUID> rentalAreaIds,
            BookingStatus status,
            LocalDateTime from,
            LocalDateTime to
    );

    @Query("""
            SELECT COALESCE(SUM(b.totalPrice), 0)
            FROM Booking b
            WHERE b.bookingStatus = org.rent.room.be.constant.BookingStatus.COMPLETED
            AND b.rentalArea.rentalAreaId IN :rentalAreaIds
            AND b.createdAt BETWEEN :start AND :end
            """)
    BigDecimal revenueTodayByOwner(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("rentalAreaIds") List<UUID> rentalAreaIds
    );

    @Query("""
            SELECT DATE(b.createdAt), COALESCE(SUM(b.totalPrice), 0)
            FROM Booking b
            WHERE b.bookingStatus = org.rent.room.be.constant.BookingStatus.COMPLETED
            AND b.rentalArea.rentalAreaId IN :rentalAreaIds
            AND b.createdAt >= :from
            GROUP BY DATE(b.createdAt)
            ORDER BY DATE(b.createdAt)
            """)
    List<Object[]> revenueLast7DaysByOwner(
            @Param("from") LocalDateTime from,
            @Param("rentalAreaIds") List<UUID> rentalAreaIds
    );

    @Query("""
            SELECT MONTH(b.createdAt), COALESCE(SUM(b.totalPrice), 0)
            FROM Booking b
            WHERE b.bookingStatus = org.rent.room.be.constant.BookingStatus.COMPLETED
            AND b.rentalArea.rentalAreaId IN :rentalAreaIds
            AND YEAR(b.createdAt) = :year
            GROUP BY MONTH(b.createdAt)
            ORDER BY MONTH(b.createdAt)
            """)
    List<Object[]> revenueByMonthByOwner(
            @Param("year") int year,
            @Param("rentalAreaIds") List<UUID> rentalAreaIds
    );

    @Query("""
            SELECT DAY(b.createdAt), COALESCE(SUM(b.totalPrice), 0)
            FROM Booking b
            WHERE b.bookingStatus = org.rent.room.be.constant.BookingStatus.COMPLETED
            AND b.rentalArea.rentalAreaId IN :rentalAreaIds
            AND YEAR(b.createdAt) = :year
            AND MONTH(b.createdAt) = :month
            GROUP BY DAY(b.createdAt)
            ORDER BY DAY(b.createdAt)
            """)
    List<Object[]> revenueByDayByOwner(
            @Param("year") int year,
            @Param("month") int month,
            @Param("rentalAreaIds") List<UUID> rentalAreaIds
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
