package org.rent.room.be.service;

import org.rent.room.be.dto.request.role.CreateRoleRequest;
import org.rent.room.be.dto.request.role.UpdateRoleRequest;
import org.rent.room.be.dto.response.RoleResponse;

import java.util.List;

public interface RoleService {
    List<RoleResponse> getAllRoles();

    RoleResponse createRole(CreateRoleRequest role);

    RoleResponse updateRole(Long id, UpdateRoleRequest role);

    void updateRoleStatus(Long id, boolean active);
}