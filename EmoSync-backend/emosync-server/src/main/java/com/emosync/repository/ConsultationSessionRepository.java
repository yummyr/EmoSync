package com.emosync.repository;

import com.emosync.entity.ConsultationSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConsultationSessionRepository extends JpaRepository<ConsultationSession, Long> {

    List<ConsultationSession> findByUserIdOrderByStartedAtDesc(Long userId);
}
