package com.emosync.repository;

import com.emosync.entity.AiAnalysisTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface AiAnalysisTaskRepository extends JpaRepository<AiAnalysisTask, Long> {

    List<AiAnalysisTask> findByStatusOrderByPriorityDescCreatedAtAsc(String status);

    List<AiAnalysisTask> findByUserId(Long userId);
}
