package com.emosync.DTO.command;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

/**
 * Emotion diary creation DTO
 */
@Data
@Schema(description = "Emotion diary creation DTO")
public class EmotionDiaryCreateDTO {

    @Schema(description = "Diary date")
    @NotNull(message = "Diary date cannot be null")
    private LocalDate diaryDate;

    @Schema(description = "Mood score (1-10)")
    @NotNull(message = "Mood score cannot be null")
    @Min(value = 1, message = "Mood score cannot be less than 1")
    @Max(value = 10, message = "Mood score cannot be greater than 10")
    private Integer moodScore;

    @Schema(description = "Dominant emotion")
    @Size(max = 50, message = "Dominant emotion length cannot exceed 50 characters")
    private String dominantEmotion;

    @Schema(description = "Emotion triggers")
    @Size(max = 1000, message = "Emotion triggers length cannot exceed 1000 characters")
    private String emotionTriggers;

    @Schema(description = "Diary content")
    @Size(max = 2000, message = "Diary content length cannot exceed 2000 characters")
    private String diaryContent;

    @Schema(description = "Sleep quality (1-5)")
    @Min(value = 1, message = "Sleep quality score cannot be less than 1")
    @Max(value = 5, message = "Sleep quality score cannot be greater than 5")
    private Integer sleepQuality;

    @Schema(description = "Stress level (1-5)")
    @Min(value = 1, message = "Stress level score cannot be less than 1")
    @Max(value = 5, message = "Stress level score cannot be greater than 5")
    private Integer stressLevel;
}

