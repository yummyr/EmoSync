package com.emosync.DTO.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Knowledge article response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Knowledge article response")
public class ArticleResponseDTO {

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

    @Schema(description = "Article content")
    private String content;

    @Schema(description = "Cover image")
    private String coverImage;

    @Schema(description = "Tags")
    private String tags;

    @Schema(description = "Tag array")
    private String[] tagArray;

    @Schema(description = "Author ID")
    private Long authorId;

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

    @Schema(description = "Published time")
    private LocalDateTime publishedAt;

    @Schema(description = "Creation time")
    private LocalDateTime createdAt;

    @Schema(description = "Update time")
    private LocalDateTime updatedAt;
}