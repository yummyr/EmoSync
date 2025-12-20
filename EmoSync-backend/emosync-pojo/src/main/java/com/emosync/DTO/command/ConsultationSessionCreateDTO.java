package com.emosync.DTO.command;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Consultation session creation DTO
 */
@Data
@Schema(description = "Consultation session creation DTO")
public class ConsultationSessionCreateDTO {

    @Schema(description = "Session title")
    @Size(max = 200, message = "Session title cannot exceed 200 characters")
    private String sessionTitle;

    @Schema(description = "Initial message")
    @NotBlank(message = "Initial message cannot be blank")
    @Size(max = 2000, message = "Initial message cannot exceed 2000 characters")
    private String initialMessage;
}
