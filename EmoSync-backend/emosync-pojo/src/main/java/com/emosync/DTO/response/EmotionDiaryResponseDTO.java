package com.emosync.DTO.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Emotion Diary Response DTO
 */
@Data
@Schema(description = "Emotion Diary Response")
public class EmotionDiaryResponseDTO {

    @Schema(description = "Diary ID")
    private Long id;

    @Schema(description = "User ID")
    private Long userId;

    @Schema(description = "User nickname")
    private String userNickname;

    @Schema(description = "Username")
    private String username;

    @Schema(description = "Nickname")
    private String nickname;

    @Schema(description = "Diary date")
    private LocalDate diaryDate;

    @Schema(description = "Mood score (1-10)")
    private Integer moodScore;

    @Schema(description = "Mood score description")
    private String moodScoreDesc;

    @Schema(description = "Dominant emotion")
    private String dominantEmotion;

    @Schema(description = "Emotion triggers")
    private String emotionTriggers;

    @Schema(description = "Diary content")
    private String diaryContent;

    @Schema(description = "Diary content preview")
    private String diaryContentPreview;

    @Schema(description = "Sleep quality (1-5)")
    private Integer sleepQuality;

    @Schema(description = "Sleep quality description")
    private String sleepQualityDesc;

    @Schema(description = "Stress level (1-5)")
    private Integer stressLevel;

    @Schema(description = "Stress level description")
    private String stressLevelDesc;

    @Schema(description = "Creation time")
    private LocalDateTime createdAt;

    @Schema(description = "Update time")
    private LocalDateTime updatedAt;

    @Schema(description = "Is positive mood")
    private Boolean isPositiveMood;

    @Schema(description = "Is negative mood")
    private Boolean isNegativeMood;

    @Schema(description = "AI emotion analysis result (JSON format)")
    private String aiEmotionAnalysis;

    @Schema(description = "AI analysis update time")
    private LocalDateTime aiAnalysisUpdatedAt;

    @Schema(description = "Has AI emotion analysis")
    private Boolean hasAiEmotionAnalysis;

    @Schema(description = "AI analysis status: PENDING-analyzing, COMPLETED-completed, FAILED-analysis failed")
    private String aiAnalysisStatus;

    /**
     * Get diary content preview (first 100 characters)
     */
    public String getDiaryContentPreview() {
        if (diaryContent == null) {
            return "";
        }
        return diaryContent.length() > 100 ? diaryContent.substring(0, 100) + "..." : diaryContent;
    }

    /**
     * Calculate content length
     */
    public int getContentLength() {
        return diaryContent != null ? diaryContent.length() : 0;
    }

    /**
     * Check if emotion triggers are included
     */
    public boolean hasEmotionTriggers() {
        return emotionTriggers != null && !emotionTriggers.trim().isEmpty();
    }
}

