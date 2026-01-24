package org.rent.room.be.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.rent.room.be.base.ApiResponse;
import org.rent.room.be.dto.request.packages.CreatePackageRequest;
import org.rent.room.be.dto.response.PackageResponse;
import org.rent.room.be.entity.Package;
import org.rent.room.be.mapper.PackageMapper;
import org.rent.room.be.service.PackageService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@RestController
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/packages")
@Validated
public class PackageController {

    PackageService packageService;
    PackageMapper packageMapper;

    @PostMapping
    public ResponseEntity<ApiResponse<PackageResponse>> createPackage(@Valid @RequestBody CreatePackageRequest request) {
        Package entity = packageMapper.toEntity(request);
        Package created = packageService.createPackage(entity);
        PackageResponse response = packageMapper.toResponse(created);
        return ResponseEntity.created(URI.create("/api/packages/" + created.getPackageId()))
                .body(ApiResponse.<PackageResponse>builder().code(200).message("Created").result(response).build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PackageResponse>>> list() {
        List<Package> pkgs = packageService.getAllPackages();
        return ResponseEntity.ok(ApiResponse.<List<PackageResponse>>builder()
                .code(200)
                .message("OK")
                .result(packageMapper.toResponseList(pkgs))
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PackageResponse>> get(@PathVariable UUID id) {
        Package pkg = packageService.getPackageById(id);
        return ResponseEntity.ok(ApiResponse.<PackageResponse>builder().code(200).message("OK").result(packageMapper.toResponse(pkg)).build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PackageResponse>> update(@PathVariable UUID id, @Valid @RequestBody CreatePackageRequest request) {
        Package toUpdate = packageMapper.toEntity(request);
        Package updated = packageService.updatePackage(id, toUpdate);
        return ResponseEntity.ok(ApiResponse.<PackageResponse>builder().code(200).message("Updated").result(packageMapper.toResponse(updated)).build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        packageService.deletePackage(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().code(200).message("Deleted").result(null).build());
    }
}
