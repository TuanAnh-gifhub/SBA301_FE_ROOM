package org.rent.room.be.specification;


import jakarta.persistence.criteria.Predicate;
import org.rent.room.be.constant.PostStatus;
import org.rent.room.be.entity.Post;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class PostSpecification {

    public static Specification<Post> filter(String title, String content, LocalDate fromDate, LocalDate toDate) {

        return (root, query, cb) -> {
           List<Predicate> predicates = new ArrayList<>();

           if(title != null && !title.isBlank()){
               predicates.add(cb.like(cb.function("", String.class,cb.lower(root.get("title"))
               ),"%"+ title.toLowerCase() +"%"));
           }

           if(content != null && !content.isBlank()){
               predicates.add(cb.like(cb.function("unaccent",String.class,cb.lower(root.get("content"))
               ), "%"+ content.toLowerCase() +"%"));
           }

           if(fromDate != null ){
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate));

           }

           if(toDate != null){
               predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), toDate));
           }

            predicates.add(cb.equal(root.get("postStatus"), PostStatus.PUBLISHED));


            return cb.and(predicates.toArray(new Predicate[0]));
        };

    }
}
