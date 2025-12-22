package com.emosync.DTO.command;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * User creation command DTO (Admin function)
 */
@Data
@Schema(description = "User creation command")
public class UserCreateDTO {

    @Schema(description = "Username", example = "newuser")
    @NotBlank(message = "Username cannot be blank")
    @Size(min = 3, max = 50, message = "Username length must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers and underscores")
    private String username;

    @Schema(description = "Email", example = "newuser@drone.com")
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email format is invalid")
    @Size(max = 100, message = "Email length cannot exceed 100 characters")
    private String email;

    @Schema(description = "Password", example = "123456")
    @NotBlank(message = "Password cannot be blank")
    @Size(min = 6, max = 50, message = "Password length must be between 6 and 50 characters")
    private String password;

    @Schema(description = "Nickname", example = "New User")
    @Size(max = 50, message = "Nickname length cannot exceed 50 characters")
    private String nickname;

    @Schema(description = "Phone number", example = "13800138000")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "Phone number format is invalid")
    private String phone;

    @Schema(description = "Gender", example = "male", allowableValues = {"male", "female"})
    private String sex;

    @Schema(description = "Bio", example = "Drone enthusiast, loves aerial photography")
    @Size(max = 500, message = "Bio length cannot exceed 500 characters")
    private String bio;

    @Schema(description = "User type", example = "user", allowableValues = {"user", "merchant", "admin"})
    @NotBlank(message = "User type cannot be blank")
    private String userType;

    @Schema(description = "User status", example = "active", allowableValues = {"active", "inactive", "banned"})
    private String status = "active";
}
