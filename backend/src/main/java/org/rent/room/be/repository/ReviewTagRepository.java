package org.rent.room.be.repository;

import org.rent.room.be.entity.ReviewTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ReviewTagRepository extends JpaRepository<ReviewTag, UUID> {
}