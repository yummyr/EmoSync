package com.emosync.controller;

import com.emosync.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.emosync.DTO.response.DataAnalyticsResponseDTO;
import com.emosync.Result.Result;
import com.emosync.service.DataAnalyticsService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Data Analytics Controller
 * @author Yuan
 */
@Tag(name = "Data Analytics Management")
@RestController
@RequestMapping("/data-analytics")
@Slf4j
@AllArgsConstructor
public class DataAnalyticsController {

    private final DataAnalyticsService dataAnalyticsService;


    /** Get current authenticated UserDetailsImpl */
    private UserDetailsImpl getCurrentUserInfo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !(auth.getPrincipal() instanceof UserDetailsImpl)) {
            return null;
        }
        return (UserDetailsImpl) auth.getPrincipal();
    }

    /** Check if current user has administrator role type */
    private boolean isAdmin() {
        UserDetailsImpl userDetails = getCurrentUserInfo();
        return userDetails != null && userDetails.isAdmin();
    }
    @Operation(summary = "Get comprehensive data analytics")
    @GetMapping("/overview")
    public Result<DataAnalyticsResponseDTO> getDataAnalytics(
            @Parameter(description = "Analysis days") @RequestParam(defaultValue = "30") Integer days) {
        
        log.info("Get data analytics, analysis days: {}", days);

        // Permission check: requires admin privileges
        if (!isAdmin()) {
            return Result.error("Permission denied — Admin only");
        }
        
        DataAnalyticsResponseDTO analytics = dataAnalyticsService.getDataAnalytics(days);
        return Result.success(analytics);
    }

    @Operation(summary = "Get emotion heatmap data")
    @GetMapping("/emotion-heatmap")
    public Result<DataAnalyticsResponseDTO.EmotionHeatmapData> getEmotionHeatmap(
            @Parameter(description = "Analysis days") @RequestParam(defaultValue = "30") Integer days) {
        
        log.info("Get emotion heatmap data, analysis days: {}", days);

        // Permission check: requires admin privileges
        if (!isAdmin()) {
            return Result.error("Permission denied — Admin only");
        }
        
        DataAnalyticsResponseDTO analytics = dataAnalyticsService.getDataAnalytics(days);
        return Result.success(analytics.getEmotionHeatmap());
    }

    @Operation(summary = "Get system overview data")
    @GetMapping("/system-overview")
    public Result<DataAnalyticsResponseDTO.SystemOverview> getSystemOverview(
            @Parameter(description = "Analysis days") @RequestParam(defaultValue = "30") Integer days) {
        
        log.info("Get system overview data, analysis days: {}", days);

        // Permission check: requires admin privileges
        if (!isAdmin()) {
            return Result.error("Permission denied — Admin only");
        }
        
        DataAnalyticsResponseDTO analytics = dataAnalyticsService.getDataAnalytics(days);
        return Result.success(analytics.getSystemOverview());
    }

    @Operation(summary = "Get emotion trend data")
    @GetMapping("/emotion-trend")
    public Result<java.util.List<DataAnalyticsResponseDTO.EmotionTrendData>> getEmotionTrend(
            @Parameter(description = "Analysis days") @RequestParam(defaultValue = "30") Integer days) {
        
        log.info("Get emotion trend data, analysis days: {}", days);

        // Permission check: requires admin privileges
        if (!isAdmin()) {
            return Result.error("Permission denied — Admin only");
        }
        DataAnalyticsResponseDTO analytics = dataAnalyticsService.getDataAnalytics(days);
        return Result.success(analytics.getEmotionTrend());
    }

    @Operation(summary = "Get consultation session statistics")
    @GetMapping("/consultation-stats")
    public Result<DataAnalyticsResponseDTO.ConsultationStatistics> getConsultationStats(
            @Parameter(description = "Analysis days") @RequestParam(defaultValue = "30") Integer days) {
        
        log.info("Get consultation session statistics, analysis days: {}", days);

        // Permission check: requires admin privileges
        if (!isAdmin()) {
            return Result.error("Permission denied — Admin only");
        }
        
        DataAnalyticsResponseDTO analytics = dataAnalyticsService.getDataAnalytics(days);
        return Result.success(analytics.getConsultationStats());
    }

    @Operation(summary = "Get user activity data")
    @GetMapping("/user-activity")
    public Result<java.util.List<DataAnalyticsResponseDTO.UserActivityData>> getUserActivity(
            @Parameter(description = "Analysis days") @RequestParam(defaultValue = "30") Integer days) {
        
        log.info("Get user activity data, analysis days: {}", days);

        // Permission check: requires admin privileges
        if (!isAdmin()) {
            return Result.error("Permission denied — Admin only");
        }
        
        DataAnalyticsResponseDTO analytics = dataAnalyticsService.getDataAnalytics(days);
        return Result.success(analytics.getUserActivity());
    }
}
