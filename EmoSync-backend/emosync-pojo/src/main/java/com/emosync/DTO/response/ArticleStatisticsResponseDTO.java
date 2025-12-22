package com.emosync.DTO.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Article statistics response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Article statistics response")
public class ArticleStatisticsResponseDTO {

    @Schema(description = "Total articles")
    private Long totalArticles;

    @Schema(description = "Published articles")
    private Long publishedArticles;

    @Schema(description = "Draft articles")
    private Long draftArticles;

    @Schema(description = "Offline articles")
    private Long offlineArticles;

    @Schema(description = "Total views")
    private Long totalViews;

    @Schema(description = "Total favorites")
    private Long totalFavorites;
}