package org.rent.room.be.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.rent.room.be.base.ApiResponse;
import org.rent.room.be.base.PageResponse;
import org.rent.room.be.dto.request.auth.ResetPasswordRequest;
import org.rent.room.be.dto.request.user.CreateUsersRequest;
import org.rent.room.be.dto.request.user.UpdateUserRequest;
import org.rent.room.be.dto.request.user.UpdateUserStatusRequest;
import org.rent.room.be.dto.response.UserResponse;
import org.rent.room.be.service.EmailService;
import org.rent.room.be.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RequiredArgsConstructor
@RestController
@FieldDefaults(level = AccessLevel.PACKAGE, makeFinal = true)
@RequestMapping("/users")
@Tag(name = "2. User")
public class UserController {

    UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(
                ApiResponse.<PageResponse<UserResponse>>builder()
                        .code(200)
                        .message("Get users success")
                        .result(userService.getAllUsers(page - 1, size, role, active, keyword))
                        .build()
        );
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<?>> getProfileUser() {
        return ResponseEntity.ok(
                ApiResponse.<UserResponse>builder()
                        .code(200)
                        .message("Get my info successfully")
                        .result(userService.getProfileUser())
                        .build()
        );
    }



    @PostMapping
    public ResponseEntity<ApiResponse<?>> createUser(@RequestBody CreateUsersRequest user) {
        UserResponse users = userService.createUser(user);
        return ResponseEntity.ok(
                ApiResponse.<UserResponse>builder()
                        .code(200)
                        .message("Create user successfully")
                        .result(users)
                        .build()
        );
    }



    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> updateUser(
            @PathVariable UUID id,
            @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<UserResponse>builder()
                        .code(200)
                        .message("Cập nhật thông tin thành công")
                        .result(userService.updateUser(id, request))
                        .build()
        );
    }

    /* ===================== PATCH ===================== */

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> updateStatus(
            @PathVariable UUID id,
            @RequestBody UpdateUserStatusRequest statusRequest) {
        userService.updateStatus(id, statusRequest.getStatus());
        return ResponseEntity.ok(
                ApiResponse.builder()
                        .code(200)
                        .message("Update status user successfully")
                        .build()
        );
    }
}
