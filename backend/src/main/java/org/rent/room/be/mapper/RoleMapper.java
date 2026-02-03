package org.rent.room.be.mapper;

import org.mapstruct.Mapper;
import org.rent.room.be.dto.request.role.CreateRoleRequest;
import org.rent.room.be.dto.response.RoleResponse;
import org.rent.room.be.entity.Role;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    Role toRole(CreateRoleRequest request);

    RoleResponse toRoleResponse(Role role);

    List<RoleResponse> toRoleResponseList(List<Role> roles);
}