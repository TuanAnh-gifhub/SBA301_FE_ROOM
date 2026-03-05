package org.rent.room.be.dto.request.user;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateUserRequest {

    @Size(min = 3, max = 50, message = "USERNAME_INVALID_LENGTH")
    String userName;

    @Pattern(regexp = "^\\d{10}$", message = "PHONE_INVALID")
    String phone;

    String gender;

    @Past(message = "DOB_INVALID")
    LocalDate dateOfBirth;
}