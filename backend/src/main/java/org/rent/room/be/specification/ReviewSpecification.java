package org.rent.room.be.specification;

import jakarta.persistence.criteria.Predicate;
import org.rent.room.be.constant.ReviewStatus;
import org.rent.room.be.entity.Review;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ReviewSpecification {

    /**
     * Filter danh sach review cho trang rental area.
     *
     * @param rentalAreaId  bat buoc
     * @param rating        null = lay tat ca sao
     * @param hasMedia      null = lay tat ca, true = chi lay review co anh/video
     */
    public static Specification<Review> filterForRentalArea(
            UUID rentalAreaId,
            Integer rating,
            Boolean hasMedia
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Chi lay APPROVED va chua bi soft delete
            predicates.add(cb.equal(root.get("status"), ReviewStatus.APPROVED));
            predicates.add(cb.isNull(root.get("deletedAt")));

            // Loc theo rental area
            predicates.add(cb.equal(
                    root.get("rentalArea").get("rentalAreaId"),
                    rentalAreaId
            ));

            // Loc theo so sao (optional)
            if (rating != null) {
                predicates.add(cb.equal(root.get("rating"), rating));
            }

            // Loc chi review co media (optional)
            if (Boolean.TRUE.equals(hasMedia)) {
                // Subquery: review phai co it nhat 1 ReviewMedia
                var subquery = query.subquery(Long.class);
                var mediaRoot = subquery.from(
                        org.rent.room.be.entity.ReviewMedia.class
                );
                subquery.select(cb.count(mediaRoot))
                        .where(cb.equal(mediaRoot.get("review"), root));
                predicates.add(cb.greaterThan(subquery, 0L));
            }

            // Tranh duplicate khi LEFT JOIN
            assert query != null;
            query.distinct(true);

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}