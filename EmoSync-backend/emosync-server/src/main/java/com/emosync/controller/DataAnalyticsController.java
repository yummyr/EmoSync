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
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 数据分析控制器
 * @author system
 */
@Tag(name = "数据分析管理")
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
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;

        for (GrantedAuthority authority : auth.getAuthorities()) {
            log.info("permission:{}",authority.getAuthority());
            // role type: 1 = regular user, 2= administrator
            if ("ROLE_2".equals(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }
    @Operation(summary = "获取综合数据分析")
    @GetMapping("/overview")
    public Result<DataAnalyticsResponseDTO> getDataAnalytics(
            @Parameter(description = "分析天数") @RequestParam(defaultValue = "30") Integer days) {
        
        log.info("获取数据分析，分析天数: {}", days);
        
        // 权限检查：需要管理员权限
        if (!isAdmin()) {
            return Result.error("Permission denied — Admin only");
        }
        
        DataAnalyticsResponseDTO analytics = dataAnalyticsService.getDataAnalytics(days);
        return Result.success(analytics);
    }

    @Operation(summary = "获取情绪热力图数据")
    @GetMapping("/emotion-heatmap")
    public Result<DataAnalyticsResponseDTO.EmotionHeatmapData> getEmotionHeatmap(
            @Parameter(description = "分析天数") @RequestParam(defaultValue = "30") Integer days) {
        
        log.info("获取情绪热力图数据，分析天数: {}", days);
        
        // 权限检查：需要管理员权限
        if (!isAdmin()) {
            return Result.error("Permission denied — Admin only");
        }
        
        DataAnalyticsResponseDTO analytics = dataAnalyticsService.getDataAnalytics(days);
        return Result.success(analytics.getEmotionHeatmap());
    }

    @Operation(summary = "获取系统概览数据")
    @GetMapping("/system-overview")
    public Result<DataAnalyticsResponseDTO.SystemOverview> getSystemOverview(
            @Parameter(description = "分析天数") @RequestParam(defaultValue = "30") Integer days) {
        
        log.info("获取系统概览数据，分析天数: {}", days);
        
        // 权限检查：需要管理员权限
        if (!isAdmin()) {
            return Result.error("Permission denied — Admin only");
        }
        
        DataAnalyticsResponseDTO analytics = dataAnalyticsService.getDataAnalytics(days);
        return Result.success(analytics.getSystemOverview());
    }

    @Operation(summary = "获取情绪趋势数据")
    @GetMapping("/emotion-trend")
    public Result<java.util.List<DataAnalyticsResponseDTO.EmotionTrendData>> getEmotionTrend(
            @Parameter(description = "分析天数") @RequestParam(defaultValue = "30") Integer days) {
        
        log.info("获取情绪趋势数据，分析天数: {}", days);
        
        // 权限检查：需要管理员权限
        if (!isAdmin()) {
            return Result.error("Permission denied — Admin only");
        }
        DataAnalyticsResponseDTO analytics = dataAnalyticsService.getDataAnalytics(days);
        return Result.success(analytics.getEmotionTrend());
    }

    @Operation(summary = "获取咨询会话统计")
    @GetMapping("/consultation-stats")
    public Result<DataAnalyticsResponseDTO.ConsultationStatistics> getConsultationStats(
            @Parameter(description = "分析天数") @RequestParam(defaultValue = "30") Integer days) {
        
        log.info("获取咨询会话统计，分析天数: {}", days);
        
        // 权限检查：需要管理员权限
        if (!isAdmin()) {
            return Result.error("Permission denied — Admin only");
        }
        
        DataAnalyticsResponseDTO analytics = dataAnalyticsService.getDataAnalytics(days);
        return Result.success(analytics.getConsultationStats());
    }

    @Operation(summary = "获取用户活跃度数据")
    @GetMapping("/user-activity")
    public Result<java.util.List<DataAnalyticsResponseDTO.UserActivityData>> getUserActivity(
            @Parameter(description = "分析天数") @RequestParam(defaultValue = "30") Integer days) {
        
        log.info("获取用户活跃度数据，分析天数: {}", days);
        
        // 权限检查：需要管理员权限
        if (!isAdmin()) {
            return Result.error("Permission denied — Admin only");
        }
        
        DataAnalyticsResponseDTO analytics = dataAnalyticsService.getDataAnalytics(days);
        return Result.success(analytics.getUserActivity());
    }
}
