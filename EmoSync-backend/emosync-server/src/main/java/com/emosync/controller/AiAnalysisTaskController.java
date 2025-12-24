package com.emosync.controller;

import com.emosync.Result.PageResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.emosync.DTO.query.AiAnalysisTaskQueryDTO;
import com.emosync.DTO.response.AiAnalysisTaskResponseDTO;
import com.emosync.Result.Result;
import com.emosync.exception.BusinessException;
import com.emosync.service.AiAnalysisTaskService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * AI Analysis Task Management Controller
 * @author Yuan
 */
@Tag(name = "AI Analysis Task Management", description = "AI Emotion Analysis Task Queue Management API")
@Slf4j
@RestController
@AllArgsConstructor
@RequestMapping("/ai-analysis-task")
public class AiAnalysisTaskController {


    private final AiAnalysisTaskService aiAnalysisTaskService;

    /**
     * Paginated query for AI analysis tasks
     */
    @Operation(summary = "Paginated query for AI analysis tasks", description = "Admin view AI analysis task queue")
    @GetMapping("/page")
    public Result<PageResult<AiAnalysisTaskResponseDTO>> getTaskPage(
            @Parameter(description = "Current page number") @RequestParam(defaultValue = "1") Integer current,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") Integer size,
            @Parameter(description = "Task status") @RequestParam(required = false) String status,
            @Parameter(description = "Task type") @RequestParam(required = false) String taskType,
            @Parameter(description = "User ID") @RequestParam(required = false) Long userId,
            @Parameter(description = "Username") @RequestParam(required = false) String username,
            @Parameter(description = "Priority") @RequestParam(required = false) Integer priority,
            @Parameter(description = "Start time") @RequestParam(required = false) String startTime,
            @Parameter(description = "End time") @RequestParam(required = false) String endTime,
            @Parameter(description = "Show only failed tasks") @RequestParam(required = false) Boolean failedOnly,
            @Parameter(description = "Show only retryable tasks") @RequestParam(required = false) Boolean retryableOnly) {

        // Build query DTO
        AiAnalysisTaskQueryDTO queryDTO = new AiAnalysisTaskQueryDTO();
        queryDTO.setCurrent(current);
        queryDTO.setSize(size);
        queryDTO.setStatus(status);
        queryDTO.setTaskType(taskType);
        queryDTO.setUserId(userId);
        queryDTO.setUsername(username);
        queryDTO.setPriority(priority);
        queryDTO.setStartTime(startTime);
        queryDTO.setEndTime(endTime);
        queryDTO.setFailedOnly(failedOnly);
        queryDTO.setRetryableOnly(retryableOnly);

        log.info("Received paginated query request for AI analysis tasks, query conditions: {}", queryDTO);
        log.info("Original parameters - priority: {}, type: {}", priority, priority != null ? priority.getClass().getSimpleName() : "null");

        try {
            PageResult<AiAnalysisTaskResponseDTO> page = aiAnalysisTaskService.getTaskPage(queryDTO);
            return
                    Result.success(page);
        } catch (Exception e) {
            log.error("Failed to query AI analysis tasks: {}", e.getMessage(), e);
            return Result.error("Query failed: " + e.getMessage());
        }
    }

    /**
     * Get queue statistics
     */
    @Operation(summary = "Get queue statistics", description = "Get statistical data of AI analysis queue")
    @GetMapping("/statistics")
    public Result<Map<String, Object>> getQueueStatistics() {
        log.info("Received request to get queue statistics");

        try {
            Map<String, Object> statistics = aiAnalysisTaskService.getQueueStatistics();
            return Result.success(statistics);
        } catch (Exception e) {
            log.error("Failed to get queue statistics: {}", e.getMessage(), e);
            return Result.error("Failed to get statistics: " + e.getMessage());
        }
    }

    /**
     * Retry failed tasks
     */
    @Operation(summary = "Retry failed tasks", description = "Re-execute failed AI analysis tasks")
    @PostMapping("/{taskId}/retry")
    public Result<Void> retryTask(@Parameter(description = "Task ID") @PathVariable Long taskId) {
        log.info("Received request to retry task, task ID: {}", taskId);

        try {
            aiAnalysisTaskService.retryTask(taskId);
            return Result.success();
        } catch (BusinessException e) {
            log.warn("Task retry failed: {}", e.getMessage());
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("Exception during task retry: {}", e.getMessage(), e);
            return Result.error("Retry failed: " + e.getMessage());
        }
    }

    /**
     * Batch retry failed tasks
     */
    @Operation(summary = "Batch retry failed tasks", description = "Batch re-execute failed AI analysis tasks")
    @PostMapping("/batch-retry")
    public Result<Map<String, Object>> batchRetryTasks(
            @Parameter(description = "List of task IDs") @RequestBody List<Long> taskIds) {
        log.info("Received batch retry task request, task count: {}", taskIds.size());

        if (taskIds == null || taskIds.isEmpty()) {
            return Result.error("Task ID list cannot be empty");
        }

        if (taskIds.size() > 50) {
            return Result.error("Cannot batch retry more than 50 tasks at once");
        }

        try {
            Map<String, Object> result = aiAnalysisTaskService.batchRetryTasks(taskIds);
            log.info("Batch retry tasks completed, success: {}, failed: {}",
                    result.get("successCount"), result.get("failCount"));
            return Result.success(result);
        } catch (Exception e) {
            log.error("Exception during batch task retry: {}", e.getMessage(), e);
            return Result.error("Batch retry failed: " + e.getMessage());
        }
    }
}

