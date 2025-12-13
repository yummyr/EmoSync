package com.emosync.repository;

import com.emosync.entity.AiAnalysisTask;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface AiAnalysisTaskRepository extends JpaRepository<AiAnalysisTask, Long> {

    List<AiAnalysisTask> findByStatusOrderByPriorityDescCreatedAtAsc(String status);

    List<AiAnalysisTask> findByUserId(Long userId);

    Page<AiAnalysisTask> findAll(Specification<AiAnalysisTask> spec, Pageable pageable);



}
