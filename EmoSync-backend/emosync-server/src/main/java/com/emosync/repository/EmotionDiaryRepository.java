package com.emosync.repository;

import com.emosync.entity.EmotionDiary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmotionDiaryRepository extends JpaRepository<EmotionDiary, Long> {


    /**
     * 查询指定日期范围内的所有日记
     */
    @Query("SELECT e FROM EmotionDiary e WHERE e.diaryDate >= :start AND e.diaryDate <= :end ORDER BY e.diaryDate ASC, e.createdAt ASC")
    List<EmotionDiary> findByDiaryDateBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    /**
     * 查询指定日期的所有日记
     */
    @Query("SELECT e FROM EmotionDiary e WHERE e.diaryDate = :date ORDER BY e.createdAt ASC")
    List<EmotionDiary> findByDiaryDate(@Param("date") LocalDate date);

    /**
     * 查询在指定创建时间范围内的日记
     */
    @Query("SELECT e FROM EmotionDiary e WHERE e.createdAt >= :start AND e.createdAt <= :end ORDER BY e.createdAt ASC")
    List<EmotionDiary> findByCreatedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * 查询在指定日期范围内有日记记录的不重复用户ID
     */
    @Query("SELECT DISTINCT e.user.id FROM EmotionDiary e WHERE e.diaryDate >= :start AND e.diaryDate <= :end")
    List<Long> findDistinctUserIdsByDiaryDateBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    /**
     * 查询指定日期的不同用户ID
     */
    @Query("SELECT DISTINCT e.user.id FROM EmotionDiary e WHERE e.diaryDate = :date")
    List<Long> findDistinctUserIdsByDiaryDate(@Param("date") LocalDate date);

    /**
     * 统计指定日期范围内的日记数量
     */
    @Query("SELECT COUNT(e) FROM EmotionDiary e WHERE e.diaryDate >= :start AND e.diaryDate <= :end")
    long countByDiaryDateBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    /**
     * 计算指定日期范围内的平均情绪评分
     */
    @Query("SELECT AVG(e.moodScore) FROM EmotionDiary e WHERE e.diaryDate >= :start AND e.diaryDate <= :end AND e.moodScore IS NOT NULL")
    Double findAverageMoodScoreBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);


    /**
     * 统计指定日期范围内的情绪分布
     */
    @Query("SELECT e.dominantEmotion, COUNT(e) FROM EmotionDiary e WHERE e.diaryDate >= :start AND e.diaryDate <= :end AND e.dominantEmotion IS NOT NULL AND e.dominantEmotion != '' GROUP BY e.dominantEmotion ORDER BY COUNT(e) DESC")
    List<Object[]> findEmotionDistributionBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    /**
     * 统计指定用户的日记数量
     */
    @Query("SELECT COUNT(e) FROM EmotionDiary e WHERE e.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);

    /**
     * 查询指定用户的最新日记
     */
    @Query("SELECT e FROM EmotionDiary e WHERE e.user.id = :userId ORDER BY e.diaryDate DESC, e.createdAt DESC LIMIT 1")
    EmotionDiary findLatestByUserId(@Param("userId") Long userId);
}
