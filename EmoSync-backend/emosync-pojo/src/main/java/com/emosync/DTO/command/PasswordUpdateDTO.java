package com.emosync.DTO.command;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Password Update Command DTO
 */
@Data
@Schema(description = "Password update command")
public class PasswordUpdateDTO {

    @Schema(description = "Old password", example = "123456")
    @NotBlank(message = "Old password cannot be blank")
    private String oldPassword;

    @Schema(description = "New password", example = "newpassword123")
    @NotBlank(message = "New password cannot be blank")
    @Size(min = 6, max = 50, message = "New password length must be between 6 and 50 characters")
    private String newPassword;
}