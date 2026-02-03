package org.rent.room.be.serviceImpl;

import lombok.RequiredArgsConstructor;
import org.rent.room.be.dto.request.role.CreateRoleRequest;
import org.rent.room.be.dto.request.role.UpdateRoleRequest;
import org.rent.room.be.dto.response.RoleResponse;
import org.rent.room.be.entity.Role;
import org.rent.room.be.exception.AppException;
import org.rent.room.be.exception.ErrorCode;
import org.rent.room.be.mapper.RoleMapper;
import org.rent.room.be.repository.RoleRepository;
import org.rent.room.be.service.RoleService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;

    @Override
    public List<RoleResponse> getAllActiveRoles() {
        return roleMapper.toRoleResponseList(roleRepository.findAllByActiveTrue());
    }

    @Override
    public RoleResponse createRole(CreateRoleRequest createRoleRequest) {
        Role role = Role.builder()
                .roleName(createRoleRequest.getRoleName())
                .description(createRoleRequest.getDescription())
                .active(true).build();
        return roleMapper.toRoleResponse(roleRepository.save(role));
    }

    @Override
    public RoleResponse updateRole(Long id, UpdateRoleRequest roleDetails) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        role.setRoleName(roleDetails.getRoleName());
        role.setDescription(roleDetails.getDescription());
        return roleMapper.toRoleResponse(roleRepository.save(role));
    }

    @Override
    public void softDeleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        role.setActive(false);
        roleRepository.save(role);
    }
}