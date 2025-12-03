package com.emosync.service.serviceImpl;

import com.emosync.DTO.response.DataAnalyticsResponseDTO;
import com.emosync.entity.ConsultationMessage;
import com.emosync.entity.ConsultationSession;
import com.emosync.entity.EmotionDiary;
import com.emosync.exception.ServiceException;
import com.emosync.repository.ConsultationMessageRepository;
import com.emosync.repository.ConsultationSessionRepository;
import com.emosync.repository.EmotionDiaryRepository;
import com.emosync.repository.UserRepository;
import com.emosync.service.DataAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataAnalyticsServiceImpl implements DataAnalyticsService {
    private final UserRepository userRepository;
    private final EmotionDiaryRepository emotionDiaryRepository;
    private final ConsultationSessionRepository consultationSessionRepository;
    private final ConsultationMessageRepository consultationMessageRepository;

    @Override
    public DataAnalyticsResponseDTO getDataAnalytics(Integer days) {
        try {
            log.info("开始获取数据分析，分析天数: {}", days);
            if (days == null || days <= 0) days = 30;

            LocalDate end = LocalDate.now();
            LocalDate start = end.minusDays(days - 1);

            DataAnalyticsResponseDTO analytics = DataAnalyticsResponseDTO.builder()
                    .systemOverview(getSystemOverview(start, end))
                    .emotionHeatmap(getEmotionHeatmap(start, end))
                    .emotionTrend(getEmotionTrends(start, end))
                    .consultationStats(getConsultationStats(start, end))
                    .userActivity(getActivity(start, end))
                    .build();
            log.info("数据分析获取完成");
            return analytics;

        } catch (Exception e) {
            log.error("获取数据分析失败", e);
            throw new ServiceException("获取数据分析失败，请稍后重试");
        }
    }

    private DataAnalyticsResponseDTO.SystemOverview getSystemOverview(LocalDate start, LocalDate end) {
        long totalUsers = userRepository.count();

        // 活跃用户数(在时间范围内有记录的用户)
        List<Long> activeDiaryUserIds = emotionDiaryRepository
                .findDistinctUserIdsByDiaryDateBetween(start, end);
        List<Long> activeSessionUserIds = consultationSessionRepository
                .findDistinctUserIdsByStartedAtBetween(
                        start.atStartOfDay(),
                        end.atTime(23, 59, 59)
                );
        Set<Long> activeUserIds = new HashSet<>(activeDiaryUserIds);
        activeUserIds.addAll(activeSessionUserIds);
        Long activeUsers = (long) activeUserIds.size();

        // 情绪日记总数
        Long totalDiaries = emotionDiaryRepository.count();

        // 咨询会话总数
        Long totalSessions = consultationSessionRepository.count();

        List<EmotionDiary> allDiaries = emotionDiaryRepository
                .findByDiaryDateBetween(start, end);
        BigDecimal avgMoodScore = allDiaries.isEmpty() ? BigDecimal.ZERO :
                BigDecimal.valueOf(allDiaries.stream()
                                .filter(diary -> diary.getMoodScore() != null)
                                .mapToInt(EmotionDiary::getMoodScore)
                                .average()
                                .orElse(0.0))
                        .setScale(1, RoundingMode.HALF_UP);
        // 今日统计
        LocalDate today = LocalDate.now();
        // 今日新增用户
        Long todayNewUsers = userRepository.countByCreatedAtBetween(
                today.atStartOfDay(),
                today.atTime(23, 59, 59)
        );

        // 今日新增日记
        Long todayNewDiaries = (long) emotionDiaryRepository
                .findByDiaryDate(today).size();

        // 今日新增会话
        Long todayNewSessions = consultationSessionRepository.countByStartedAtBetween(
                today.atStartOfDay(),
                today.atTime(23, 59, 59)
        );

        return DataAnalyticsResponseDTO.SystemOverview.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .totalDiaries(totalDiaries)
                .totalSessions(totalSessions)
                .avgMoodScore(avgMoodScore)
                .todayNewUsers(todayNewUsers)
                .todayNewDiaries(todayNewDiaries)
                .todayNewSessions(todayNewSessions)
                .build();
    }
    private DataAnalyticsResponseDTO.EmotionHeatmapData getEmotionHeatmap(LocalDate start, LocalDate end) {
        List<EmotionDiary> diaries = emotionDiaryRepository.findByDiaryDateBetween(start, end);

        // initialize grid
        List<List<DataAnalyticsResponseDTO.HeatmapPoint>> grid = new ArrayList<>();
        for (int d = 0; d < 7; d++) {
            List<DataAnalyticsResponseDTO.HeatmapPoint> row = new ArrayList<>();
            for (int h = 0; h < 24; h++) {
                row.add(DataAnalyticsResponseDTO.HeatmapPoint.builder()
                        .x(h).y(d).value(0)
                        .avgMoodScore(BigDecimal.ZERO)
                        .dominantEmotion("clam")
                        .build());
            }
            grid.add(row);
        }

        // Group by day-hour
        Map<String, List<EmotionDiary>> groups = diaries.stream()
                .filter(d -> d.getCreatedAt() != null)
                .collect(Collectors.groupingBy(d -> {
                    LocalDateTime t = d.getCreatedAt();
                    int dow = t.getDayOfWeek().getValue() % 7;
                    return dow + "_" + t.getHour();
                }));

        int max = 0;
        String peak = "00:00";

        for (var entry : groups.entrySet()) {
            String[] parts = entry.getKey().split("_");
            int day = Integer.parseInt(parts[0]);
            int hour = Integer.parseInt(parts[1]);

            List<EmotionDiary> list = entry.getValue();
            int count = list.size();

            double avg = list.stream()
                    .filter(d -> d.getMoodScore() != null)
                    .mapToInt(EmotionDiary::getMoodScore)
                    .average()
                    .orElse(0);

            String dom = list.stream()
                    .map(EmotionDiary::getDominantEmotion)
                    .filter(Objects::nonNull)
                    .collect(Collectors.groupingBy(e -> e, Collectors.counting()))
                    .entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("clam");

            grid.get(day).set(hour, DataAnalyticsResponseDTO.HeatmapPoint.builder()
                    .x(hour).y(day).value(count)
                    .avgMoodScore(BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP))
                    .dominantEmotion(dom)
                    .build());

            if (count > max) {
                max = count;
                peak = String.format("%02d:00", hour);
            }
        }

        // emotion distribution
        Map<String, Integer> emotionDistribution = diaries.stream()
                .map(EmotionDiary::getDominantEmotion)
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(
                        e -> e,
                        Collectors.reducing(0, v -> 1, Integer::sum)
                ));

        return DataAnalyticsResponseDTO.EmotionHeatmapData.builder()
                .gridData(grid)
                .emotionDistribution(emotionDistribution)
                .peakEmotionTime(peak)
                .dateRange(start + " to " + end)
                .build();
    }
    private List<DataAnalyticsResponseDTO.EmotionTrendData> getEmotionTrends(LocalDate start, LocalDate end) {
        List<EmotionDiary> diaries = emotionDiaryRepository.findByDiaryDateBetween(start, end);

        Map<LocalDate, List<EmotionDiary>> groups = diaries.stream()
                .collect(Collectors.groupingBy(EmotionDiary::getDiaryDate));

        List<DataAnalyticsResponseDTO.EmotionTrendData> list = new ArrayList<>();

        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {

            List<EmotionDiary> d = groups.getOrDefault(date, Collections.emptyList());

            if (d.isEmpty()) {
                list.add(DataAnalyticsResponseDTO.EmotionTrendData.builder()
                        .date(date)
                        .avgMoodScore(BigDecimal.ZERO)
                        .recordCount(0)
                        .positiveRatio(BigDecimal.ZERO)
                        .negativeRatio(BigDecimal.ZERO)
                        .dominantEmotion("No data")
                        .build()
                );
                continue;
            }

            double avg = d.stream()
                    .filter(x -> x.getMoodScore() != null)
                    .mapToInt(EmotionDiary::getMoodScore)
                    .average()
                    .orElse(0);

            long positive = d.stream().filter(x -> x.getMoodScore() >= 6).count();
            long negative = d.stream().filter(x -> x.getMoodScore() <= 4).count();

            BigDecimal posRatio = BigDecimal.valueOf((double) positive / d.size() * 100)
                    .setScale(1, RoundingMode.HALF_UP);
            BigDecimal negRatio = BigDecimal.valueOf((double) negative / d.size() * 100)
                    .setScale(1, RoundingMode.HALF_UP);

            String dom = d.stream()
                    .map(EmotionDiary::getDominantEmotion)
                    .filter(Objects::nonNull)
                    .collect(Collectors.groupingBy(e -> e, Collectors.counting()))
                    .entrySet().stream().max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("clam");

            list.add(DataAnalyticsResponseDTO.EmotionTrendData.builder()
                    .date(date)
                    .avgMoodScore(BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP))
                    .recordCount(d.size())
                    .positiveRatio(posRatio)
                    .negativeRatio(negRatio)
                    .dominantEmotion(dom)
                    .build());
        }

        return list;
    }
    private DataAnalyticsResponseDTO.ConsultationStatistics getConsultationStats(LocalDate start, LocalDate end) {
        // 查询时间范围内的会话
        LocalDateTime startDateTime = start.atStartOfDay();
        LocalDateTime endDateTime = end.atTime(23, 59, 59);
        List<ConsultationSession> sessions = consultationSessionRepository
                .findByStartedAtBetween(startDateTime, endDateTime);


        long total = (long) sessions.size();
        BigDecimal avgDurationMinutes;
        Double avgDuration = consultationSessionRepository
                .findAverageDurationBetween(startDateTime, endDateTime);
        if (avgDuration != null) {
            avgDurationMinutes = BigDecimal.valueOf(avgDuration)
                    .setScale(1, RoundingMode.HALF_UP);
        } else {
            avgDurationMinutes = BigDecimal.ZERO;
        }

        Map<LocalDate, List<ConsultationSession>> grouped =
                sessions.stream().collect(Collectors.groupingBy(s -> s.getStartedAt().toLocalDate()));

        List<DataAnalyticsResponseDTO.DailySessionCount> dailyTrend = new ArrayList<>();

        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            List<ConsultationSession> d = grouped.getOrDefault(date, Collections.emptyList());
            Set<Long> users = d.stream().map(ConsultationSession::getUserId).collect(Collectors.toSet());

            dailyTrend.add(DataAnalyticsResponseDTO.DailySessionCount.builder()
                    .date(date)
                    .sessionCount(d.size())
                    .userCount(users.size())
                    .build());
        }

        List<Long> sessionIds = sessions.stream().map(ConsultationSession::getId).toList();
        Map<String, Integer> emotionTags = new HashMap<>();

        if (!sessionIds.isEmpty()) {
            List<ConsultationMessage> messages = consultationMessageRepository.findBySessionIdIn(sessionIds);

            emotionTags = messages.stream()
                    .map(ConsultationMessage::getEmotionTag)
                    .filter(e -> e != null && !e.isBlank())
                    .collect(Collectors.groupingBy(e -> e, Collectors.reducing(0, v -> 1, Integer::sum)));
        }

        return DataAnalyticsResponseDTO.ConsultationStatistics.builder()
                .totalSessions(total)
                .avgDurationMinutes(avgDurationMinutes)
                .dailyTrend(dailyTrend)
                .topEmotionTags(emotionTags)
                .build();
    }


    private List<DataAnalyticsResponseDTO.UserActivityData> getActivity(LocalDate start, LocalDate end) {
        List<DataAnalyticsResponseDTO.UserActivityData> list = new ArrayList<>();

        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {

            Long newUsers = userRepository.countByCreatedAtBetween(date.atStartOfDay(), date.atTime(23, 59, 59));

            // 日记记录用户数
            List<Long> diaryUserIds = emotionDiaryRepository
                    .findDistinctUserIdsByDiaryDate(date);

            // 咨询用户数
            List<Long> consultationUserIds = consultationSessionRepository
                    .findDistinctUserIdsByStartedAtBetween(
                            date.atStartOfDay(),
                            date.atTime(23, 59, 59)
                    );

            // 活跃用户数(日记或咨询任一活动)
            Set<Long> allActiveUserIds = new HashSet<>(diaryUserIds);
            allActiveUserIds.addAll(consultationUserIds);


            list.add(DataAnalyticsResponseDTO.UserActivityData.builder()
                    .date(date)
                    .newUsers(newUsers.intValue())
                    .activeUsers(allActiveUserIds.size())
                    .diaryUsers(diaryUserIds.size())
                    .consultationUsers(consultationUserIds.size())
                    .build());
        }

        return list;
    }





}
