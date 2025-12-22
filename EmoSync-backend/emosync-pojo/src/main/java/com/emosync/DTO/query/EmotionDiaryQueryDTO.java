package com.emosync.DTO.query;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.time.LocalDate;

/**
 * Emotion diary query DTO
 */
@Data
@Schema(description = "Emotion diary query")
public class EmotionDiaryQueryDTO {

    @Schema(description = "User ID")
    private Long userId;

    @Schema(description = "Username")
    private String username;

    @Schema(description = "Start date")
    private LocalDate startDate;

    @Schema(description = "End date")
    private LocalDate endDate;

    @Schema(description = "Minimum mood score")
    @Min(value = 1, message = "Minimum mood score cannot be less than 1")
    @Max(value = 10, message = "Minimum mood score cannot be greater than 10")
    private Integer minMoodScore;

    @Schema(description = "Maximum mood score")
    @Min(value = 1, message = "Maximum mood score cannot be less than 1")
    @Max(value = 10, message = "Maximum mood score cannot be greater than 10")
    private Integer maxMoodScore;

    @Schema(description = "Primary emotion")
    private String dominantEmotion;

    @Schema(description = "Sleep quality")
    @Min(value = 1, message = "Sleep quality score cannot be less than 1")
    @Max(value = 5, message = "Sleep quality score cannot be greater than 5")
    private Integer sleepQuality;

    @Schema(description = "Stress level")
    @Min(value = 1, message = "Stress level score cannot be less than 1")
    @Max(value = 5, message = "Stress level score cannot be greater than 5")
    private Integer stressLevel;

    @Schema(description = "Page number", example = "1")
    @Min(value = 1, message = "Page number cannot be less than 1")
    private Integer current = 1;

    @Schema(description = "Page size", example = "10")
    @Min(value = 1, message = "Page size cannot be less than 1")
    @Max(value = 100, message = "Page size cannot be greater than 100")
    private Integer size = 10;
}
