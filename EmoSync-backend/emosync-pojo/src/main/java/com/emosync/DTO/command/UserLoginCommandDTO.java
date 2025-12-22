package com.emosync.DTO.command;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * User Login Command DTO
 */
@Data
@Schema(description = "User Login Command")
public class UserLoginCommandDTO {

    @Schema(description = "Username or email", example = "admin")
    @NotBlank(message = "Username or email cannot be empty")
    @Size(max = 100, message = "Username or email length cannot exceed 100 characters")
    private String username;

    @Schema(description = "Password", example = "123456")
    @NotBlank(message = "Password cannot be empty")
    @Size(min = 6, max = 50, message = "Password length must be between 6 and 50 characters")
    private String password;
}
