package org.rent.room.be.service;

import org.rent.room.be.entity.RentPackage;

import java.util.List;
import java.util.UUID;

public interface RentPackageService {

    RentPackage createRentPackage(RentPackage pkg);
    RentPackage getRentPackageById(UUID id);
    List<RentPackage> getAllRentPackages();
    RentPackage updateRentPackage(UUID id, RentPackage pkg);
    void deleteRentPackage(UUID id);
}
