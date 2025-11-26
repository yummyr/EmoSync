package com.emosync.service;


import com.emosync.DTO.query.AiAnalysisTaskQueryDTO;
import com.emosync.DTO.response.AiAnalysisTaskResponseDTO;
import com.emosync.Result.PageResult;
import com.emosync.enumClass.AiTaskType;
import org.springframework.stereotype.Service;

import java.util.*;
@Service
public interface AiAnalysisTaskService {
    Long createTask(Long diaryId, Long userId, AiTaskType taskType, Integer priority);

    void markAsProcessing(Long taskId);

    void markAsCompleted(Long taskId);

    void markAsFailed(Long taskId, String errorMessage);

    PageResult<AiAnalysisTaskResponseDTO> getTaskPage(AiAnalysisTaskQueryDTO queryDTO);

    void retryTask(Long taskId);

    Map<String, Object> batchRetryTasks(List<Long> taskIds);

    Map<String, Object> getQueueStatistics();

}
