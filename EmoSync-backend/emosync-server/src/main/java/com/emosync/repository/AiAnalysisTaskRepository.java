package com.emosync.repository;

import com.emosync.entity.AiAnalysisTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AiAnalysisTaskRepository extends JpaRepository<AiAnalysisTask, Long> {

    List<AiAnalysisTask> findByStatusOrderByPriorityDescCreatedAtAsc(String status);

    List<AiAnalysisTask> findByUserId(Long userId);
}
