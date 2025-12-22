package com.emosync.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_analysis_task")
@Data
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
public class AiAnalysisTask extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String status;

    @Column(name = "task_type")
    private String taskType;

    private Integer priority;

    @Column(name = "retry_count")
    private Integer retryCount;

    @Column(name = "max_retry_count")
    private Integer maxRetryCount;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // FK: diary
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diary_id")
    private EmotionDiary diary;

    // FK: user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    /**
     * Determine if the task can be retried
     */
    public boolean canRetry() {
        return retryCount < maxRetryCount && "FAILED".equals(status);
    }

    /**
     * Determine if the task is currently processing
     */
    public boolean isProcessing() {
        return "PROCESSING".equals(status);
    }

    /**
     * Determine if the task is completed
     */
    public boolean isCompleted() {
        return "COMPLETED".equals(status);
    }

    /**
     * Determine if the task has failed
     */
    public boolean isFailed() {
        return "FAILED".equals(status);
    }
}
