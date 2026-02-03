package org.rent.room.be.repository;

import org.rent.room.be.entity.BookingQR;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BookingQRRepository extends JpaRepository<BookingQR, UUID> {
}
