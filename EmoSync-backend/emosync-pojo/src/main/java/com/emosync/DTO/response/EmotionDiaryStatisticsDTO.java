package com.emosync.DTO.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Emotion diary statistics response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Emotion diary statistics response DTO")
public class EmotionDiaryStatisticsDTO {

    @Schema(description = "Total days in statistics period")
    private Integer totalDays;

    @Schema(description = "Recorded days")
    private Integer recordedDays;

    @Schema(description = "Actual recorded days")
    private Integer recordDays;

    @Schema(description = "Target days")
    private Integer targetDays;

    @Schema(description = "Completion rate")
    private BigDecimal completionRate;

    @Schema(description = "Average mood score")
    private BigDecimal averageMoodScore;

    @Schema(description = "Maximum mood score")
    private Integer maxMoodScore;

    @Schema(description = "Minimum mood score")
    private Integer minMoodScore;

    @Schema(description = "Positive emotion days")
    private Integer positiveDays;

    @Schema(description = "Negative emotion days")
    private Integer negativeDays;

    @Schema(description = "Neutral emotion days")
    private Integer neutralDays;

    @Schema(description = "Average sleep quality")
    private BigDecimal averageSleepQuality;

    @Schema(description = "Average stress level")
    private BigDecimal averageStressLevel;

    @Schema(description = "Mood trend data (7 days)")
    private List<MoodTrendData> moodTrend;

    @Schema(description = "Emotion distribution statistics")
    private Map<String, Integer> emotionDistribution;

    @Schema(description = "Sleep quality distribution")
    private Map<String, Integer> sleepQualityDistribution;

    @Schema(description = "Stress level distribution")
    private Map<String, Integer> stressLevelDistribution;

    @Schema(description = "Most common dominant emotion")
    private String mostCommonEmotion;

    @Schema(description = "Improvement suggestions")
    private List<String> suggestions;

    /**
     * Mood trend data inner class
     */
    @Data
    @Schema(description = "Mood trend data")
    public static class MoodTrendData {
        @Schema(description = "Date label")
        private String dateLabel;

        @Schema(description = "Mood score")
        private Integer moodScore;

        @Schema(description = "Dominant emotion")
        private String dominantEmotion;
    }

    /**
     * Calculate positive emotion ratio
     */
    public BigDecimal getPositiveRatio() {
        if (recordedDays == null || recordedDays == 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(positiveDays != null ? positiveDays : 0)
                .divide(BigDecimal.valueOf(recordedDays), 2, BigDecimal.ROUND_HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    /**
     * Calculate negative emotion ratio
     */
    public BigDecimal getNegativeRatio() {
        if (recordedDays == null || recordedDays == 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(negativeDays != null ? negativeDays : 0)
                .divide(BigDecimal.valueOf(recordedDays), 2, BigDecimal.ROUND_HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    /**
     * Get mood stability description
     */
    public String getMoodStabilityDesc() {
        if (maxMoodScore == null || minMoodScore == null) {
            return "Insufficient data";
        }
        int range = maxMoodScore - minMoodScore;
        if (range <= 2) {
            return "Very stable";
        } else if (range <= 4) {
            return "Relatively stable";
        } else if (range <= 6) {
            return "Moderate fluctuation";
        } else {
            return "High fluctuation";
        }
    }
}

