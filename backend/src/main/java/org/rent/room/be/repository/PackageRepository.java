package org.rent.room.be.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.rent.room.be.entity.Package;
import java.util.UUID;

@Repository
public interface PackageRepository extends JpaRepository<Package, UUID> {
}
