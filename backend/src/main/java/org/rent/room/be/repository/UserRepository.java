package org.rent.room.be.repository;

import org.rent.room.be.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u JOIN FETCH u.role WHERE u.email = :email")
    Optional<User> findByEmailWithRole(@Param("email") String email);

    boolean existsByEmail(String email);

    Page<User> findAll(Specification<User> spec, Pageable pageable);

    long countByCreatedAtAfter(LocalDateTime startDate);

    long countByRole_RoleNameAndCreatedAtAfter(String roleName, LocalDateTime startDate);

    List<User> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Modifying
    @Transactional
    @Query(value = "UPDATE users SET created_at = :createdAt WHERE user_id = :id", nativeQuery = true)
    void updateCreatedAt(@Param("id") java.util.UUID id, @Param("createdAt") java.time.LocalDateTime createdAt);
}
