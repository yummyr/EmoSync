package com.emosync.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "emotion_diary")
@Data
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
public class EmotionDiary extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate diaryDate;

    @Column(name = "mood_score")
    private Integer moodScore;

    @Column(name = "dominant_emotion")
    private String dominantEmotion;

    @Column(name = "emotion_triggers")
    private String emotionTriggers;

    @Column(name = "diary_content")
    private String diaryContent;

    @Column(name = "sleep_quality")
    private Integer sleepQuality;

    @Column(name = "stress_level")
    private Integer stressLevel;

    @Column(name = "ai_emotion_analysis", columnDefinition = "TEXT")
    private String aiEmotionAnalysis;

    @Column(name = "ai_analysis_updated_at")
    private LocalDateTime aiAnalysisUpdatedAt;

    // FK relation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;




    /**
     * Get mood score description
     * @return Mood score description
     */
    public String getMoodScoreDesc() {
        if (moodScore == null) {
            return "Unknown";
        }
        return switch (moodScore) {
            case 1 -> "Terrible";
            case 2 -> "Very Bad";
            case 3 -> "Bad";
            case 4 -> "Poor";
            case 5 -> "Average";
            case 6 -> "Fair";
            case 7 -> "Good";
            case 8 -> "Very Good";
            case 9 -> "Excellent";
            case 10 -> "Outstanding";
            default -> "Invalid score";
        };
    }

    /**
     * Get sleep quality description
     * @return Sleep quality description
     */
    public String getSleepQualityDesc() {
        if (sleepQuality == null) {
            return "Not recorded";
        }
        return switch (sleepQuality) {
            case 1 -> "Very Poor";
            case 2 -> "Poor";
            case 3 -> "Average";
            case 4 -> "Good";
            case 5 -> "Excellent";
            default -> "Invalid score";
        };
    }

    /**
     * Get stress level description
     * @return Stress level description
     */
    public String getStressLevelDesc() {
        if (stressLevel == null) {
            return "Not recorded";
        }
        return switch (stressLevel) {
            case 1 -> "Very Low";
            case 2 -> "Low";
            case 3 -> "Moderate";
            case 4 -> "High";
            case 5 -> "Very High";
            default -> "Invalid score";
        };
    }

    /**
     * Check if mood is positive
     * Based on mood score, 7 and above is considered positive mood
     * @return true-Positive mood, false-Not positive mood
     */
    public boolean isPositiveMood() {
        return moodScore != null && moodScore >= 7;
    }

    /**
     * Check if mood is negative
     * Based on mood score, 4 and below is considered negative mood
     * @return true-Negative mood, false-Not negative mood
     */
    public boolean isNegativeMood() {
        return moodScore != null && moodScore <= 4;
    }

    /**
     * Check if there is AI emotion analysis data
     * @return true-Has AI analysis data, false-No AI analysis data
     */
    public boolean hasAiEmotionAnalysis() {
        return aiEmotionAnalysis != null && !aiEmotionAnalysis.trim().isEmpty();
    }

    /**
     * Check if AI emotion analysis data needs to be updated
     * @param thresholdMinutes Update threshold (minutes)
     * @return true-Needs update, false-Does not need update
     */
    public boolean needsAiAnalysisUpdate(int thresholdMinutes) {
        if (aiAnalysisUpdatedAt == null) {
            return true;
        }
        return java.time.Duration.between(aiAnalysisUpdatedAt, LocalDateTime.now()).toMinutes() >= thresholdMinutes;
    }

    /**
     * Get analysis content (for AI analysis)
     * Combine diary content and emotion triggers
     * @return Text content for AI analysis
     */
    public String getAnalysisContent() {
        StringBuilder content = new StringBuilder();

        if (emotionTriggers != null && !emotionTriggers.trim().isEmpty()) {
            content.append("Emotion Triggers: ").append(emotionTriggers).append("\n");
        }

        if (diaryContent != null && !diaryContent.trim().isEmpty()) {
            content.append("Diary Content: ").append(diaryContent);
        }

        return content.toString().trim();
    }
}
