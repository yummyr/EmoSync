package com.emosync.DTO.command;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

/**
 * User Information Update Command DTO
 */
@Data
@Schema(description = "User information update command")
public class UserUpdateCommandDTO {

    @Schema(description = "Email", example = "test@drone.com")
    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email length cannot exceed 100 characters")
    private String email;

    @Schema(description = "Nickname", example = "testuser")
    @Size(max = 50, message = "Nickname length cannot exceed 50 characters")
    private String nickname;

    @Schema(description = "Avatar", example = "/avatars/user.jpg")
    @Size(max = 255, message = "Avatar path length cannot exceed 255 characters")
    private String avatar;

    @Schema(description = "Phone number", example = "6266261234")
    @Pattern(regexp = "^\\d{10}$", message = "Phone number must be exactly 10 digits")
    private String phone;

    @Schema(description = "Gender 0:Unknown 1:Male 2:Female", example = "1")
    private Integer gender;

    @Schema(description = "Birthday", example = "1990-01-01")
    private LocalDate birthday;

    @Schema(description = "User type 1:Regular user 2:Administrator", example = "1")
    private Integer userType;

    @Schema(description = "User status 0:Disabled 1:Normal", example = "1")
    private Integer status;
}
