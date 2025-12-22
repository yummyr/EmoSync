package com.emosync.DTO.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * AI Analysis Task Response DTO
 */
@Data
@Schema(description = "AI Analysis Task Response DTO")
public class AiAnalysisTaskResponseDTO {

    @Schema(description = "Task ID")
    private Long id;

    @Schema(description = "Diary ID")
    private Long diaryId;

    @Schema(description = "User ID")
    private Long userId;

    @Schema(description = "Username")
    private String username;

    @Schema(description = "User nickname")
    private String nickname;

    @Schema(description = "Diary date")
    private String diaryDate;

    @Schema(description = "Task status")
    private String status;

    @Schema(description = "Task status description")
    private String statusDescription;

    @Schema(description = "Task type")
    private String taskType;

    @Schema(description = "Task type description")
    private String taskTypeDescription;

    @Schema(description = "Priority")
    private Integer priority;

    @Schema(description = "Priority description")
    private String priorityDescription;

    @Schema(description = "Retry count")
    private Integer retryCount;

    @Schema(description = "Max retry count")
    private Integer maxRetryCount;

    @Schema(description = "Error message")
    private String errorMessage;

    @Schema(description = "Processing start time")
    private LocalDateTime startedAt;

    @Schema(description = "Processing completion time")
    private LocalDateTime completedAt;

    @Schema(description = "Creation time")
    private LocalDateTime createdAt;

    @Schema(description = "Update time")
    private LocalDateTime updatedAt;

    @Schema(description = "Processing time (milliseconds)")
    private Long processingTimeMs;

    @Schema(description = "Can retry")
    private Boolean canRetry;
}


