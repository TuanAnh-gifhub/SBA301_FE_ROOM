package org.rent.room.be.dto.request.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LoginGoogleRequest {

    @NotBlank(message = "AUTH_CODE_INVALID")
    String code;
}