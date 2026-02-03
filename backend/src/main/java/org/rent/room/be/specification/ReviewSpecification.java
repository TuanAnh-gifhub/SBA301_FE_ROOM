package org.rent.room.be.specification;

import jakarta.persistence.criteria.Predicate;
import org.rent.room.be.entity.Review;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;


public class ReviewSpecification {

    public static Specification<Review> filterReviews(
            String comment,
            Integer rating,
            LocalDate startDate,
            LocalDate endDate
    ) {
     return (root,query,cb) ->{
         List<Predicate> predicates = new ArrayList<>();

         if(comment != null && !comment.isBlank()){
             predicates.add(cb.like(cb.lower(root.get("comment")), "%"+comment+"%"));
         }

         if(rating != null ){
             predicates.add(cb.equal(root.get("rating"), rating));
         }

         if(startDate != null){
             predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt").as(LocalDate.class),startDate));
         }

         if(endDate != null){
             predicates.add(cb.lessThanOrEqualTo(root.get("createdAt").as(LocalDate.class),endDate));
         }

         return cb.and(predicates.toArray(new Predicate[0]));
     };
    }

}