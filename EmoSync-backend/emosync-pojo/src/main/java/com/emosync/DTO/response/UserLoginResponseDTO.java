package com.emosync.DTO.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * User Login Response DTO
 * Returned when a user successfully logs in.
 * Includes JWT token and basic user profile.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "User Login Response")
public class UserLoginResponseDTO {

    @Schema(description = "User profile information")
    private UserDetailResponseDTO user;

    @Schema(description = "JWT access token")
    private String token;

    @Schema(description = "Role type: 1=User, 2=Admin")
    private Integer roleType;
}
