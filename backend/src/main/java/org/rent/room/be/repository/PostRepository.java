package org.rent.room.be.repository;

import org.rent.room.be.constant.PostStatus;
import org.rent.room.be.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID>, JpaSpecificationExecutor<Post> {

    boolean existsByRoom_RoomId(UUID roomId);

    List<Post> findAllByPostStatus(PostStatus postStatus);

    Optional<Post> findByPostIdAndPostStatus(UUID postId, PostStatus postStatus);

    List<Post> findByUser_UserIdOrderByCreatedAtDesc(UUID userId);

    List<Post> findByUser_UserIdAndPostStatusOrderByCreatedAtDesc(UUID userId, PostStatus status);

    Optional<Post> findByPostIdAndUser_UserId(UUID postId, UUID userId);

    Optional<Post> findByRoom_RoomIdAndUser_UserId(UUID roomId, UUID userId);

    Optional<Post> findByPostIdAndRoom_RentalArea_Owner_UserId(UUID postId, UUID ownerId);

    List<Post> findAllByPostStatusIn(Collection<PostStatus> statuses);

    Optional<Post> findFirstByRoom_RoomId(String roomId);

    @Query("""
    select p
    from Post p
    join p.room r
    join r.rentalArea ra
    where p.postStatus = :status
      and (:cityId is null or ra.city.cityId = :cityId)
      and (:categoryId is null or r.category.categoryId = :categoryId)
      and (
            :amenityIds is null
            or :amenityCount = (
                select count(distinct a2.amenityId)
                from Room r2
                join r2.amenities a2
                where r2 = r
                  and a2.amenityId in :amenityIds
            )
      )
""")
    Page<Post> findPublicFeed(
            @Param("status") PostStatus status,
            @Param("cityId") Long cityId,
            @Param("categoryId") Long categoryId,
            @Param("amenityIds") List<Long> amenityIds,
            @Param("amenityCount") long amenityCount,
            Pageable pageable
    );

}
