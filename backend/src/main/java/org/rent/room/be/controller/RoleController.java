package org.rent.room.be.controller;

import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.rent.room.be.base.ApiResponse;
import org.rent.room.be.dto.request.role.CreateRoleRequest;
import org.rent.room.be.dto.request.role.UpdateRoleRequest;
import org.rent.room.be.dto.response.RoleResponse;
import org.rent.room.be.service.RoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
@Tag(name = "3. Role")
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getAllRoles() {
        return ResponseEntity.ok(
                ApiResponse.<List<RoleResponse>>builder()
                        .code(200)
                        .message("Get all roles successfully")
                        .result(roleService.getAllRoles())
                        .build()
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RoleResponse>> createRole(
            @Valid @RequestBody CreateRoleRequest role
    ) {
        return ResponseEntity.ok(
                ApiResponse.<RoleResponse>builder()
                        .code(201)
                        .message("Role created successfully")
                        .result(roleService.createRole(role))
                        .build()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RoleResponse>> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest role
    ) {
        return ResponseEntity.ok(
                ApiResponse.<RoleResponse>builder()
                        .code(200)
                        .message("Role updated successfully")
                        .result(roleService.updateRole(id, role))
                        .build()
        );
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateRoleStatus(
            @PathVariable Long id,
            @RequestParam boolean active
    ) {
        roleService.updateRoleStatus(id, active);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .code(200)
                        .message(active ? "Role has been activated" : "Role has been deactivated")
                        .build()
        );
    }
}