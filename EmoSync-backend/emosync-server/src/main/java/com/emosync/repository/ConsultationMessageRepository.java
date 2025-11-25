package com.emosync.repository;

import com.emosync.entity.ConsultationMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConsultationMessageRepository extends JpaRepository<ConsultationMessage, Long> {

    List<ConsultationMessage> findBySessionIdOrderByCreatedAtAsc(Long sessionId);
}
