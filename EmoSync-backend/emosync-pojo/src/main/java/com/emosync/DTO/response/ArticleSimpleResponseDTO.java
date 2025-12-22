package com.emosync.DTO.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Article simplified response DTO (for list display)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Article simplified response")
public class ArticleSimpleResponseDTO {

    @Schema(description = "Article ID")
    private String id;

    @Schema(description = "Category ID")
    private Long categoryId;

    @Schema(description = "Category name")
    private String categoryName;

    @Schema(description = "Article title")
    private String title;

    @Schema(description = "Article summary")
    private String summary;

    @Schema(description = "Cover image")
    private String coverImage;

    @Schema(description = "Tags")
    private String tags;

    @Schema(description = "Author name")
    private String authorName;

    @Schema(description = "Read count")
    private Integer readCount;

    @Schema(description = "Status")
    private Integer status;

    @Schema(description = "Status description")
    private String statusText;

    @Schema(description = "Is favorited")
    private Boolean isFavorited;

    @Schema(description = "Favorite count")
    private Integer favoriteCount;

    @Schema(description = "Published time")
    private LocalDateTime publishedAt;

    @Schema(description = "Creation time")
    private LocalDateTime createdAt;

    @Schema(description = "Update time")
    private LocalDateTime updatedAt;

    @Schema(description = "Favorite time")
    private LocalDateTime favoriteTime;
}