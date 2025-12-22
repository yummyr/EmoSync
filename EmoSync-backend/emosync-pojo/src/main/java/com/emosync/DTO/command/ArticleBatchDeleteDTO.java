package com.emosync.DTO.command;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

/**
 * Article batch delete command DTO
 */
@Data
@Schema(description = "Article batch delete command")
public class ArticleBatchDeleteDTO {

    @Schema(description = "List of article IDs to delete", example = "[\"uuid1\", \"uuid2\", \"uuid3\"]")
    @NotEmpty(message = "List of article IDs to delete cannot be empty")
    private List<String> ids;
}