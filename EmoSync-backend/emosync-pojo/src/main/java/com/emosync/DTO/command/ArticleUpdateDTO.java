package com.emosync.DTO.command;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Knowledge Article Update Command DTO
 */
@Data
@Schema(description = "Knowledge Article Update Command")
public class ArticleUpdateDTO {

    @Schema(description = "Category ID", example = "1")
    private Long categoryId;

    @Schema(description = "Article title", example = "How to manage anxiety emotions")
    @Size(max = 200, message = "Article title length cannot exceed 200 characters")
    private String title;

    @Schema(description = "Article summary", example = "This article introduces effective methods and techniques for managing anxiety emotions")
    @Size(max = 1000, message = "Article summary length cannot exceed 1000 characters")
    private String summary;

    @Schema(description = "Article content", example = "Anxiety is a common emotional response...")
    private String content;

    @Schema(description = "Cover image URL", example = "https://example.com/cover.jpg")
    @Size(max = 500, message = "Cover image URL length cannot exceed 500 characters")
    private String coverImage;

    @Schema(description = "Tags (multiple tags separated by commas)", example = "anxiety,emotion management,mental health")
    @Size(max = 500, message = "Tags length cannot exceed 500 characters")
    private String tags;

    @Schema(description = "Status", example = "1", allowableValues = {"0", "1", "2"})
    private Integer status;
}