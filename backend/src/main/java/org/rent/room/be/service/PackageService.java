package org.rent.room.be.service;

import org.rent.room.be.entity.Package;

import java.util.List;
import java.util.UUID;

public interface PackageService {

    /**
     * Create a new Package
     * @param pkg package entity to create
     * @return created package
     */
    Package createPackage(Package pkg);

    /**
     * Get a package by id
     * @param id package uuid
     * @return found package
     */
    Package getPackageById(UUID id);

    /**
     * Get all packages
     * @return list of packages
     */
    List<Package> getAllPackages();

    /**
     * Update existing package
     * @param id package id
     * @param pkg package data to update
     * @return updated package
     */
    Package updatePackage(UUID id, Package pkg);

    /**
     * Delete package by id
     * @param id package id
     */
    void deletePackage(UUID id);
}
