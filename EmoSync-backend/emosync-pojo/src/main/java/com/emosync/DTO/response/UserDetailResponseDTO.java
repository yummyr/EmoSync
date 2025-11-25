package com.emosync.DTO.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * User Detail Response DTO
 * Represents the full profile information of a user.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "User detail response")
public class UserDetailResponseDTO {

    @Schema(description = "User ID", example = "1")
    private Long id;

    @Schema(description = "Username", example = "admin")
    private String username;

    @Schema(description = "Email address", example = "admin@example.com")
    private String email;

    @Schema(description = "Nickname", example = "System Admin")
    private String nickname;

    @Schema(description = "Avatar URL", example = "/files/user/avatar123.jpg")
    private String avatar;

    @Schema(description = "Phone number", example = "13800138000")
    private String phone;

    @Schema(description = "Gender: 0=Unknown, 1=Male, 2=Female", example = "1")
    private Integer gender;

    @Schema(description = "Gender display text", example = "Male")
    private String genderDisplayName;

    @Schema(description = "Birthday", example = "1990-01-01")
    private LocalDate birthday;

    @Schema(description = "User type: 1=Regular, 2=Admin", example = "2")
    private Integer userType;

    @Schema(description = "User type display text", example = "Admin")
    private String userTypeDisplayName;

    @Schema(description = "User status: 0=Disabled, 1=Active", example = "1")
    private Integer status;

    @Schema(description = "Status display text", example = "Active")
    private String statusDisplayName;

    @Schema(description = "Preferred display name",
            example = "System Administrator")
    private String displayName;

    @Schema(description = "Created time")
    private LocalDateTime createdAt;

    @Schema(description = "Last updated time")
    private LocalDateTime updatedAt;
}
