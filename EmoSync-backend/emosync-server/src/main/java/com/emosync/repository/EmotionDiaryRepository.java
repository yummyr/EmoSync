package com.emosync.repository;

import com.emosync.entity.ConsultationSession;
import com.emosync.entity.EmotionDiary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
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
    Optional<EmotionDiary> findByUserIdAndDiaryDate(Long userId, LocalDate diaryDate);


    /**
     * Query all diaries within specified date range
     */
    @Query("SELECT e FROM EmotionDiary e WHERE e.diaryDate >= :start AND e.diaryDate <= :end ORDER BY e.diaryDate ASC, e.createdAt ASC")
    List<EmotionDiary> findByDiaryDateBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    /**
     * Query all diaries for specified date
     */
    @Query("SELECT e FROM EmotionDiary e WHERE e.diaryDate = :date ORDER BY e.createdAt ASC")
    List<EmotionDiary> findByDiaryDate(@Param("date") LocalDate date);

    /**
     * Query diaries within specified creation time range
     */
    @Query("SELECT e FROM EmotionDiary e WHERE e.createdAt >= :start AND e.createdAt <= :end ORDER BY e.createdAt ASC")
    List<EmotionDiary> findByCreatedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * Query distinct user IDs with diary records within specified date range
     */
    @Query("SELECT DISTINCT e.user.id FROM EmotionDiary e WHERE e.diaryDate >= :start AND e.diaryDate <= :end")
    List<Long> findDistinctUserIdsByDiaryDateBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    /**
     * Query distinct user IDs for specified date
     */
    @Query("SELECT DISTINCT e.user.id FROM EmotionDiary e WHERE e.diaryDate = :date")
    List<Long> findDistinctUserIdsByDiaryDate(@Param("date") LocalDate date);

    /**
     * Count diaries within specified date range
     */
    @Query("SELECT COUNT(e) FROM EmotionDiary e WHERE e.diaryDate >= :start AND e.diaryDate <= :end")
    long countByDiaryDateBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    /**
     * Calculate average mood score within specified date range
     */
    @Query("SELECT AVG(e.moodScore) FROM EmotionDiary e WHERE e.diaryDate >= :start AND e.diaryDate <= :end AND e.moodScore IS NOT NULL")
    Double findAverageMoodScoreBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);


    /**
     * Count emotion distribution within specified date range
     */
    @Query("SELECT e.dominantEmotion, COUNT(e) FROM EmotionDiary e WHERE e.diaryDate >= :start AND e.diaryDate <= :end AND e.dominantEmotion IS NOT NULL AND e.dominantEmotion != '' GROUP BY e.dominantEmotion ORDER BY COUNT(e) DESC")
    List<Object[]> findEmotionDistributionBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    /**
     * Count diaries for specified user
     */
    @Query("SELECT COUNT(e) FROM EmotionDiary e WHERE e.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);

    /**
     * Query latest diary for specified user
     */
    @Query("SELECT e FROM EmotionDiary e WHERE e.user.id = :userId ORDER BY e.diaryDate DESC, e.createdAt DESC LIMIT 1")
    EmotionDiary findLatestByUserId(@Param("userId") Long userId);

    List<EmotionDiary> findByUserIdAndDiaryDateBetween(Long userId, LocalDate start, LocalDate end);



    Page<EmotionDiary> findAll(Specification<EmotionDiary> spec, Pageable pageable);
}
