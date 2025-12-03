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


}
