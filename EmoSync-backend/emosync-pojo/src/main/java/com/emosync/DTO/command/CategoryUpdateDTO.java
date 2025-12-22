package com.emosync.DTO.command;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Knowledge category update command DTO
 */
@Data
@Schema(description = "Knowledge category update command")
public class CategoryUpdateDTO {

    @Schema(description = "Category name", example = "Mental Health Basics")
    @Size(max = 100, message = "Category name length cannot exceed 100 characters")
    private String categoryName;

    @Schema(description = "Category description", example = "Basic mental health knowledge and concepts")
    @Size(max = 500, message = "Category description length cannot exceed 500 characters")
    private String description;

    @Schema(description = "Sort order", example = "1")
    private Integer sortOrder;

    @Schema(description = "Status", example = "1", allowableValues = {"0", "1"})
    private Integer status;
}