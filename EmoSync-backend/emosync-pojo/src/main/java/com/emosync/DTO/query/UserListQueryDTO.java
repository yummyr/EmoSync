package com.emosync.DTO.query;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * User list query DTO
 */
@Data
@Schema(description = "User list query")
public class UserListQueryDTO {

    @Schema(description = "Username (fuzzy search)", example = "admin")
    private String username;

    @Schema(description = "Email (fuzzy search)", example = "admin@drone.com")
    private String email;

    @Schema(description = "Nickname (fuzzy search)", example = "admin")
    private String nickname;

    @Schema(description = "Phone number (fuzzy search)", example = "13800138000")
    private String phone;

    @Schema(description = "User type 1:Normal user 2:Administrator", example = "1")
    private Integer userType;

    @Schema(description = "User status 0:Disabled 1:Active", example = "1")
    private Integer status;

    @Schema(description = "Current page number", example = "1")
    private Integer currentPage = 1;

    @Schema(description = "Page size", example = "10")
    private Integer size = 10;
}
