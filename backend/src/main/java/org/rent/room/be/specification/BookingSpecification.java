package org.rent.room.be.specification;

import jakarta.persistence.criteria.Predicate;
import org.rent.room.be.constant.BookingStatus;
import org.rent.room.be.entity.Booking;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


public class BookingSpecification {

    public static Specification<Booking> filterBookings(
            UUID rentalAreaId,
            BookingStatus bookingStatus,
            LocalDate fromDate,
            LocalDate toDate
    ) {
        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();


            if (rentalAreaId != null) {
                predicates.add(
                        cb.equal(
                                root.get("rentalArea").get("rentalAreaId"),
                                rentalAreaId
                        )
                );
            }


            if (bookingStatus != null) {
                predicates.add(
                        cb.equal(root.get("bookingStatus"), bookingStatus)
                );
            }


            if (fromDate != null && toDate != null) {

                LocalDateTime from = fromDate.atStartOfDay();
                LocalDateTime to = toDate.atTime(23, 59, 59);

                predicates.add(
                        cb.and(
                                cb.lessThanOrEqualTo(root.get("checkIn"), to),
                                cb.greaterThanOrEqualTo(root.get("checkOut"), from)
                        )
                );
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Booking> filter(
            BookingStatus bookingStatus,
            String keyword,
            LocalDate from,
            LocalDate to
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // bookingStatus
            if (bookingStatus != null) {
                predicates.add(
                        cb.equal(
                                root.get("bookingStatus"),
                                bookingStatus
                        )
                );
            }

            // keyword (ví dụ search theo note)
            if (keyword != null && !keyword.isBlank()) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("note")),
                                "%" + keyword.toLowerCase() + "%"
                        )
                );
            }

            // from date
            if (from != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("createdAt"),
                                from.atStartOfDay()
                        )
                );
            }

            // to date
            if (to != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("createdAt"),
                                to.atTime(LocalTime.MAX)
                        )
                );
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

