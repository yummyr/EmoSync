package com.emosync.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;


@Entity
@Table(name = "consultation_session")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationSession  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_title")
    private String sessionTitle;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "last_emotion_analysis", columnDefinition = "JSON")
    private String lastEmotionAnalysis;

    @Column(name = "last_emotion_updated_at")
    private LocalDateTime lastEmotionUpdatedAt;

    // FK to User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // OneToMany messages
    @OneToMany(mappedBy = "session", fetch = FetchType.LAZY)
    private List<ConsultationMessage> messages;

    /**
     * Get user ID
     */
    public Long getUserId() {
        return user != null ? user.getId() : null;
    }


    /**
     * Calculate session duration (minutes)
     * Duration from start time to now
     */
    public Long getDurationMinutes() {
        if (startedAt == null) {
            return null;
        }
        LocalDateTime endTime = LocalDateTime.now();
        return java.time.Duration.between(startedAt, endTime).toMinutes();
    }

    /**
     * Check if there is emotion analysis data
     */
    public boolean hasEmotionAnalysis() {
        return lastEmotionAnalysis != null && !lastEmotionAnalysis.trim().isEmpty();
    }

    /**
     * Check if emotion analysis data needs to be updated
     * @param thresholdMinutes Update threshold (minutes)
     */
    public boolean needsEmotionAnalysisUpdate(int thresholdMinutes) {
        if (lastEmotionUpdatedAt == null) {
            return true;
        }
        return java.time.Duration.between(lastEmotionUpdatedAt, LocalDateTime.now()).toMinutes() >= thresholdMinutes;
    }


}
