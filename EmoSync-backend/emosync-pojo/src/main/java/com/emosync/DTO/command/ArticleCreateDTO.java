package com.emosync.DTO.command;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Knowledge article creation command DTO
 */
@Data
@Schema(description = "Knowledge article creation command")
public class ArticleCreateDTO {

    @Schema(description = "Article ID (optional, supports UUID pre-generation)", example = "550e8400-e29b-41d4-a716-446655440000")
    @Size(max = 50, message = "Article ID length cannot exceed 50 characters")
    private String id;

    @Schema(description = "Category ID", example = "1")
    @NotNull(message = "Category ID cannot be empty")
    private Long categoryId;

    @Schema(description = "Article title", example = "How to manage anxiety")
    @NotBlank(message = "Article title cannot be empty")
    @Size(max = 200, message = "Article title length cannot exceed 200 characters")
    private String title;

    @Schema(description = "Article summary", example = "This article introduces effective methods and techniques for managing anxiety")
    @Size(max = 1000, message = "Article summary length cannot exceed 1000 characters")
    private String summary;

    @Schema(description = "Article content", example = "Anxiety is a common emotional response...")
    @NotBlank(message = "Article content cannot be empty")
    private String content;

    @Schema(description = "Cover image URL", example = "https://example.com/cover.jpg")
    @Size(max = 500, message = "Cover image URL length cannot exceed 500 characters")
    private String coverImage;

    @Schema(description = "Tags (multiple tags separated by commas)", example = "anxiety,emotion management,mental health")
    @Size(max = 500, message = "Tags length cannot exceed 500 characters")
    private String tags;

    @Schema(description = "Status", example = "0", allowableValues = {"0", "1", "2"})
    private Integer status = 0; // Default is draft status
}