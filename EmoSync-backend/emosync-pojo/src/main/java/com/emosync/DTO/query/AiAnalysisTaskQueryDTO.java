package com.emosync.DTO.query;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * AI Analysis Task Query DTO
 */
@Data
@Schema(description = "AI Analysis Task Query DTO")
public class AiAnalysisTaskQueryDTO {

    @Schema(description = "Current page number", example = "1")
    private Integer current = 1;

    @Schema(description = "Page size", example = "20")
    private Integer size = 20;

    @Schema(description = "Task status")
    private String status;

    @Schema(description = "Task type")
    private String taskType;

    @Schema(description = "User ID")
    private Long userId;

    @Schema(description = "Username")
    private String username;

    @Schema(description = "Priority")
    private Integer priority;

    @Schema(description = "Start time")
    private String startTime;

    @Schema(description = "End time")
    private String endTime;

    @Schema(description = "Show only failed tasks")
    private Boolean failedOnly;

    @Schema(description = "Show only retryable tasks")
    private Boolean retryableOnly;
}

