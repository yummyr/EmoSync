package com.emosync.DTO.query;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * Knowledge category list query DTO
 */
@Data
@Schema(description = "Knowledge category list query")
public class CategoryListQueryDTO {

    @Schema(description = "Category name (fuzzy search)", example = "psychology")
    private String categoryName;

    @Schema(description = "Status", example = "1", allowableValues = {"0", "1"})
    private Integer status;

    @Schema(description = "Current page number", example = "1")
    private Long currentPage = 1L;

    @Schema(description = "Page size", example = "10")
    private Long size = 10L;
}