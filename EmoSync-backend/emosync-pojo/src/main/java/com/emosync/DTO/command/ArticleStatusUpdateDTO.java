package com.emosync.DTO.command;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Article status update command DTO
 */
@Data
@Schema(description = "Article status update command")
public class ArticleStatusUpdateDTO {

    @Schema(description = "Article status", example = "1", allowableValues = {"0", "1", "2"})
    @NotNull(message = "Article status cannot be empty")
    private Integer status;
}