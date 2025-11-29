package com.emosync.repository;

import com.emosync.entity.ConsultationSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultationSessionRepository extends JpaRepository<ConsultationSession, Long> {

    List<ConsultationSession> findByUserIdOrderByStartedAtDesc(Long userId);
}
