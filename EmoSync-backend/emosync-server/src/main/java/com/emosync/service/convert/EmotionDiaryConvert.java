package com.emosync.service.convert;

import com.emosync.DTO.command.EmotionDiaryCreateDTO;
import com.emosync.DTO.command.EmotionDiaryUpdateDTO;
import com.emosync.DTO.response.EmotionDiaryResponseDTO;
import com.emosync.DTO.response.EmotionDiaryStatisticsDTO;
import com.emosync.entity.EmotionDiary;
import com.emosync.entity.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Emotion diary conversion class
 */
public class EmotionDiaryConvert {

    /**
     * Convert create command DTO to EmotionDiary entity
     * @param createDTO Create command DTO
     * @param userId User ID
     * @return EmotionDiary entity
     */
    public static EmotionDiary createCommandToEntity(EmotionDiaryCreateDTO createDTO, Long userId) {
        EmotionDiary diary = new EmotionDiary();
        User user = new User();
        user.setId(userId);
        diary.setUser(user);

        diary.setDiaryDate(createDTO.getDiaryDate());
        diary.setMoodScore(createDTO.getMoodScore());
        diary.setDominantEmotion(createDTO.getDominantEmotion());
        diary.setEmotionTriggers(createDTO.getEmotionTriggers());
        diary.setDiaryContent(createDTO.getDiaryContent());
        diary.setSleepQuality(createDTO.getSleepQuality());
        diary.setStressLevel(createDTO.getStressLevel());
        diary.setCreatedAt(LocalDateTime.now());
        diary.setUpdatedAt(LocalDateTime.now());
        return diary;
    }

    /**
     * Convert update command DTO to EmotionDiary entity (for update operations)
     * @param updateDTO Update command DTO
     * @return EmotionDiary entity
     */
    public static EmotionDiary updateCommandToEntity(EmotionDiaryUpdateDTO updateDTO) {
        EmotionDiary diary = new EmotionDiary();
        diary.setId(updateDTO.getId());
        diary.setMoodScore(updateDTO.getMoodScore());
        diary.setDominantEmotion(updateDTO.getDominantEmotion());
        diary.setEmotionTriggers(updateDTO.getEmotionTriggers());
        diary.setDiaryContent(updateDTO.getDiaryContent());
        diary.setSleepQuality(updateDTO.getSleepQuality());
        diary.setStressLevel(updateDTO.getStressLevel());
        diary.setUpdatedAt(LocalDateTime.now());
        return diary;
    }

    /**
     * Convert EmotionDiary entity to response DTO
     * @param diary EmotionDiary entity
     * @param user Associated user information (optional)
     * @return Emotion diary response DTO
     */
    public static EmotionDiaryResponseDTO entityToResponse(EmotionDiary diary, User user) {
        EmotionDiaryResponseDTO responseDTO = new EmotionDiaryResponseDTO();
        responseDTO.setId(diary.getId());

        responseDTO.setUserId(diary.getUser() != null ? diary.getUser().getId() : null);
        responseDTO.setUsername(diary.getUser() != null ? diary.getUser().getUsername() :null);
        responseDTO.setNickname(diary.getUser() != null ? diary.getUser().getNickname() :null);

        responseDTO.setDiaryDate(diary.getDiaryDate());
        responseDTO.setMoodScore(diary.getMoodScore());
        responseDTO.setDominantEmotion(diary.getDominantEmotion());
        responseDTO.setEmotionTriggers(diary.getEmotionTriggers());
        responseDTO.setDiaryContent(diary.getDiaryContent());
        // Set diary content preview
        if (diary.getDiaryContent() != null) {
            String preview = diary.getDiaryContent().length() > 100 
                ? diary.getDiaryContent().substring(0, 100) + "..." 
                : diary.getDiaryContent();
            responseDTO.setDiaryContentPreview(preview);
        }
        responseDTO.setSleepQuality(diary.getSleepQuality());
        responseDTO.setStressLevel(diary.getStressLevel());
        responseDTO.setCreatedAt(diary.getCreatedAt());
        responseDTO.setUpdatedAt(diary.getUpdatedAt());
        responseDTO.setAiEmotionAnalysis(diary.getAiEmotionAnalysis());
        responseDTO.setAiAnalysisUpdatedAt(diary.getAiAnalysisUpdatedAt());
        responseDTO.setHasAiEmotionAnalysis(
                diary.getAiEmotionAnalysis() != null && !diary.getAiEmotionAnalysis().trim().isEmpty()
        );

        // Set AI analysis status
        if (diary.getAiEmotionAnalysis() != null && !diary.getAiEmotionAnalysis().trim().isEmpty()) {
            responseDTO.setAiAnalysisStatus("COMPLETED");
        } else if (diary.getAiAnalysisUpdatedAt() != null) {
            // If there is update time but no analysis result, check if analysis failed
            // If update time is more than 10 minutes ago and no result, consider analysis failed
            LocalDateTime now = LocalDateTime.now();
            long minutesSinceUpdate = java.time.Duration.between(diary.getAiAnalysisUpdatedAt(), now).toMinutes();
            if (minutesSinceUpdate > 10) {
                responseDTO.setAiAnalysisStatus("FAILED");
            } else {
                responseDTO.setAiAnalysisStatus("PENDING");
            }
        } else {
            responseDTO.setAiAnalysisStatus("PENDING");
        }

        // Set user information (if provided)
        if (user != null) {
            responseDTO.setUsername(user.getUsername());
            responseDTO.setNickname(user.getNickname());
            responseDTO.setUserNickname(user.getNickname() != null ? user.getNickname() : user.getUsername());
        }

        return responseDTO;
    }

    /**
     * Convert EmotionDiary entity to response DTO (without user information)
     * @param diary EmotionDiary entity
     * @return Emotion diary response DTO
     */
    public static EmotionDiaryResponseDTO entityToResponse(EmotionDiary diary) {
        return entityToResponse(diary, null);
    }

    /**
     * Batch convert EmotionDiary entity list to response DTO list
     * @param diaries EmotionDiary entity list
     * @return Emotion diary response DTO list
     */
    public static List<EmotionDiaryResponseDTO> entityListToResponseList(List<EmotionDiary> diaries) {
        return diaries.stream()
                .map(EmotionDiaryConvert::entityToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Batch convert EmotionDiary entity list to response DTO list (with user information mapping)
     * @param diaries EmotionDiary entity list
     * @param userMap User information mapping (userId -> User)
     * @return Emotion diary response DTO list
     */
    public static List<EmotionDiaryResponseDTO> entityListToResponseList(List<EmotionDiary> diaries,
                                                                       Map<Long, User> userMap) {
        return diaries.stream()
                .map(diary -> entityToResponse(diary, userMap.get(diary.getUser().getId())))
                .collect(Collectors.toList());
    }

    /**
     * Build emotion trend data
     * @param dateLabel Date label
     * @param moodScore Mood score
     * @param dominantEmotion Dominant emotion
     * @return Emotion trend data
     */
    public static EmotionDiaryStatisticsDTO.MoodTrendData buildMoodTrendData(String dateLabel,
                                                                              Integer moodScore,
                                                                              String dominantEmotion) {
        EmotionDiaryStatisticsDTO.MoodTrendData trendData = new EmotionDiaryStatisticsDTO.MoodTrendData();
        trendData.setDateLabel(dateLabel);
        trendData.setMoodScore(moodScore);
        trendData.setDominantEmotion(dominantEmotion);
        return trendData;
    }
}
