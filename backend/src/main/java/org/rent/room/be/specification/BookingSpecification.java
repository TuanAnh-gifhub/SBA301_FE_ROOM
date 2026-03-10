package org.rent.room.be.specification;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.rent.room.be.constant.BookingStatus;
import org.rent.room.be.entity.Booking;
import org.rent.room.be.entity.User;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


public class BookingSpecification {

    public static Specification<Booking> filterBookingsByUserId(
            UUID userId,
            BookingStatus bookingStatus,
            String keyword,
            LocalDate fromDate,
            LocalDate toDate
    ) {
        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            System.err.println("user id trong spec" + userId);


            if (userId != null) {

                Join<Booking, User> renterJoin = root.join("renter");

                predicates.add(
                        cb.equal(
                                renterJoin.get("userId"),
                                userId
                        )
                );
            }


            if (bookingStatus != null) {
                predicates.add(
                        cb.equal(root.get("bookingStatus"), bookingStatus)
                );
            }

            if (keyword != null && !keyword.isBlank()) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("bookingTitle")),
                                "%" + keyword.toLowerCase() + "%"
                        )
                );
            }

            if (fromDate != null && toDate != null) {

                LocalDateTime from = fromDate.atStartOfDay();
                LocalDateTime to = toDate.atTime(23, 59, 59);

                predicates.add(
                        cb.and(
                                cb.lessThanOrEqualTo(root.get("startTime"), to),
                                cb.greaterThanOrEqualTo(root.get("endTime"), from)
                        )
                );
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }


    public static Specification<Booking> filterBookingsByRentalId(
            UUID rentalAreaId,
            BookingStatus bookingStatus,
            String keyword,
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

            if (keyword != null && !keyword.isBlank()) {

                Join<Booking, User> renterJoin = root.join("renter");

                predicates.add(
                        cb.like(
                                cb.lower(renterJoin.get("userName")),
                                "%" + keyword.toLowerCase() + "%"
                        )
                );
            }


            if (fromDate != null && toDate != null) {

                LocalDateTime from = fromDate.atStartOfDay();
                LocalDateTime to = toDate.atTime(23, 59, 59);

                predicates.add(
                        cb.and(
                                cb.lessThanOrEqualTo(root.get("startTime"), to),
                                cb.greaterThanOrEqualTo(root.get("endTime"), from)
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


            if (bookingStatus != null) {
                predicates.add(
                        cb.equal(
                                root.get("bookingStatus"),
                                bookingStatus
                        )
                );
            }

            if (keyword != null && !keyword.isBlank()) {
                predicates.add(
                        cb.like(
                                cb.lower(root.get("title")),
                                "%" + keyword.toLowerCase() + "%"
                        )
                );
            }


            if (from != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("createdAt"),
                                from.atStartOfDay()
                        )
                );
            }


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

