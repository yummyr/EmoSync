package com.emosync.service.serviceImpl;

import com.emosync.DTO.command.EmotionDiaryCreateDTO;
import com.emosync.DTO.command.EmotionDiaryUpdateDTO;
import com.emosync.DTO.query.EmotionDiaryQueryDTO;
import com.emosync.DTO.response.EmotionDiaryResponseDTO;
import com.emosync.DTO.response.EmotionDiaryStatisticsDTO;
import com.emosync.Result.PageResult;
import com.emosync.enumClass.AiTaskType;
import com.emosync.service.EmotionDiaryService;
import com.emosync.AiService.StructOutPut;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
@Service
public class EmotionDiaryServiceImpl implements EmotionDiaryService {
    @Override
    public EmotionDiaryResponseDTO createOrUpdateDiary(Long userId, EmotionDiaryCreateDTO createDTO, Boolean isEditMode) {
        return null;
    }

    @Override
    public EmotionDiaryResponseDTO updateDiary(Long userId, EmotionDiaryUpdateDTO updateDTO) {
        return null;
    }

    @Override
    public EmotionDiaryResponseDTO getDiaryById(Long userId, Long diaryId) {
        return null;
    }

    @Override
    public EmotionDiaryResponseDTO getDiaryByDate(Long userId, LocalDate date) {
        return null;
    }

    @Override
    public PageResult<EmotionDiaryResponseDTO> selectPage(EmotionDiaryQueryDTO queryDTO) {
        return null;
    }

    @Override
    public void deleteDiary(Long userId, Long diaryId) {

    }

    @Override
    public EmotionDiaryStatisticsDTO getStatistics(Long userId, Integer days) {
        return null;
    }

    @Override
    public StructOutPut.EmotionAnalysisResult getAiEmotionAnalysis(Long diaryId) {
        return null;
    }

    @Override
    public CompletableFuture<Void> performAiEmotionAnalysisAsync(Long diaryId, String diaryContent, AiTaskType taskType, Integer priority) {
        return null;
    }

    @Override
    public CompletableFuture<Void> performAiEmotionAnalysisAsync(Long diaryId, String diaryContent) {
        return null;
    }

    @Override
    public EmotionDiaryStatisticsDTO getAdminStatistics(Long userId, Integer days) {
        return null;
    }

    @Override
    public void adminDeleteDiary(Long id) {

    }

    @Override
    public PageResult<EmotionDiaryResponseDTO> selectAdminPage(EmotionDiaryQueryDTO queryDTO) {
        return null;
    }

    @Override
    public EmotionDiaryStatisticsDTO getSystemOverview() {
        return null;
    }

    @Override
    public void adminTriggerAiAnalysis(Long id) {

    }

    @Override
    public Map<String, Object> adminBatchTriggerAiAnalysis(List<Long> diaryIds) {
        return null;
    }
}
