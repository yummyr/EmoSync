package com.emosync.DTO.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Knowledge category response DTO
 */
@Data
@Builder
@Schema(description = "Knowledge category response")
public class CategoryResponseDTO {

    @Schema(description = "Category ID")
    private Long id;

    @Schema(description = "Category name")
    private String categoryName;

    @Schema(description = "Category description")
    private String description;

    @Schema(description = "Sort order")
    private Integer sortOrder;

    @Schema(description = "Status")
    private Integer status;

    @Schema(description = "Status description")
    private String statusText;

    @Schema(description = "Article count")
    private Integer articleCount;

    @Schema(description = "Creation time")
    private LocalDateTime createdAt;

    @Schema(description = "Update time")
    private LocalDateTime updatedAt;
    // Constructor for JPQL queries
    public CategoryResponseDTO(Long id, String categoryName, String description,
                               Integer sortOrder, Integer status, String statusText,
                               Integer articleCount, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.categoryName = categoryName;
        this.description = description;
        this.sortOrder = sortOrder;
        this.status = status;
        this.statusText = statusText;
        this.articleCount = articleCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}