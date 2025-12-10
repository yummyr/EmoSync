package com.emosync.service.serviceImpl;


import com.emosync.AiService.StructOutPut;
import com.emosync.DTO.command.EmotionDiaryCreateDTO;
import com.emosync.DTO.command.EmotionDiaryUpdateDTO;
import com.emosync.DTO.query.EmotionDiaryQueryDTO;
import com.emosync.DTO.response.EmotionDiaryResponseDTO;
import com.emosync.DTO.response.EmotionDiaryStatisticsDTO;
import com.emosync.Result.PageResult;
import com.emosync.entity.EmotionDiary;
import com.emosync.enumClass.AiTaskType;
import com.emosync.exception.BusinessException;
import com.emosync.repository.EmotionDiaryRepository;
import com.emosync.security.UserDetailsImpl;
import com.emosync.service.AiAnalysisTaskService;
import com.emosync.service.EmotionDiaryService;
import com.emosync.AiService.PsychologicalSupportService;
import com.emosync.service.convert.EmotionDiaryConvert;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmotionDiaryServiceImpl implements EmotionDiaryService {
    private final EmotionDiaryRepository emotionDiaryRepository;
    private final PsychologicalSupportService psychologicalSupportService;
    private final AiAnalysisTaskService aiAnalysisTaskService;

    /**
     * Get current authenticated UserDetailsImpl
     */
    private UserDetailsImpl getCurrentUserInfo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !(auth.getPrincipal() instanceof UserDetailsImpl)) {
            return null;
        }
        return (UserDetailsImpl) auth.getPrincipal();
    }

    /**
     * Check if current user has ROLE_ADMIN
     */
    private boolean isAdmin() {
        UserDetailsImpl userDetails = getCurrentUserInfo();
        return userDetails != null && userDetails.isAdmin();
    }

    @Override
    public EmotionDiaryResponseDTO createOrUpdateDiary(Long userId, EmotionDiaryCreateDTO createDTO, Boolean isEditMode) {
        EmotionDiary diary = (EmotionDiary) emotionDiaryRepository.findByUserIdAndDiaryDate(userId, createDTO.getDiaryDate())
                .map(existing -> updateExistingDiary(existing, createDTO))
                .orElseGet(() -> emotionDiaryRepository.save(EmotionDiaryConvert.createCommandToEntity(createDTO, userId)));

        if (diary.getDiaryContent() != null && !diary.getDiaryContent().trim().isEmpty()) {
            performAiEmotionAnalysisAsync(diary.getId(), diary.getDiaryContent());
        }

        return EmotionDiaryConvert.entityToResponse(diary);
    }

    private EmotionDiary updateExistingDiary(EmotionDiary diary, EmotionDiaryCreateDTO dto) {
        diary.setMoodScore(dto.getMoodScore());
        diary.setDominantEmotion(dto.getDominantEmotion());
        diary.setDiaryContent(dto.getDiaryContent());
        diary.setEmotionTriggers(dto.getEmotionTriggers());
        diary.setSleepQuality(dto.getSleepQuality());
        diary.setStressLevel(dto.getStressLevel());
        diary.setAiEmotionAnalysis(null);
        diary.setAiAnalysisUpdatedAt(null);

        return emotionDiaryRepository.save(diary);
    }

    @Override
    public EmotionDiaryResponseDTO updateDiary(Long userId, EmotionDiaryUpdateDTO dto) {

        EmotionDiary diary = emotionDiaryRepository.findById(dto.getId())
                .orElseThrow(() -> new BusinessException("Diary not found"));

        // Get current user info
        UserDetailsImpl currentUser = getCurrentUserInfo();

        // Check permission: owner or admin can update
        boolean isOwner = Objects.equals(diary.getUser().getId(), userId);
        boolean isAdmin = currentUser != null && currentUser.isAdmin();

        if (!isOwner && !isAdmin) {
            throw new BusinessException("No permission to modify this diary");
        }

        if (dto.getMoodScore() != null) diary.setMoodScore(dto.getMoodScore());
        if (dto.getDiaryContent() != null) diary.setDiaryContent(dto.getDiaryContent());
        if (dto.getDominantEmotion() != null) diary.setDominantEmotion(dto.getDominantEmotion());
        if (dto.getEmotionTriggers() != null) diary.setEmotionTriggers(dto.getEmotionTriggers());
        if (dto.getSleepQuality() != null) diary.setSleepQuality(dto.getSleepQuality());
        if (dto.getStressLevel() != null) diary.setStressLevel(dto.getStressLevel());

        diary.setAiEmotionAnalysis(null);
        diary.setAiAnalysisUpdatedAt(null);

        emotionDiaryRepository.save(diary);

        if (diary.getDiaryContent() != null) {
            performAiEmotionAnalysisAsync(diary.getId(), diary.getDiaryContent());
        }

        return EmotionDiaryConvert.entityToResponse(diary);
    }

    @Override
    public EmotionDiaryResponseDTO getDiaryById(Long userId, Long diaryId) {
        EmotionDiary d = emotionDiaryRepository.findById(diaryId)
                .orElseThrow(() -> new BusinessException("Diary not found"));

        // Get current user info
        UserDetailsImpl currentUser = getCurrentUserInfo();

        // Check permission: owner or admin can access
        boolean isOwner = Objects.equals(d.getUser().getId(), userId);
        boolean isAdmin = currentUser != null && currentUser.isAdmin();

        if (!isOwner && !isAdmin) {
            throw new BusinessException("No permission to access");
        }

        return EmotionDiaryConvert.entityToResponse(d);
    }

    @Override
    public EmotionDiaryResponseDTO getDiaryByDate(Long userId, LocalDate date) {
        return emotionDiaryRepository.findByUserIdAndDiaryDate(userId, date)
                .map(EmotionDiaryConvert::entityToResponse)
                .orElse(null);
    }

    @Override
    public PageResult<EmotionDiaryResponseDTO> selectPage(EmotionDiaryQueryDTO queryDTO) {
        Pageable pageable = PageRequest.of(
                queryDTO.getCurrent() - 1,
                queryDTO.getSize(),
                Sort.by(Sort.Direction.DESC, "diaryDate")
        );
        Specification<EmotionDiary> spec = buildSpecification(queryDTO);

        Page<EmotionDiary> page = emotionDiaryRepository.findAll(spec, pageable);

        List<EmotionDiaryResponseDTO> dtoList =
                page.getContent().stream()
                        .map(EmotionDiaryConvert::entityToResponse)
                        .toList();

        return new PageResult<>(page.getTotalElements(), dtoList);
    }

    @Override
    @Transactional
    public void deleteDiary(Long userId, Long diaryId) {
        EmotionDiary d = emotionDiaryRepository.findById(diaryId)
                .orElseThrow(() -> new BusinessException("Diary not found"));

        // Get current user info
        UserDetailsImpl currentUser = getCurrentUserInfo();

        // Check permission: owner or admin can delete
        boolean isOwner = Objects.equals(d.getUser().getId(), userId);
        boolean isAdmin = currentUser != null && currentUser.isAdmin();

        if (!isOwner && !isAdmin) {
            throw new BusinessException("No permission to delete");
        }

        emotionDiaryRepository.delete(d);
    }

    @Override
    public EmotionDiaryStatisticsDTO getStatistics(Long userId, Integer days) {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(days - 1);

        List<EmotionDiary> diaries =
                emotionDiaryRepository.findByUserIdAndDiaryDateBetween(userId, start, end);

        return calculateStatistics(diaries, days);
    }

    @Override
    public StructOutPut.EmotionAnalysisResult getAiEmotionAnalysis(Long diaryId) {
        EmotionDiary diary = emotionDiaryRepository.findById(diaryId)
                .orElseThrow(() -> new BusinessException("Diary not found"));

        String aiAnalysisJson = diary.getAiEmotionAnalysis();
        if (aiAnalysisJson == null) {
            log.info("AI analysis result is empty for diary ID: {}", diaryId);
            return null;
        }
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readValue(aiAnalysisJson, StructOutPut.EmotionAnalysisResult.class);
        } catch (Exception e) {
            log.error("Failed to parse AI emotion analysis result, diary ID: {}, JSON: {}, error: {}", diaryId, aiAnalysisJson, e.getMessage());
            throw new BusinessException("Failed to parse AI analysis result");
        }
    }


    /**
     * Asynchronously execute AI emotion analysis and update to database (with queue management)
     *
     * @param diaryId      Diary ID
     * @param diaryContent Diary content
     * @param taskType     Task type
     * @param priority     Priority
     */

    @Override
    @Async
    public CompletableFuture<Void> performAiEmotionAnalysisAsync(Long diaryId, String diaryContent, AiTaskType taskType, Integer priority) {
        return CompletableFuture.runAsync(() -> {
            EmotionDiary diary = emotionDiaryRepository.findById(diaryId).orElse(null);
            if (diary == null) {
                log.warn("Diary not found, skip AI analysis, diary ID: {}", diaryId);
                return;
            }
            // Create task record
            Long taskId = aiAnalysisTaskService.createTask(diaryId, diary.getUser().getId(), taskType, priority);

            try {
                log.info("Start asynchronous AI emotion analysis, diary ID: {}, task ID: {}", diaryId, taskId);

                // Mark task as processing
                aiAnalysisTaskService.markAsProcessing(taskId);

                // Set analysis start status
                diary.setAiAnalysisUpdatedAt(LocalDateTime.now());
                emotionDiaryRepository.save(diary);

                // Build complete analysis content
                StringBuilder analysisContent = new StringBuilder();
                analysisContent.append("Mood Score: ").append(diary.getMoodScore()).append("/10\n");
                if (diary.getDominantEmotion() != null) {
                    analysisContent.append("Dominant Emotion: ").append(diary.getDominantEmotion()).append("\n");
                }
                if (diary.getEmotionTriggers() != null) {
                    analysisContent.append("Emotion Triggers: ").append(diary.getEmotionTriggers()).append("\n");
                }
                if (diary.getSleepQuality() != null) {
                    analysisContent.append("Sleep Quality: ").append(diary.getSleepQuality()).append("/5\n");
                }
                if (diary.getStressLevel() != null) {
                    analysisContent.append("Stress Level: ").append(diary.getStressLevel()).append("/5\n");
                }
                analysisContent.append("Diary Content: ").append(diaryContent);

                // Call AI analysis service
                StructOutPut.EmotionAnalysisResult analysisResult =
                        psychologicalSupportService.analyzeUserEmotion(analysisContent.toString());

                if (analysisResult != null) {
                    // Convert analysis result to JSON and save to database
                    ObjectMapper objectMapper = new ObjectMapper();
                    String analysisJson = objectMapper.writeValueAsString(analysisResult);

                    // Update AI analysis result in database
                    diary.setAiEmotionAnalysis(analysisJson);
                    diary.setAiAnalysisUpdatedAt(LocalDateTime.now());
                    emotionDiaryRepository.save(diary);


                    // Mark task as completed
                    aiAnalysisTaskService.markAsCompleted(taskId);

                    log.info("AI emotion analysis completed and saved, diary ID: {}, task ID: {}, dominant emotion: {}, risk level: {}",
                            diaryId, taskId, analysisResult.primaryEmotion(), analysisResult.riskLevel());
                } else {
                    // Mark task as failed
                    aiAnalysisTaskService.markAsFailed(taskId, "AI analysis service returned null");
                    log.warn("AI emotion analysis returned null, diary ID: {}, task ID: {}", diaryId, taskId);
                }

            } catch (Exception e) {
                // Mark task as failed
                aiAnalysisTaskService.markAsFailed(taskId, e.getMessage());
                log.error("Asynchronous AI emotion analysis failed, diary ID: {}, task ID: {}, error: {}", diaryId, taskId, e.getMessage(), e);
            }
        });
    }

    @Override
    public CompletableFuture<Void> performAiEmotionAnalysisAsync(Long diaryId, String content) {
        return performAiEmotionAnalysisAsync(diaryId, content, AiTaskType.AUTO, 1);
    }

    @Override
    public EmotionDiaryStatisticsDTO getAdminStatistics(Long userId, Integer days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1);

        List<EmotionDiary> diaries;
        if (userId != null) {
            // Query statistics for specific user
            diaries = emotionDiaryRepository.findByUserIdAndDiaryDateBetween(
                    userId, startDate, endDate
            );
        } else {
            // Query statistics for all users
            diaries = emotionDiaryRepository.findByDiaryDateBetween(startDate, endDate);
        }

        return calculateStatistics(diaries, days);
    }


    @Override
    public void adminDeleteDiary(Long id) {
        if (!isAdmin()) {
            throw new BusinessException("Not admin, no permission to delete diary!");
        }

        EmotionDiary existing = emotionDiaryRepository.findById(id).orElseThrow(() -> new BusinessException("No diary found"));
        emotionDiaryRepository.delete(existing);
    }

    // @Override
    // public PageResult<EmotionDiaryResponseDTO> selectAdminPage(EmotionDiaryQueryDTO queryDTO) {
    //     return null;
    // }

    @Override
    public EmotionDiaryStatisticsDTO getSystemOverview() {
        EmotionDiaryStatisticsDTO overview = new EmotionDiaryStatisticsDTO();
        Long totalRecords = emotionDiaryRepository.count();
        overview.setRecordedDays(totalRecords.intValue());

        LocalDate today = LocalDate.now();
        Integer todayRecords =  emotionDiaryRepository.findByDiaryDate(today).size();

        overview.setTargetDays(todayRecords);

        LocalDate weekStart = today.minusDays(6);
        List<EmotionDiary> weekDiaries = emotionDiaryRepository.findByDiaryDateBetween(weekStart,today);


        long activeUsers = weekDiaries.stream()
                .filter(diary -> diary.getUser() != null)
                .map(diary -> diary.getUser().getId())
                .distinct()
                .count();
        overview.setPositiveDays((int) activeUsers);

        // Calculate average mood score
        if (!weekDiaries.isEmpty()) {
            double avgMood = weekDiaries.stream()
                    .map(EmotionDiary::getMoodScore)
                    .filter(Objects::nonNull)
                    .mapToInt(Integer::intValue)
                    .average()
                    .orElse(0.0);
            overview.setAverageMoodScore(BigDecimal.valueOf(avgMood).setScale(1, RoundingMode.HALF_UP));
        } else {
            overview.setAverageMoodScore(BigDecimal.ZERO);
        }

        // Emotion distribution
        Map<String, Integer> emotionDistribution = weekDiaries.stream()
                .filter(diary -> diary.getDominantEmotion() != null && !diary.getDominantEmotion().trim().isEmpty())
                .collect(Collectors.groupingBy(
                        EmotionDiary::getDominantEmotion,
                        Collectors.collectingAndThen(Collectors.counting(), Math::toIntExact)
                ));
        overview.setEmotionDistribution(emotionDistribution);

        return overview;
    }

    @Override
    public void adminTriggerAiAnalysis(Long id) {
        log.info("Admin trigger AI analysis，diary ID: {}", id);
        EmotionDiary existing = emotionDiaryRepository.findById(id).orElseThrow(() -> new BusinessException("No diary found"));
        if (!isAdmin()) {
            throw new BusinessException("Not an admin, no permission to trigger Ai analysis");
        }
        String analysisContent = existing.getAnalysisContent();
        if (analysisContent == null) {
            throw new BusinessException("Diary content is empty, can not process Ai analysis");
        }
        performAiEmotionAnalysisAsync(id, analysisContent, AiTaskType.ADMIN, 3);
        log.info("Admin already submit Ai emotion analysis task to queue, diary ID :{}", id);
    }

    @Override
    public Map<String, Object> adminBatchTriggerAiAnalysis(List<Long> diaryIds) {
        log.info("Admin batch trigger Ai analysis, diary total:{}", diaryIds.size());
        Map<String, Object> result = new HashMap<>();
        int successCount = 0;
        int failCount = 0;
        List<String> failReasons = new ArrayList<>();
        for (Long diaryId : diaryIds) {
            try {
                Optional<EmotionDiary> diaryOpt = emotionDiaryRepository.findById(diaryId);

                if (diaryOpt.isEmpty()) {
                    failCount++;
                    failReasons.add("Diary Id " + diaryId + ": not found");
                    continue;
                }

                EmotionDiary diary = diaryOpt.get();
                String analysisContent = diary.getAnalysisContent();
                if (analysisContent == null || analysisContent.trim().isEmpty()) {
                    failCount++;
                    failReasons.add("Diary Id" + diaryId + ":content is empty");
                    continue;
                }
                performAiEmotionAnalysisAsync(diaryId, analysisContent, AiTaskType.BATCH, 2);
                successCount++;
                log.info("Ai analysis task submitted, diary id :{}", diaryId);
            } catch (Exception e) {
                failCount++;
                failReasons.add("Diary Id" + diaryId + ":" + e.getMessage());
                log.warn("Batch Ai analysis task failed, diary Id:{}, error message:{}", diaryId, e.getMessage());
            }
        }

        result.put("totalCount", diaryIds.size());
        result.put("successCount", successCount);
        result.put("failCount", failCount);
        result.put("failReasons", failReasons);

        log.info("Admin batch Ai analysis tasks finished，total: {}, succeed: {}, failed: {}",
                diaryIds.size(), successCount, failCount);

        return result;
    }

    /**
     * Calculate statistics data
     */
    private EmotionDiaryStatisticsDTO calculateStatistics(List<EmotionDiary> diaries, Integer totalDays) {
        EmotionDiaryStatisticsDTO statistics = new EmotionDiaryStatisticsDTO();

        statistics.setTotalDays(totalDays);
        statistics.setRecordedDays(diaries.size());

        if (diaries.isEmpty()) {
            setDefaultStatistics(statistics);
            return statistics;
        }

        // Calculate completion rate
        BigDecimal completionRate = BigDecimal.valueOf(diaries.size())
                .divide(BigDecimal.valueOf(totalDays), 2, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
        statistics.setCompletionRate(completionRate);

        // Calculate mood score statistics
        calculateMoodStatistics(statistics, diaries);

        // Calculate life metrics statistics
        calculateLifeIndicatorStatistics(statistics, diaries);

        // Calculate emotion distribution
        calculateEmotionDistribution(statistics, diaries);

        // Generate trend data
        generateMoodTrend(statistics, diaries);

        // Generate suggestions
        generateSuggestions(statistics, diaries);

        return statistics;
    }

    private Specification<EmotionDiary> buildSpecification(EmotionDiaryQueryDTO queryDTO) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (queryDTO.getUserId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("user").get("id"), queryDTO.getUserId()));
            }
            if (queryDTO.getStartDate() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("diaryDate"),
                        queryDTO.getStartDate()
                ));
            }
            if (queryDTO.getEndDate() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("diaryDate"),
                        queryDTO.getEndDate()
                ));
            }
            if (queryDTO.getMinMoodScore() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("moodScore"),
                        queryDTO.getMinMoodScore()
                ));
            }
            if (queryDTO.getMaxMoodScore() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("moodScore"),
                        queryDTO.getMaxMoodScore()
                ));
            }
            if (queryDTO.getDominantEmotion() != null) {
                predicates.add(criteriaBuilder.equal(
                        root.get("dominantEmotion"),
                        queryDTO.getDominantEmotion()
                ));
            }
            if (queryDTO.getSleepQuality() != null) {
                predicates.add(criteriaBuilder.equal(
                        root.get("sleepQuality"),
                        queryDTO.getSleepQuality()
                ));
            }
            if (queryDTO.getStressLevel() != null) {
                predicates.add(criteriaBuilder.equal(
                        root.get("stressLevel"),
                        queryDTO.getStressLevel()
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Set default statistics data
     */
    private void setDefaultStatistics(EmotionDiaryStatisticsDTO statistics) {
        statistics.setCompletionRate(BigDecimal.ZERO);
        statistics.setAverageMoodScore(BigDecimal.ZERO);
        statistics.setPositiveDays(0);
        statistics.setNegativeDays(0);
        statistics.setNeutralDays(0);
        statistics.setMoodTrend(new ArrayList<>());
        statistics.setEmotionDistribution(new HashMap<>());
        statistics.setSuggestions(List.of("Start recording emotion diaries to develop emotional awareness"));
    }

    /**
     * Calculate mood score statistics
     */
    private void calculateMoodStatistics(EmotionDiaryStatisticsDTO statistics, List<EmotionDiary> diaries) {
        List<Integer> moodScores = diaries.stream()
                .map(EmotionDiary::getMoodScore)
                .filter(Objects::nonNull)
                .toList();

        if (!moodScores.isEmpty()) {
            double average = moodScores.stream().mapToInt(Integer::intValue).average().orElse(0.0);
            statistics.setAverageMoodScore(BigDecimal.valueOf(average).setScale(1, RoundingMode.HALF_UP));
            statistics.setMaxMoodScore(moodScores.stream().max(Integer::compareTo).orElse(0));
            statistics.setMinMoodScore(moodScores.stream().min(Integer::compareTo).orElse(0));

            long positiveDays = diaries.stream().filter(EmotionDiary::isPositiveMood).count();
            long negativeDays = diaries.stream().filter(EmotionDiary::isNegativeMood).count();
            long neutralDays = diaries.size() - positiveDays - negativeDays;

            statistics.setPositiveDays((int) positiveDays);
            statistics.setNegativeDays((int) negativeDays);
            statistics.setNeutralDays((int) neutralDays);
        }
    }

    /**
     * Calculate life metrics statistics
     */
    private void calculateLifeIndicatorStatistics(EmotionDiaryStatisticsDTO statistics, List<EmotionDiary> diaries) {
        List<Integer> sleepQualities = diaries.stream()
                .map(EmotionDiary::getSleepQuality)
                .filter(Objects::nonNull)
                .toList();

        if (!sleepQualities.isEmpty()) {
            double avgSleep = sleepQualities.stream().mapToInt(Integer::intValue).average().orElse(0.0);
            statistics.setAverageSleepQuality(BigDecimal.valueOf(avgSleep).setScale(1, RoundingMode.HALF_UP));
        }

        List<Integer> stressLevels = diaries.stream()
                .map(EmotionDiary::getStressLevel)
                .filter(Objects::nonNull)
                .toList();

        if (!stressLevels.isEmpty()) {
            double avgStress = stressLevels.stream().mapToInt(Integer::intValue).average().orElse(0.0);
            statistics.setAverageStressLevel(BigDecimal.valueOf(avgStress).setScale(1, RoundingMode.HALF_UP));
        }
    }

    /**
     * Calculate emotion distribution
     */
    private void calculateEmotionDistribution(EmotionDiaryStatisticsDTO statistics, List<EmotionDiary> diaries) {
        Map<String, Integer> emotionDistribution = diaries.stream()
                .filter(diary -> diary.getDominantEmotion() != null)
                .collect(Collectors.groupingBy(
                        EmotionDiary::getDominantEmotion,
                        Collectors.collectingAndThen(Collectors.counting(), Math::toIntExact)
                ));

        statistics.setEmotionDistribution(emotionDistribution);

        // Find most common emotions
        String mostCommonEmotion = emotionDistribution.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");
        statistics.setMostCommonEmotion(mostCommonEmotion);
    }

    /**
     * Generate emotion trend data
     */
    private void generateMoodTrend(EmotionDiaryStatisticsDTO statistics, List<EmotionDiary> diaries) {
        List<EmotionDiaryStatisticsDTO.MoodTrendData> trendData = diaries.stream()
                .map(diary -> EmotionDiaryConvert.buildMoodTrendData(
                        diary.getDiaryDate().format(DateTimeFormatter.ofPattern("MM/dd")),
                        diary.getMoodScore(),
                        diary.getDominantEmotion()
                ))
                .collect(Collectors.toList());

        statistics.setMoodTrend(trendData);
    }

    /**
     * Generate improvement suggestions
     */
    private void generateSuggestions(EmotionDiaryStatisticsDTO statistics, List<EmotionDiary> diaries) {
        List<String> suggestions = new ArrayList<>();

        BigDecimal avgMood = statistics.getAverageMoodScore();
        if (avgMood != null) {
            if (avgMood.compareTo(BigDecimal.valueOf(7)) >= 0) {
                suggestions.add("Your emotional state is overall good, continue maintaining your current lifestyle");
            } else if (avgMood.compareTo(BigDecimal.valueOf(4)) <= 0) {
                suggestions.add("Your emotional state is low, consider seeking professional psychological counseling");
                suggestions.add("Try moderate exercise and relaxation training to improve mood");
            } else {
                suggestions.add("Your emotional state is average, engage in more pleasant activities and social interactions");
            }
        }

        BigDecimal avgSleep = statistics.getAverageSleepQuality();
        if (avgSleep != null && avgSleep.compareTo(BigDecimal.valueOf(3)) < 0) {
            suggestions.add("Sleep quality needs improvement, maintain regular schedule and create good sleep environment");
        }

        BigDecimal avgStress = statistics.getAverageStressLevel();
        if (avgStress != null && avgStress.compareTo(BigDecimal.valueOf(3)) > 0) {
            suggestions.add("Stress level is high, learn stress management techniques such as meditation, deep breathing, etc.");
        }

        if (suggestions.isEmpty()) {
            suggestions.add("Continue maintaining recording habits, focus on emotional change patterns");
        }

        statistics.setSuggestions(suggestions);
    }

}

