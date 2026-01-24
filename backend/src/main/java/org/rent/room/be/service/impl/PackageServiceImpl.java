package org.rent.room.be.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.rent.room.be.entity.Package;
import org.rent.room.be.exception.AppException;
import org.rent.room.be.exception.ErrorCode;
import org.rent.room.be.repository.PackageRepository;
import org.rent.room.be.service.PackageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PackageServiceImpl implements PackageService {

    PackageRepository packageRepository;

    @Override
    @Transactional
    public Package createPackage(Package pkg) {
        log.debug("Creating package: {}", pkg);
        if (pkg == null) throw new AppException(ErrorCode.INVALID_PACKAGE);

        if (pkg.getPackageName() == null || pkg.getPackageName().trim().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_PACKAGE);
        }

        // price can be 0.0 meaning free package; validate negative values
        if (pkg.getPrice() < 0) throw new AppException(ErrorCode.INVALID_PACKAGE);
        if (pkg.getDurationDays() < 0) throw new AppException(ErrorCode.INVALID_PACKAGE);

        Package saved = packageRepository.save(pkg);
        log.info("Created package with id={}", saved.getPackageId());
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public Package getPackageById(UUID id) {
        Objects.requireNonNull(id, "id must not be null");
        return packageRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PACKAGE_NOT_FOUND));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Package> getAllPackages() {
        return packageRepository.findAll();
    }

    @Override
    @Transactional
    public Package updatePackage(UUID id, Package pkg) {
        Objects.requireNonNull(id, "id must not be null");
        if (pkg == null) throw new AppException(ErrorCode.INVALID_PACKAGE);

        Package existing = packageRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PACKAGE_NOT_FOUND));

        if (pkg.getPackageName() != null && !pkg.getPackageName().trim().isEmpty()) {
            existing.setPackageName(pkg.getPackageName());
        }

        // allow price to be updated to zero; only reject negative updates
        if (pkg.getPrice() >= 0) {
            existing.setPrice(pkg.getPrice());
        }

        if (pkg.getDurationDays() >= 0) {
            existing.setDurationDays(pkg.getDurationDays());
        }

        Package updated = packageRepository.save(existing);
        log.info("Updated package id={}", updated.getPackageId());
        return updated;
    }

    @Override
    @Transactional
    public void deletePackage(UUID id) {
        Objects.requireNonNull(id, "id must not be null");
        Package existing = packageRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PACKAGE_NOT_FOUND));
        packageRepository.delete(existing);
        log.info("Deleted package id={}", id);
    }
}
