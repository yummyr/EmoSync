package com.emosync.DTO.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Data Analytics Response DTO
 * @author Yuan
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Data Analytics Response DTO")
public class DataAnalyticsResponseDTO {

    @Schema(description = "System overview data")
    private SystemOverview systemOverview;

    @Schema(description = "Emotion heatmap data")
    private EmotionHeatmapData emotionHeatmap;

    @Schema(description = "Emotion trend data")
    private List<EmotionTrendData> emotionTrend;

    @Schema(description = "Consultation session statistics")
    private ConsultationStatistics consultationStats;

    @Schema(description = "User activity data")
    private List<UserActivityData> userActivity;

    /**
     * System overview data
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "System overview data")
    public static class SystemOverview {
        @Schema(description = "Total users")
        private Long totalUsers;

        @Schema(description = "Active users")
        private Long activeUsers;

        @Schema(description = "Total emotion diaries")
        private Long totalDiaries;

        @Schema(description = "Total consultation sessions")
        private Long totalSessions;

        @Schema(description = "Average mood score")
        private BigDecimal avgMoodScore;

        @Schema(description = "Today's new users")
        private Long todayNewUsers;

        @Schema(description = "Today's new diaries")
        private Long todayNewDiaries;

        @Schema(description = "Today's new sessions")
        private Long todayNewSessions;
    }

    /**
     * Emotion heatmap data
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Emotion heatmap data")
    public static class EmotionHeatmapData {
        @Schema(description = "Heatmap grid data - distributed by hour and day of week")
        private List<List<HeatmapPoint>> gridData;

        @Schema(description = "Emotion distribution statistics")
        private Map<String, Integer> emotionDistribution;

        @Schema(description = "Peak emotion active time period")
        private String peakEmotionTime;

        @Schema(description = "Data statistics time range")
        private String dateRange;
    }

    /**
     * Heatmap point data
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Heatmap point data")
    public static class HeatmapPoint {
        @Schema(description = "X coordinate (hour: 0-23)")
        private Integer x;

        @Schema(description = "Y coordinate (day of week: 0-6, 0 is Sunday)")
        private Integer y;

        @Schema(description = "Value intensity (record count)")
        private Integer value;

        @Schema(description = "Average mood score")
        private BigDecimal avgMoodScore;

        @Schema(description = "Dominant emotion type")
        private String dominantEmotion;
    }

    /**
     * Emotion trend data
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Emotion trend data")
    public static class EmotionTrendData {
        @Schema(description = "Date")
        private LocalDate date;

        @Schema(description = "Average mood score")
        private BigDecimal avgMoodScore;

        @Schema(description = "Record count")
        private Integer recordCount;

        @Schema(description = "Positive emotion ratio")
        private BigDecimal positiveRatio;

        @Schema(description = "Negative emotion ratio")
        private BigDecimal negativeRatio;

        @Schema(description = "Dominant emotion type")
        private String dominantEmotion;
    }

    /**
     * Consultation session statistics
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Consultation session statistics")
    public static class ConsultationStatistics {
        @Schema(description = "Total sessions")
        private Long totalSessions;

        @Schema(description = "Average session duration (minutes)")
        private BigDecimal avgDurationMinutes;

        @Schema(description = "Emotion improved sessions")
        private Long improvedSessions;

        @Schema(description = "Emotion improvement rate")
        private BigDecimal improvementRate;

        @Schema(description = "Daily session count trend")
        private List<DailySessionCount> dailyTrend;

        @Schema(description = "Top emotion tags")
        private Map<String, Integer> topEmotionTags;
    }

    /**
     * Daily session count statistics
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Daily session count statistics")
    public static class DailySessionCount {
        @Schema(description = "Date")
        private LocalDate date;

        @Schema(description = "Session count")
        private Integer sessionCount;

        @Schema(description = "Participating users count")
        private Integer userCount;
    }

    /**
     * User activity data
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "User activity data")
    public static class UserActivityData {
        @Schema(description = "Date")
        private LocalDate date;

        @Schema(description = "Active users")
        private Integer activeUsers;

        @Schema(description = "New users")
        private Integer newUsers;

        @Schema(description = "Diary recording users")
        private Integer diaryUsers;

        @Schema(description = "Consultation users")
        private Integer consultationUsers;
    }
}
