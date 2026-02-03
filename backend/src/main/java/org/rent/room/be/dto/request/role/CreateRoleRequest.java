package org.rent.room.be.dto.request.role;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateRoleRequest {

    @NotBlank(message = "ROLE_NAME_REQUIRED")
    @Size(min = 3, max = 50, message = "ROLE_NAME_INVALID")
    String roleName;

    @Size(max = 255, message = "DESCRIPTION_TOO_LONG")
    String description;

    boolean active = true;
}