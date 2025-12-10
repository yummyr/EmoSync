package com.emosync.service;

import com.emosync.DTO.command.EmotionDiaryCreateDTO;
import com.emosync.DTO.command.EmotionDiaryUpdateDTO;
import com.emosync.DTO.query.EmotionDiaryQueryDTO;
import com.emosync.DTO.response.EmotionDiaryResponseDTO;
import com.emosync.DTO.response.EmotionDiaryStatisticsDTO;
import com.emosync.Result.PageResult;
import com.emosync.enumClass.AiTaskType;
import org.springframework.stereotype.Service;
import com.emosync.AiService.StructOutPut;

import java.time.LocalDate;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
@Service
public interface EmotionDiaryService {
    EmotionDiaryResponseDTO createOrUpdateDiary(Long userId, EmotionDiaryCreateDTO createDTO, Boolean isEditMode);

    EmotionDiaryResponseDTO updateDiary(Long userId, EmotionDiaryUpdateDTO updateDTO);

    EmotionDiaryResponseDTO getDiaryById(Long userId, Long diaryId);

    EmotionDiaryResponseDTO getDiaryByDate(Long userId, LocalDate date);

    PageResult<EmotionDiaryResponseDTO> selectPage(EmotionDiaryQueryDTO queryDTO);

    void deleteDiary(Long userId, Long diaryId);

    EmotionDiaryStatisticsDTO getStatistics(Long userId, Integer days);

    StructOutPut.EmotionAnalysisResult getAiEmotionAnalysis(Long diaryId);

    CompletableFuture<Void> performAiEmotionAnalysisAsync(Long diaryId, String diaryContent, AiTaskType taskType, Integer priority);


    CompletableFuture<Void> performAiEmotionAnalysisAsync(Long diaryId, String diaryContent);

    EmotionDiaryStatisticsDTO getAdminStatistics(Long userId, Integer days);

    void adminDeleteDiary(Long id);

    // PageResult<EmotionDiaryResponseDTO> selectAdminPage(EmotionDiaryQueryDTO queryDTO);

    EmotionDiaryStatisticsDTO getSystemOverview();

    void adminTriggerAiAnalysis(Long id);

    Map<String, Object> adminBatchTriggerAiAnalysis(List<Long> diaryIds);
}
