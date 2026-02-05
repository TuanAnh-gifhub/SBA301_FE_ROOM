package org.rent.room.be.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.rent.room.be.base.ApiResponse;
import org.rent.room.be.dto.request.packages.RentPackageRequest;
import org.rent.room.be.dto.response.RentPackageResponse;
import org.rent.room.be.entity.RentPackage;
import org.rent.room.be.mapper.RentPackageMapper;
import org.rent.room.be.service.RentPackageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/packages")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Validated
@Tag(name = "4. Package")
public class PackageController {

    RentPackageService packageService;
    RentPackageMapper packageMapper;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RentPackageResponse>> createPackage(
            @Valid @RequestBody RentPackageRequest request) {

        RentPackage entity = packageMapper.toEntity(request);
        RentPackage created = packageService.createRentPackage(entity);
        RentPackageResponse response = packageMapper.toResponse(created);

        return ResponseEntity.ok(ApiResponse.<RentPackageResponse>builder()
                .code(201) // Hoặc 200 tùy bạn quy định
                .message("Package created successfully")
                .result(response)
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RentPackageResponse>>> list() {
        List<RentPackageResponse> responseList = packageMapper.toResponseList(packageService.getAllRentPackages());

        return ResponseEntity.ok(ApiResponse.<List<RentPackageResponse>>builder()
                .code(200)
                .message("Get all packages successfully")
                .result(responseList)
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RentPackageResponse>> get(@PathVariable UUID id) {
        RentPackageResponse response = packageMapper.toResponse(packageService.getRentPackageById(id));

        return ResponseEntity.ok(ApiResponse.<RentPackageResponse>builder()
                .code(200)
                .message("Get package detail successfully")
                .result(response)
                .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RentPackageResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody RentPackageRequest request) {

        RentPackage toUpdate = packageMapper.toEntity(request);
        RentPackage updated = packageService.updateRentPackage(id, toUpdate);
        RentPackageResponse response = packageMapper.toResponse(updated);

        return ResponseEntity.ok(ApiResponse.<RentPackageResponse>builder()
                .code(200)
                .message("Package updated successfully")
                .result(response)
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        packageService.deleteRentPackage(id);

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200)
                .message("Package deleted successfully")
                .build());
    }
}