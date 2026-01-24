package org.rent.room.be.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.rent.room.be.dto.request.packages.CreatePackageRequest;
import org.rent.room.be.dto.response.PackageResponse;
import org.rent.room.be.entity.Package;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PackageMapper {

    Package toEntity(CreatePackageRequest request);

    PackageResponse toResponse(Package pkg);

    List<PackageResponse> toResponseList(List<Package> pkgs);
}
