package com.emosync.repository;

import com.emosync.entity.EmotionDiary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
@Repository
public interface EmotionDiaryRepository extends JpaRepository<EmotionDiary, Long> {

    Optional<EmotionDiary> findByUserIdAndDiaryDate(Long userId, LocalDate diaryDate);

    List<EmotionDiary> findByUserIdOrderByDiaryDateDesc(Long userId);
}
