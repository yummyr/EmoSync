package com.emosync.DTO.query;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * User favorite articles query DTO
 */
@Data
@Schema(description = "User favorite articles query")
public class UserFavoriteQueryDTO {

    @Schema(description = "User ID", example = "1")
    private Long userId;

    @Schema(description = "Article title (fuzzy search)", example = "anxiety")
    private String title;

    @Schema(description = "Category ID", example = "1")
    private Long categoryId;

    @Schema(description = "Sort field", example = "createdAt", allowableValues = {"createdAt", "title"})
    private String sortField = "createdAt";

    @Schema(description = "Sort direction", example = "desc", allowableValues = {"asc", "desc"})
    private String sortDirection = "desc";

    @Schema(description = "Current page number", example = "1")
    private Long currentPage = 1L;

    @Schema(description = "Page size", example = "10")
    private Long size = 10L;
}