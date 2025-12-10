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
     * 获取情绪评分的描述
     * @return 情绪评分描述
     */
    public String getMoodScoreDesc() {
        if (moodScore == null) {
            return "未知";
        }
        return switch (moodScore) {
            case 1 -> "非常糟糕";
            case 2 -> "糟糕";
            case 3 -> "不好";
            case 4 -> "略差";
            case 5 -> "一般";
            case 6 -> "还可以";
            case 7 -> "不错";
            case 8 -> "很好";
            case 9 -> "非常好";
            case 10 -> "极好";
            default -> "无效评分";
        };
    }

    /**
     * 获取睡眠质量的描述
     * @return 睡眠质量描述
     */
    public String getSleepQualityDesc() {
        if (sleepQuality == null) {
            return "未记录";
        }
        return switch (sleepQuality) {
            case 1 -> "很差";
            case 2 -> "较差";
            case 3 -> "一般";
            case 4 -> "良好";
            case 5 -> "优秀";
            default -> "无效评分";
        };
    }

    /**
     * 获取压力水平的描述
     * @return 压力水平描述
     */
    public String getStressLevelDesc() {
        if (stressLevel == null) {
            return "未记录";
        }
        return switch (stressLevel) {
            case 1 -> "很低";
            case 2 -> "较低";
            case 3 -> "中等";
            case 4 -> "较高";
            case 5 -> "很高";
            default -> "无效评分";
        };
    }

    /**
     * 判断是否为积极情绪
     * 根据情绪评分判断，7分及以上认为是积极情绪
     * @return true-积极情绪，false-非积极情绪
     */
    public boolean isPositiveMood() {
        return moodScore != null && moodScore >= 7;
    }

    /**
     * 判断是否为消极情绪
     * 根据情绪评分判断，4分及以下认为是消极情绪
     * @return true-消极情绪，false-非消极情绪
     */
    public boolean isNegativeMood() {
        return moodScore != null && moodScore <= 4;
    }

    /**
     * 判断是否有AI情绪分析数据
     * @return true-有AI分析数据，false-无AI分析数据
     */
    public boolean hasAiEmotionAnalysis() {
        return aiEmotionAnalysis != null && !aiEmotionAnalysis.trim().isEmpty();
    }

    /**
     * 判断AI情绪分析数据是否需要更新
     * @param thresholdMinutes 更新阈值（分钟）
     * @return true-需要更新，false-不需要更新
     */
    public boolean needsAiAnalysisUpdate(int thresholdMinutes) {
        if (aiAnalysisUpdatedAt == null) {
            return true;
        }
        return java.time.Duration.between(aiAnalysisUpdatedAt, LocalDateTime.now()).toMinutes() >= thresholdMinutes;
    }

    /**
     * 获取分析内容（用于AI分析）
     * 组合日记内容和情绪触发因素
     * @return 用于AI分析的文本内容
     */
    public String getAnalysisContent() {
        StringBuilder content = new StringBuilder();

        if (emotionTriggers != null && !emotionTriggers.trim().isEmpty()) {
            content.append("情绪触发因素：").append(emotionTriggers).append("\n");
        }

        if (diaryContent != null && !diaryContent.trim().isEmpty()) {
            content.append("日记内容：").append(diaryContent);
        }

        return content.toString().trim();
    }
}
