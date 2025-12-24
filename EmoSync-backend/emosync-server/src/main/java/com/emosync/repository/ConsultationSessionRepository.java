package com.emosync.repository;

import com.emosync.entity.ConsultationSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ConsultationSessionRepository extends JpaRepository<ConsultationSession, Long> {

    /**
     * Query all sessions within specified time range
     */
    @Query("SELECT cs FROM ConsultationSession cs WHERE cs.startedAt >= :start AND cs.startedAt <= :end ORDER BY cs.startedAt ASC")
    List<ConsultationSession> findByStartedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * Query distinct user IDs with sessions within specified time range
     */
    @Query("SELECT DISTINCT cs.user.id FROM ConsultationSession cs WHERE cs.startedAt >= :start AND cs.startedAt <= :end")
    List<Long> findDistinctUserIdsByStartedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * Count sessions within specified time range
     */
    @Query("SELECT COUNT(cs) FROM ConsultationSession cs WHERE cs.startedAt >= :start AND cs.startedAt <= :end")
    long countByStartedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * Calculate average session duration (in minutes) within specified time range
     */
    @Query(value = "SELECT AVG(TIMESTAMPDIFF(MINUTE, started_at, NOW())) " +
            "FROM consultation_session " +
            "WHERE started_at >= :start AND started_at <= :end",
            nativeQuery = true)
    Double findAverageDurationBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);


    /**
     * Query recent sessions
     */
    @Query("SELECT cs FROM ConsultationSession cs ORDER BY cs.startedAt DESC")
    List<ConsultationSession> findRecentSessions(@Param("limit") int limit);

    Page<ConsultationSession> findAll(Specification<ConsultationSession> spec, Pageable pageable);
}
