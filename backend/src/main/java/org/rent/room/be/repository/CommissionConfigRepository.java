package org.rent.room.be.repository;

import org.rent.room.be.entity.CommissionConfig;
import org.rent.room.be.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CommissionConfigRepository extends JpaRepository<CommissionConfig, UUID> {

    Optional<CommissionConfig> findByOwner(User owner);

    Optional<CommissionConfig> findByOwnerIsNull();

    List<CommissionConfig> findAllByOwnerIsNotNull();
}

