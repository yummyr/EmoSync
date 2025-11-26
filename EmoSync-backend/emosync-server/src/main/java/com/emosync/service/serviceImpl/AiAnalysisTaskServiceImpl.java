package com.emosync.service.serviceImpl;

import com.emosync.DTO.query.AiAnalysisTaskQueryDTO;
import com.emosync.DTO.response.AiAnalysisTaskResponseDTO;
import com.emosync.Result.PageResult;
import com.emosync.enumClass.AiTaskType;
import com.emosync.service.AiAnalysisTaskService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
@Service
public class AiAnalysisTaskServiceImpl implements AiAnalysisTaskService {
    @Override
    public Long createTask(Long diaryId, Long userId, AiTaskType taskType, Integer priority) {
        return null;
    }

    @Override
    public void markAsProcessing(Long taskId) {

    }

    @Override
    public void markAsCompleted(Long taskId) {

    }

    @Override
    public void markAsFailed(Long taskId, String errorMessage) {

    }

    @Override
    public PageResult<AiAnalysisTaskResponseDTO> getTaskPage(AiAnalysisTaskQueryDTO queryDTO) {
        return null;
    }

    @Override
    public void retryTask(Long taskId) {

    }

    @Override
    public Map<String, Object> batchRetryTasks(List<Long> taskIds) {
        return null;
    }

    @Override
    public Map<String, Object> getQueueStatistics() {
        return null;
    }
}
