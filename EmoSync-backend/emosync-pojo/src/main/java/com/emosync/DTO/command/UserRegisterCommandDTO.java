package com.emosync.DTO.command;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * User Registration Command DTO
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "User registration command")
public class UserRegisterCommandDTO {

    @Schema(description = "Username", example = "testuser")
    @NotBlank(message = "Username cannot be empty")
    @Size(min = 3, max = 50, message = "Username length must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers and underscores")
    private String username;

    @Schema(description = "Email", example = "test@emoSync.com")
    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Email format is invalid")
    @Size(max = 100, message = "Email length cannot exceed 100 characters")
    private String email;

    @Schema(description = "Password", example = "123456")
    @NotBlank(message = "Password cannot be empty")
    @Size(min = 6, max = 50, message = "Password length must be between 6 and 50 characters")
    private String password;

    @Schema(description = "Confirm password", example = "123456")
    @NotBlank(message = "Confirm password cannot be empty")
    private String confirmPassword;

    @Schema(description = "Nickname", example = "Test User")
    @Size(max = 50, message = "Nickname length cannot exceed 50 characters")
    private String nickname;

    @Schema(description = "Gender 0:Unknown 1:Male 2:Female", example = "0")
    private Integer gender;

    @Schema(description = "Birthday", example = "1990-01-01")
    private LocalDate birthday;

    @Schema(description = "Phone number", example = "6266261234")
    @Pattern(regexp = "^\\d{10}$", message = "Phone number must be exactly 10 digits")
    private String phone;

    @Schema(description = "User type 1:Regular user 2:Administrator", example = "1")
    private Integer userType = 1;
}
