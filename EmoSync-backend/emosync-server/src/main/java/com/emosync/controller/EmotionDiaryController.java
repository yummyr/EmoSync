package com.emosync.controller;

import com.emosync.Result.PageResult;
import com.emosync.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.emosync.DTO.command.EmotionDiaryCreateDTO;
import com.emosync.DTO.command.EmotionDiaryUpdateDTO;
import com.emosync.DTO.query.EmotionDiaryQueryDTO;
import com.emosync.DTO.response.EmotionDiaryResponseDTO;
import com.emosync.DTO.response.EmotionDiaryStatisticsDTO;
import com.emosync.Result.Result;
import com.emosync.exception.BusinessException;
import com.emosync.service.EmotionDiaryService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import com.emosync.AiService.StructOutPut;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Emotion Diary Controller
 */
@Tag(name = "Emotion Diary Management", description = "CRUD operations and statistical analysis for emotion diaries")
@Slf4j
@RestController
@RequestMapping("/emotion-diary")
@Validated
@AllArgsConstructor
public class EmotionDiaryController {


    private final EmotionDiaryService emotionDiaryService;

    /** Get current authenticated UserDetailsImpl */
    private UserDetailsImpl getCurrentUserInfo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !(auth.getPrincipal() instanceof UserDetailsImpl)) {
            return null;
        }
        return (UserDetailsImpl) auth.getPrincipal();
    }

    /** Check if current user has ROLE_ADMIN */
    private boolean isAdmin() {
        UserDetailsImpl userDetails = getCurrentUserInfo();
        return userDetails != null && userDetails.isAdmin();
    }

    /**
     * Create or update emotion diary
     * Only one record per day, if record exists for the day, prompt to enter edit mode
     */
    @Operation(summary = "Create or update emotion diary", description = "Create new emotion diary record, prompt to enter edit mode if record exists for the day")
    @PostMapping
    public Result<EmotionDiaryResponseDTO> createOrUpdateDiary(
            @Valid @RequestBody EmotionDiaryCreateDTO createDTO,
            @Parameter(description = "Whether in edit mode") @RequestParam(required = false) Boolean isEditMode) {
        log.info("Received create or update emotion diary request: {}, edit mode: {}", createDTO, isEditMode);

        UserDetailsImpl currentUser = getCurrentUserInfo();
        Long userId = currentUser != null ? currentUser.getId() : null;
        if (userId == null) {
            return Result.error("User not logged in");
        }

        try {
            EmotionDiaryResponseDTO responseDTO = emotionDiaryService.createOrUpdateDiary(userId, createDTO, isEditMode);
            return Result.success(responseDTO);
        } catch (Exception e) {
            log.error("Failed to create or update emotion diary: {}", e.getMessage(), e);
            return Result.error("Operation failed: " + e.getMessage());
        }
    }

    /**
     * Update emotion diary
     */
    @Operation(summary = "Update emotion diary", description = "Update specified emotion diary record")
    @PutMapping("/{id}")
    public Result<EmotionDiaryResponseDTO> updateDiary(
            @Parameter(description = "Diary ID") @PathVariable Long id,
            @Valid @RequestBody EmotionDiaryUpdateDTO updateDTO) {
        log.info("Received update emotion diary request, ID: {}, data: {}", id, updateDTO);

        Long userId =getCurrentUserInfo().getId();
        if (userId == null) {
            return Result.error("User not logged in");
        }

        // Set diary ID
        updateDTO.setId(id);

        try {
            EmotionDiaryResponseDTO responseDTO = emotionDiaryService.updateDiary(userId, updateDTO);
            return Result.success(responseDTO);
        } catch (Exception e) {
            log.error("Failed to update emotion diary: {}", e.getMessage(), e);
            return Result.error("Update failed: " + e.getMessage());
        }
    }

    /**
     * Get emotion diary by ID
     */
    @Operation(summary = "Get emotion diary details", description = "Get detailed emotion diary information by diary ID")
    @GetMapping("/{id}")
    public Result<EmotionDiaryResponseDTO> getDiaryById(
            @Parameter(description = "Diary ID") @PathVariable Long id) {
        log.info("Received get emotion diary request, ID: {}", id);

        UserDetailsImpl currentUser = getCurrentUserInfo();
        Long userId = currentUser != null ? currentUser.getId() : null;
        if (userId == null) {
            return Result.error("User not logged in");
        }

        try {
            EmotionDiaryResponseDTO responseDTO = emotionDiaryService.getDiaryById(userId, id);
            return Result.success(responseDTO);
        } catch (Exception e) {
            log.error("Failed to get emotion diary: {}", e.getMessage(), e);
            return Result.error("Get failed: " + e.getMessage());
        }
    }

    /**
     * Get emotion diary by date
     */
    @Operation(summary = "Get emotion diary by date", description = "Get emotion diary record for specified date")
    @GetMapping("/date/{date}")
    public Result<EmotionDiaryResponseDTO> getDiaryByDate(
            @Parameter(description = "Date (format: yyyy-MM-dd)") @PathVariable String date) {
        log.info("Received get emotion diary by date request, date: {}", date);

        UserDetailsImpl currentUser = getCurrentUserInfo();
        Long userId = currentUser != null ? currentUser.getId() : null;
        if (userId == null) {
            return Result.error("User not logged in");
        }

        try {
            LocalDate diaryDate = LocalDate.parse(date);
            EmotionDiaryResponseDTO responseDTO = emotionDiaryService.getDiaryByDate(userId, diaryDate);
            
            if (responseDTO == null) {
                return Result.error("No diary record for this date");
            }
            
            return Result.success(responseDTO);
        } catch (Exception e) {
            log.error("Failed to get emotion diary by date: {}", e.getMessage(), e);
            return Result.error("Get failed: " + e.getMessage());
        }
    }

    /**
     * Paginated query emotion diary
     */
    @Operation(summary = "Paginated query emotion diary", description = "Paginated query user's emotion diary list based on conditions")
    @GetMapping("/page")
    public Result<PageResult<EmotionDiaryResponseDTO>> getDiaryPage(
            @Parameter(description = "Page number") @RequestParam(defaultValue = "1") Integer current,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") Integer size,
            @Parameter(description = "Start date") @RequestParam(required = false) String startDate,
            @Parameter(description = "End date") @RequestParam(required = false) String endDate,
            @Parameter(description = "Minimum mood score") @RequestParam(required = false) Integer minMoodScore,
            @Parameter(description = "Maximum mood score") @RequestParam(required = false) Integer maxMoodScore,
            @Parameter(description = "Dominant emotion") @RequestParam(required = false) String dominantEmotion,
            @Parameter(description = "Sleep quality") @RequestParam(required = false) Integer sleepQuality,
            @Parameter(description = "Stress level") @RequestParam(required = false) Integer stressLevel) {
        
        log.info("Received paginated query emotion diary request, page: {}, size: {}", current, size);

        UserDetailsImpl currentUser = getCurrentUserInfo();
        Long userId = currentUser != null ? currentUser.getId() : null;
        if (userId == null) {
            return Result.error("User not logged in");
        }

        try {
            EmotionDiaryQueryDTO queryDTO = new EmotionDiaryQueryDTO();
            if(isAdmin()){
                queryDTO.setUserId(null);
            }else{
                queryDTO.setUserId(userId);
            }

            queryDTO.setCurrent(current);
            queryDTO.setSize(size);
            
            // Set query conditions
            if (startDate != null) {
                queryDTO.setStartDate(LocalDate.parse(startDate));
            }
            if (endDate != null) {
                queryDTO.setEndDate(LocalDate.parse(endDate));
            }
            queryDTO.setMinMoodScore(minMoodScore);
            queryDTO.setMaxMoodScore(maxMoodScore);
            queryDTO.setDominantEmotion(dominantEmotion);
            queryDTO.setSleepQuality(sleepQuality);
            queryDTO.setStressLevel(stressLevel);

            PageResult<EmotionDiaryResponseDTO> page = emotionDiaryService.selectPage(queryDTO);
            return Result.success(page);
        } catch (Exception e) {
            log.error("Failed to paginate query emotion diary: {}", e.getMessage(), e);
            return Result.error("Query failed: " + e.getMessage());
        }
    }

    /**
     * Delete emotion diary
     */
    @Operation(summary = "Delete emotion diary", description = "Delete specified emotion diary record")
    @DeleteMapping("/{id}")
    public Result<Void> deleteDiary(@Parameter(description = "Diary ID") @PathVariable Long id) {
        log.info("Received delete emotion diary request, ID: {}", id);

        UserDetailsImpl currentUser = getCurrentUserInfo();
        Long userId = currentUser != null ? currentUser.getId() : null;
        if (userId == null) {
            return Result.error("User not logged in");
        }

        try {
            emotionDiaryService.deleteDiary(userId, id);
            return Result.success();
        } catch (Exception e) {
            log.error("Failed to delete emotion diary: {}", e.getMessage(), e);
            return Result.error("Delete failed: " + e.getMessage());
        }
    }

    /**
     * Get emotion diary statistics
     */
    @Operation(summary = "Get emotion statistics", description = "Get user emotion diary statistical analysis data")
    @GetMapping("/statistics")
    public Result<EmotionDiaryStatisticsDTO> getStatistics(
            @Parameter(description = "Statistics days") @RequestParam(defaultValue = "7") Integer days) {
        log.info("Received get emotion statistics request, statistics days: {}", days);

        UserDetailsImpl currentUser = getCurrentUserInfo();
        Long userId = currentUser != null ? currentUser.getId() : null;
        if (userId == null) {
            return Result.error("User not logged in");
        }

        try {
            EmotionDiaryStatisticsDTO statistics = emotionDiaryService.getStatistics(userId, days);
            return Result.success(statistics);
        } catch (Exception e) {
            log.error("Failed to get emotion statistics: {}", e.getMessage(), e);
            return Result.error("Get statistics failed: " + e.getMessage());
        }
    }

    /**
     * Get today's emotion diary
     */
    @Operation(summary = "Get today's emotion diary", description = "Get current user's today emotion diary record")
    @GetMapping("/today")
    public Result<EmotionDiaryResponseDTO> getTodayDiary() {
        log.info("Received get today's emotion diary request");

        UserDetailsImpl currentUser = getCurrentUserInfo();
        Long userId = currentUser != null ? currentUser.getId() : null;
        if (userId == null) {
            return Result.error("User not logged in");
        }

        try {
            LocalDate today = LocalDate.now();
            EmotionDiaryResponseDTO responseDTO = emotionDiaryService.getDiaryByDate(userId, today);
            
            if (responseDTO == null) {
                return Result.error("No emotion diary recorded today");
            }
            
            return Result.success(responseDTO);
        } catch (Exception e) {
            log.error("Failed to get today's emotion diary: {}", e.getMessage(), e);
            return Result.error("Get failed: " + e.getMessage());
        }
    }

    /**
     * Get AI emotion analysis result for specified diary
     */
    @Operation(summary = "Get AI emotion analysis result", description = "Get AI emotion analysis result for specified diary")
    @GetMapping("/{id}/ai-analysis")
    public Result<StructOutPut.EmotionAnalysisResult> getAiEmotionAnalysis(
            @Parameter(description = "Diary ID") @PathVariable Long id) {
        log.info("Received get AI emotion analysis request, diary ID: {}", id);

        UserDetailsImpl currentUser = getCurrentUserInfo();
        Long userId = currentUser != null ? currentUser.getId() : null;
        if (userId == null) {
            return Result.error("User not logged in");
        }

        try {
            // First verify if user has permission to access this diary
            EmotionDiaryResponseDTO diary = emotionDiaryService.getDiaryById(userId, id);
            if (diary == null) {
                return Result.error("Diary not found or no permission to access");
            }

            // Get AI analysis result
            StructOutPut.EmotionAnalysisResult analysisResult = emotionDiaryService.getAiEmotionAnalysis(id);
            if (analysisResult == null) {
                return Result.error("AI emotion analysis result not yet generated, please try again later");
            }

            return Result.success(analysisResult);
        } catch (Exception e) {
            log.error("Failed to get AI emotion analysis: {}", e.getMessage(), e);
            return Result.error("Get analysis result failed: " + e.getMessage());
        }
    }

    /**
     * Manually trigger AI emotion analysis
     */
    @Operation(summary = "Manually trigger AI emotion analysis", description = "Manually trigger AI emotion analysis for specified diary")
    @PostMapping("/{id}/ai-analysis")
    public Result<Void> triggerAiEmotionAnalysis(
            @Parameter(description = "Diary ID") @PathVariable Long id) {
        log.info("Received manually trigger AI emotion analysis request, diary ID: {}", id);

        UserDetailsImpl currentUser = getCurrentUserInfo();
        Long userId = currentUser != null ? currentUser.getId() : null;
        if (userId == null) {
            return Result.error("User not logged in");
        }

        try {
            // First verify if user has permission to access this diary
            EmotionDiaryResponseDTO diary = emotionDiaryService.getDiaryById(userId, id);
            if (diary == null) {
                return Result.error("Diary not found or no permission to access");
            }

            // Manually trigger AI analysis (asynchronous processing)
            if (diary.getDiaryContent() != null && !diary.getDiaryContent().trim().isEmpty()) {
                emotionDiaryService.performAiEmotionAnalysisAsync(id, diary.getDiaryContent());
                log.info("Manually submitted AI emotion analysis task to queue, diary ID: {}", id);
                return Result.success();
            } else {
                return Result.error("Diary content is empty, cannot perform AI analysis");
            }
        } catch (Exception e) {
            log.error("Failed to trigger AI emotion analysis: {}", e.getMessage(), e);
            return Result.error("Trigger analysis failed: " + e.getMessage());
        }
    }

    // ========== Admin APIs ==========

    /**
     * Admin get emotion diary statistics
     */
    @Operation(summary = "Admin get emotion statistics", description = "Get global emotion diary statistical analysis data")
    @GetMapping("/admin/statistics")
    public Result<EmotionDiaryStatisticsDTO> getAdminStatistics(
            @Parameter(description = "Statistics days") @RequestParam(defaultValue = "30") Integer days,
            @Parameter(description = "User ID") @RequestParam(required = false) Long userId) {
        log.info("Admin received get emotion statistics request, statistics days: {}, user ID: {}", days, userId);

        try {
            EmotionDiaryStatisticsDTO statistics = emotionDiaryService.getAdminStatistics(userId, days);
            return Result.success(statistics);
        } catch (Exception e) {
            log.error("Admin failed to get emotion statistics: {}", e.getMessage(), e);
            return Result.error("Get statistics failed: " + e.getMessage());
        }
    }

    /**
     * Admin delete emotion diary
     */
    @Operation(summary = "Admin delete emotion diary", description = "Admin delete specified emotion diary record")
    @DeleteMapping("/admin/{id}")
    public Result<Void> adminDeleteDiary(@Parameter(description = "Diary ID") @PathVariable Long id) {
        log.info("Admin received delete emotion diary request, ID: {}", id);

        try {
            emotionDiaryService.adminDeleteDiary(id);
            return Result.success();
        } catch (Exception e) {
            log.error("Admin failed to delete emotion diary: {}", e.getMessage(), e);
            return Result.error("Delete failed: " + e.getMessage());
        }
    }

    /**
     * Admin get system overview statistics
     */
    @Operation(summary = "Admin get system overview", description = "Get system overview data for emotion diary module")
    @GetMapping("/admin/overview")
    public Result<EmotionDiaryStatisticsDTO> getAdminOverview() {
        log.info("Admin received get system overview request");

        try {
            EmotionDiaryStatisticsDTO overview = emotionDiaryService.getSystemOverview();
            return Result.success(overview);
        } catch (Exception e) {
            log.error("Admin failed to get system overview: {}", e.getMessage(), e);
            return Result.error("Get overview data failed: " + e.getMessage());
        }
    }

    /**
     * Admin manually trigger AI emotion analysis
     */
    @Operation(summary = "Admin manually trigger AI emotion analysis", description = "Admin manually trigger AI emotion analysis for specified diary, supports repeated analysis")
    @PostMapping("/admin/{id}/ai-analysis")
    public Result<Void> adminTriggerAiEmotionAnalysis(
            @Parameter(description = "Diary ID") @PathVariable Long id) {
        log.info("Admin manually trigger AI emotion analysis, diary ID: {}", id);

        try {
            // Admin can trigger AI analysis for any diary, including previously analyzed ones
            emotionDiaryService.adminTriggerAiAnalysis(id);
            log.info("Admin submitted AI emotion analysis task to queue, diary ID: {}", id);
            return Result.success();
        } catch (BusinessException e) {
            log.warn("Admin failed to trigger AI emotion analysis: {}", e.getMessage());
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("Admin trigger AI emotion analysis exception: {}", e.getMessage(), e);
            return Result.error("Trigger analysis failed: " + e.getMessage());
        }
    }

    /**
     * Admin batch trigger AI emotion analysis
     */
    @Operation(summary = "Admin batch trigger AI emotion analysis", description = "Admin batch trigger AI emotion analysis for multiple diaries")
    @PostMapping("/admin/batch-ai-analysis")
    public Result<Map<String, Object>> adminBatchTriggerAiEmotionAnalysis(
            @Parameter(description = "Diary ID list") @RequestBody List<Long> diaryIds) {
        log.info("Admin batch trigger AI emotion analysis, diary count: {}", diaryIds.size());

        if (diaryIds == null || diaryIds.isEmpty()) {
            return Result.error("Diary ID list cannot be empty");
        }

        if (diaryIds.size() > 100) {
            return Result.error("Single batch processing cannot exceed 100 records");
        }

        try {
            Map<String, Object> result = emotionDiaryService.adminBatchTriggerAiAnalysis(diaryIds);
            log.info("Admin batch AI analysis tasks submitted, success: {}, failed: {}", 
                    result.get("successCount"), result.get("failCount"));
            return Result.success(result);
        } catch (Exception e) {
            log.error("Admin batch trigger AI emotion analysis exception: {}", e.getMessage(), e);
            return Result.error("Batch trigger analysis failed: " + e.getMessage());
        }
    }
}
