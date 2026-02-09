package org.rent.room.be.specification;

import jakarta.persistence.criteria.Predicate;
import org.rent.room.be.entity.Booking;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;


public class BookingSpecification {

    public static Specification<Booking> filter(
            String bookingStatus,
            String keyword,
            LocalDate from,
            LocalDate to
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // bookingStatus
            if (bookingStatus != null && !bookingStatus.isBlank()) {
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

