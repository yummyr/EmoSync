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

        log.info("创建AI分析任务，日记ID: {}, 用户ID: {}, 任务类型: {}", diaryId, userId, taskType.getCode());

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
        log.info("AI分析任务创建成功，任务ID: {}", task.getId());
        return task.getId();

    }


    /**
     * 更新任务状态为处理中
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
     * 标记任务完成
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
        log.warn("任务标记为失败，任务ID: {}, 错误: {}", taskId, errorMessage);
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

            // Specification 动态条件
            Specification<AiAnalysisTask> spec = (root, query, cb) -> {
                List<Predicate> predicates = new ArrayList<>();

                // 使用 Join 访问关联的 User 实体
                if (queryDTO.getUserId() != null) {
                    Join<AiAnalysisTask, User> userJoin = root.join("user", JoinType.LEFT);
                    predicates.add(cb.equal(userJoin.get("id"), queryDTO.getUserId()));
                }
                // 状态
                if (StringUtils.hasText(queryDTO.getStatus())) {
                    predicates.add(cb.equal(root.get("status"), queryDTO.getStatus()));
                }

                // 任务类型
                if (StringUtils.hasText(queryDTO.getTaskType())) {
                    predicates.add(cb.equal(root.get("taskType"), queryDTO.getTaskType()));
                }


                // 优先级
                if (queryDTO.getPriority() != null) {
                    predicates.add(cb.equal(root.get("priority"), queryDTO.getPriority()));
                }

                // 开始时间
                if (StringUtils.hasText(queryDTO.getStartTime())) {
                    LocalDateTime start = LocalDateTime.parse(queryDTO.getStartTime(), DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                    predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), start));
                }

                // 结束时间
                if (StringUtils.hasText(queryDTO.getEndTime())) {
                    LocalDateTime end = LocalDateTime.parse(queryDTO.getEndTime(), DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                    predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), end));
                }

                // 仅失败
                if (Boolean.TRUE.equals(queryDTO.getFailedOnly())) {
                    predicates.add(cb.equal(root.get("status"), AiTaskStatus.FAILED.getCode()));
                }

                // 可重试 (status = FAILED AND retry < maxRetry)
                if (Boolean.TRUE.equals(queryDTO.getRetryableOnly())) {
                    predicates.add(cb.equal(root.get("status"), AiTaskStatus.FAILED.getCode()));
                    predicates.add(
                            cb.lessThan(root.get("retryCount"), root.get("maxRetryCount"))
                    );
                }

                return cb.and(predicates.toArray(new Predicate[0]));
            };

            // 查询 Page
            Page<AiAnalysisTask> page = aiAnalysisTaskRepository.findAll(spec, pageable);

            // 转换 DTO
            List<AiAnalysisTaskResponseDTO> dtoList = page.getContent()
                    .stream()
                    .map(task -> convertToDTO(task))
                    .toList();

            // 返回 PageResult
            return new PageResult<>(page.getTotalElements(), dtoList);

        } catch (Exception e) {
            log.error("查询 AI 分析任务分页失败", e);
            throw new ServiceException("查询任务失败，请稍后重试");
        }
    }

    @Override
    @Transactional
    public void retryTask(Long taskId) {
        log.info("重试AI分析任务，任务ID: {}", taskId);
        AiAnalysisTask task = aiAnalysisTaskRepository.findById(taskId).orElseThrow(
                () -> new BusinessException("No task found to mark as failed"));
        if (!task.canRetry()) {
            throw new BusinessException("任务不可重试：" +
                    (task.getRetryCount() >= task.getMaxRetryCount() ? "已达最大重试次数" : "任务状态不允许重试"));
        }

        task.setStatus(AiTaskStatus.PENDING.getCode());
        aiAnalysisTaskRepository.save(task);
        log.info("任务重试状态重置完成，任务ID: {}", taskId);
    }

    @Override
    @Transactional
    public Map<String, Object> batchRetryTasks(List<Long> taskIds) {

        log.info("批量重试AI分析任务，任务数量: {}", taskIds.size());

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
                log.warn("批量重试任务失败，任务ID: {}, 错误: {}", id, e.getMessage());
            }
        }
        result.put("totalCount", taskIds.size());
        result.put("successCount", successCount);
        result.put("failCount", failCount);
        result.put("failReasons", failReasons);
        log.info("批量重试任务完成，总数: {}, 成功: {}, 失败: {}", taskIds.size(), successCount, failCount);
        return result;
    }

    /**
     * 获取队列统计信息
     */
    @Override
    public Map<String, Object> getQueueStatistics() {
        log.info("获取AI分析队列统计信息");

        Map<String, Object> stats = new HashMap<>();

        // 获取所有任务
        List<AiAnalysisTask> allTasks = aiAnalysisTaskRepository.findAll();

        // 按状态统计
        Map<String, Long> statusStats = allTasks.stream()
                .collect(Collectors.groupingBy(AiAnalysisTask::getStatus, Collectors.counting()));

        stats.put("totalTasks", allTasks.size());
        stats.put("pendingTasks", statusStats.getOrDefault(AiTaskStatus.PENDING.getCode(), 0L));
        stats.put("processingTasks", statusStats.getOrDefault(AiTaskStatus.PROCESSING.getCode(), 0L));
        stats.put("completedTasks", statusStats.getOrDefault(AiTaskStatus.COMPLETED.getCode(), 0L));
        stats.put("failedTasks", statusStats.getOrDefault(AiTaskStatus.FAILED.getCode(), 0L));

        // 可重试任务
        long retryable = allTasks.stream()
                .filter(AiAnalysisTask::canRetry)
                .count();
        stats.put("retryableTasks", retryable);

        // 按任务类型统计
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
