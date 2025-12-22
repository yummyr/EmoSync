package com.emosync.DTO.query;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * Knowledge Article List Query DTO
 */
@Data
@Schema(description = "Knowledge Article List Query")
public class ArticleListQueryDTO {

    @Schema(description = "Category ID", example = "1")
    private Long categoryId;

    @Schema(description = "Keyword search (title + content + tags)", example = "anxiety")
    private String keyword;

    @Schema(description = "Article title (fuzzy search)", example = "anxiety")
    private String title;

    @Schema(description = "Tags (fuzzy search)", example = "emotion management")
    private String tags;

    @Schema(description = "Author ID", example = "1")
    private Long authorId;

    @Schema(description = "Status", example = "1", allowableValues = {"0", "1", "2"})
    private Integer status;

    @Schema(description = "Start date (yyyy-MM-dd)", example = "2024-01-01")
    private String startDate;

    @Schema(description = "End date (yyyy-MM-dd)", example = "2024-12-31")
    private String endDate;

    @Schema(description = "Sort field", example = "publishedAt", allowableValues = {"publishedAt", "readCount", "createdAt"})
    private String sortField = "publishedAt";

    @Schema(description = "Sort direction", example = "desc", allowableValues = {"asc", "desc"})
    private String sortDirection = "desc";

    @Schema(description = "Current page number", example = "1")
    private Long currentPage = 1L;

    @Schema(description = "Page size", example = "10")
    private Long size = 10L;
}