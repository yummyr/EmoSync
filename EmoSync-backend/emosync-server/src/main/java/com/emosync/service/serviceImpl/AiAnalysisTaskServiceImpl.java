package com.emosync.service.serviceImpl;

import com.emosync.DTO.query.AiAnalysisTaskQueryDTO;
import com.emosync.DTO.response.AiAnalysisTaskResponseDTO;
import com.emosync.Result.PageResult;
import com.emosync.entity.AiAnalysisTask;
import com.emosync.entity.User;
import com.emosync.enumClass.AiTaskStatus;
import com.emosync.enumClass.AiTaskType;
import com.emosync.exception.BusinessException;
import com.emosync.exception.ServiceException;
import com.emosync.repository.AiAnalysisTaskRepository;
import com.emosync.repository.EmotionDiaryRepository;
import com.emosync.repository.UserRepository;
import com.emosync.service.AiAnalysisTaskService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class AiAnalysisTaskServiceImpl implements AiAnalysisTaskService {
    private final AiAnalysisTaskRepository aiAnalysisTaskRepository;
    private final UserRepository userRepository;
    private final EmotionDiaryRepository emotionDiaryRepository;

    @Override
    @Transactional
    public Long createTask(Long diaryId, Long userId, AiTaskType taskType, Integer priority) {

        log.info("Creating AI analysis task, diary ID: {}, user ID: {}, task type: {}", diaryId, userId, taskType.getCode());

        AiAnalysisTask task = new AiAnalysisTask();
        task.setDiary(emotionDiaryRepository.findById(diaryId).orElseThrow(null));
        task.setUser(userRepository.findById(userId).orElseThrow(null));
        task.setStatus(AiTaskStatus.PENDING.getCode());
        task.setTaskType(taskType.getCode());
        task.setPriority(priority != null ? priority : 2);
        task.setRetryCount(0);
        task.setMaxRetryCount(3);
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        aiAnalysisTaskRepository.save(task);
        log.info("AI analysis task created successfully, task ID: {}", task.getId());
        return task.getId();

    }


    /**
     * Update task status to processing
     */
    @Override
    @Transactional
    public void markAsProcessing(Long taskId) {
        AiAnalysisTask task = aiAnalysisTaskRepository.findById(taskId).orElseThrow(() -> new BusinessException("No task found to mark as processing"));
        task.setStatus(AiTaskStatus.PROCESSING.getCode());
        task.setStartedAt(LocalDateTime.now());
        aiAnalysisTaskRepository.save(task);
        log.info("Task status updated to processing, task id: {}", taskId);

    }

    /**
     * Mark task as completed
     */
    @Override
    @Transactional
    public void markAsCompleted(Long taskId) {
        AiAnalysisTask task = aiAnalysisTaskRepository.findById(taskId).orElseThrow(() -> new BusinessException("No task found to mark as completed"));
        task.setStatus(AiTaskStatus.COMPLETED.getCode());
        task.setCompletedAt(LocalDateTime.now());
        aiAnalysisTaskRepository.save(task);
        log.info("Task status updated to completed, task id: {}", taskId);
    }

    @Override
    @Transactional
    public void markAsFailed(Long taskId, String errorMessage) {
        AiAnalysisTask task = aiAnalysisTaskRepository.findById(taskId).orElseThrow(() -> new BusinessException("No task found to mark as failed"));
        task.setStatus(AiTaskStatus.FAILED.getCode());
        task.setErrorMessage(errorMessage);
        task.setRetryCount(task.getRetryCount() + 1);
        aiAnalysisTaskRepository.save(task);
        log.warn("Task marked as failed, task ID: {}, error: {}", taskId, errorMessage);
    }

    @Override
    public PageResult<AiAnalysisTaskResponseDTO> getTaskPage(AiAnalysisTaskQueryDTO queryDTO) {
        try {
            // Pageable
            Pageable pageable = PageRequest.of(
                    (int) (queryDTO.getCurrent() - 1),
                    queryDTO.getSize().intValue(),
                    Sort.by(Sort.Direction.DESC, "createdAt")
            );

            // Specification dynamic conditions
            Specification<AiAnalysisTask> spec = (root, query, cb) -> {
                List<Predicate> predicates = new ArrayList<>();

                // Use Join to access associated User entity
                if (queryDTO.getUserId() != null) {
                    Join<AiAnalysisTask, User> userJoin = root.join("user", JoinType.LEFT);
                    predicates.add(cb.equal(userJoin.get("id"), queryDTO.getUserId()));
                }
                // Status
                if (StringUtils.hasText(queryDTO.getStatus())) {
                    predicates.add(cb.equal(root.get("status"), queryDTO.getStatus()));
                }

                // Task type
                if (StringUtils.hasText(queryDTO.getTaskType())) {
                    predicates.add(cb.equal(root.get("taskType"), queryDTO.getTaskType()));
                }


                // Priority
                if (queryDTO.getPriority() != null) {
                    predicates.add(cb.equal(root.get("priority"), queryDTO.getPriority()));
                }

                // Start time
                if (StringUtils.hasText(queryDTO.getStartTime())) {
                    LocalDateTime start = LocalDateTime.parse(queryDTO.getStartTime(), DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                    predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), start));
                }

                // End time
                if (StringUtils.hasText(queryDTO.getEndTime())) {
                    LocalDateTime end = LocalDateTime.parse(queryDTO.getEndTime(), DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                    predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), end));
                }

                // Failed only
                if (Boolean.TRUE.equals(queryDTO.getFailedOnly())) {
                    predicates.add(cb.equal(root.get("status"), AiTaskStatus.FAILED.getCode()));
                }

                // Retryable (status = FAILED AND retry < maxRetry)
                if (Boolean.TRUE.equals(queryDTO.getRetryableOnly())) {
                    predicates.add(cb.equal(root.get("status"), AiTaskStatus.FAILED.getCode()));
                    predicates.add(
                            cb.lessThan(root.get("retryCount"), root.get("maxRetryCount"))
                    );
                }

                return cb.and(predicates.toArray(new Predicate[0]));
            };

            // Query Page
            Page<AiAnalysisTask> page = aiAnalysisTaskRepository.findAll(spec, pageable);

            // Convert DTO
            List<AiAnalysisTaskResponseDTO> dtoList = page.getContent()
                    .stream()
                    .map(task -> convertToDTO(task))
                    .toList();

            // Return PageResult
            return new PageResult<>(page.getTotalElements(), dtoList);

        } catch (Exception e) {
            log.error("Failed to query AI analysis task pagination", e);
            throw new ServiceException("Task query failed, please try again later");
        }
    }

    @Override
    @Transactional
    public void retryTask(Long taskId) {
        log.info("Retrying AI analysis task, task ID: {}", taskId);
        AiAnalysisTask task = aiAnalysisTaskRepository.findById(taskId).orElseThrow(
                () -> new BusinessException("No task found to mark as failed"));
        if (!task.canRetry()) {
            throw new BusinessException("Task cannot be retried: " +
                    (task.getRetryCount() >= task.getMaxRetryCount() ? "Maximum retry count reached" : "Task status does not allow retry"));
        }

        task.setStatus(AiTaskStatus.PENDING.getCode());
        aiAnalysisTaskRepository.save(task);
        log.info("Task retry status reset completed, task ID: {}", taskId);
    }

    @Override
    @Transactional
    public Map<String, Object> batchRetryTasks(List<Long> taskIds) {

        log.info("Batch retrying AI analysis tasks, task count: {}", taskIds.size());

        Map<String, Object> result = new HashMap<>();
        int successCount = 0;
        int failCount = 0;
        List<String> failReasons = new ArrayList<>();

        for (Long id : taskIds) {
            try {
                retryTask(id);
                successCount++;
            } catch (Exception e) {
                failCount++;
                failReasons.add("Task id " + id + e.getMessage());
                log.warn("Batch retry task failed, task ID: {}, error: {}", id, e.getMessage());
            }
        }
        result.put("totalCount", taskIds.size());
        result.put("successCount", successCount);
        result.put("failCount", failCount);
        result.put("failReasons", failReasons);
        log.info("Batch retry task completed, total: {}, success: {}, failed: {}", taskIds.size(), successCount, failCount);
        return result;
    }

    /**
     * Get queue statistics
     */
    @Override
    public Map<String, Object> getQueueStatistics() {
        log.info("Getting AI analysis queue statistics");

        Map<String, Object> stats = new HashMap<>();

        // Get all tasks
        List<AiAnalysisTask> allTasks = aiAnalysisTaskRepository.findAll();

        // Count by status
        Map<String, Long> statusStats = allTasks.stream()
                .collect(Collectors.groupingBy(AiAnalysisTask::getStatus, Collectors.counting()));

        stats.put("totalTasks", allTasks.size());
        stats.put("pendingTasks", statusStats.getOrDefault(AiTaskStatus.PENDING.getCode(), 0L));
        stats.put("processingTasks", statusStats.getOrDefault(AiTaskStatus.PROCESSING.getCode(), 0L));
        stats.put("completedTasks", statusStats.getOrDefault(AiTaskStatus.COMPLETED.getCode(), 0L));
        stats.put("failedTasks", statusStats.getOrDefault(AiTaskStatus.FAILED.getCode(), 0L));

        // Retryable tasks
        long retryable = allTasks.stream()
                .filter(AiAnalysisTask::canRetry)
                .count();
        stats.put("retryableTasks", retryable);

        // Count by task type
        Map<String, Long> typeStats = allTasks.stream()
                .collect(Collectors.groupingBy(AiAnalysisTask::getTaskType, Collectors.counting()));
        stats.put("taskTypeStats", typeStats);

        return stats;
    }

    private AiAnalysisTaskResponseDTO convertToDTO(AiAnalysisTask task) {

        AiAnalysisTaskResponseDTO dto = new AiAnalysisTaskResponseDTO();

        dto.setId(task.getId());
        dto.setDiaryId(task.getDiary().getId());
        dto.setUserId(task.getUser().getId());
        dto.setUsername(task.getUser().getUsername());

        dto.setStatus(task.getStatus());
        dto.setStatusDescription(AiTaskStatus.fromCode(task.getStatus()).getDescription());

        dto.setTaskType(task.getTaskType());
        dto.setTaskTypeDescription(AiTaskType.fromCode(task.getTaskType()).getDescription());
        if (task.getStartedAt() != null && task.getCompletedAt() != null) {
            dto.setProcessingTimeMs(
                    Duration.between(task.getStartedAt(), task.getCompletedAt()).toMillis()
            );
        }
        dto.setPriority(task.getPriority());

        dto.setRetryCount(task.getRetryCount());
        dto.setMaxRetryCount(task.getMaxRetryCount());
        dto.setErrorMessage(task.getErrorMessage());
        dto.setStartedAt(task.getStartedAt());
        dto.setCompletedAt(task.getCompletedAt());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());


        dto.setCanRetry(task.getRetryCount() < task.getMaxRetryCount());

        return dto;
    }

}
