package org.rent.room.be.service;

import org.rent.room.be.dto.request.role.CreateRoleRequest;
import org.rent.room.be.dto.request.role.UpdateRoleRequest;
import org.rent.room.be.dto.response.RoleResponse;

import java.util.List;

public interface RoleService {
    List<RoleResponse> getAllActiveRoles();

    RoleResponse createRole(CreateRoleRequest role);

    RoleResponse updateRole(Long id, UpdateRoleRequest role);

    void softDeleteRole(Long id);
}