package com.emosync.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * File upload request DTO
 */
@Data
@Schema(description = "File upload request DTO")
public class FileUploadDTO {

    @NotBlank(message = "Business type cannot be empty")
    @Schema(description = "Business type", example = "USER_AVATAR")
    private String businessType;

    @NotBlank(message = "Business object ID cannot be empty")
    @Schema(description = "Business object ID (supports numeric ID and UUID format)", example = "1")
    private String businessId;

    @Schema(description = "Business field name", example = "avatar")
    private String businessField;

    @Schema(description = "Whether it is a temporary file", example = "false")
    private Boolean isTemp;
} 