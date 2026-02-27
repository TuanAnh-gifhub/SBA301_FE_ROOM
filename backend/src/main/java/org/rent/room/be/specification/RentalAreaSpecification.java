package org.rent.room.be.specification;

import jakarta.persistence.criteria.Predicate;
import org.rent.room.be.entity.RentalArea;
import org.springframework.data.jpa.domain.Specification;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class RentalAreaSpecification {


    public static Specification<RentalArea> filter(
            String address,
            String renterAreaName,
            LocalDate fromDate,
            LocalDate toDate
    ) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (address != null && !address.isBlank()) {
                predicates.add(cb.like(
                                cb.function("unaccent",
                                        String.class,
                                        cb.lower(root.get("address"))
                                ), "%" + address.toLowerCase() + "%"
                        )
                );
            }

            if(renterAreaName != null && !renterAreaName.isBlank()){
                predicates.add(cb.like(
                        cb.function("unaccent",
                                String.class,
                                cb.lower(root.get("renterAreaName"))
                        ), "%" + renterAreaName.toLowerCase() + "%"
                ));
            }
            if (fromDate != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("createdAt"),
                                fromDate.atStartOfDay()
                        )
                );
            }

            if (toDate != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("createdAt"),
                                toDate.atTime(LocalTime.MAX)
                        )
                );
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
