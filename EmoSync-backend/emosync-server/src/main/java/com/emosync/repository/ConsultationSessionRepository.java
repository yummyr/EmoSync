package com.emosync.repository;

import com.emosync.entity.ConsultationSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ConsultationSessionRepository extends JpaRepository<ConsultationSession, Long> {

    /**
     * 查询指定时间范围内的所有会话
     */
    @Query("SELECT cs FROM ConsultationSession cs WHERE cs.startedAt >= :start AND cs.startedAt <= :end ORDER BY cs.startedAt ASC")
    List<ConsultationSession> findByStartedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * 查询在指定时间范围内有会话的不重复用户ID
     */
    @Query("SELECT DISTINCT cs.user.id FROM ConsultationSession cs WHERE cs.startedAt >= :start AND cs.startedAt <= :end")
    List<Long> findDistinctUserIdsByStartedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * 统计指定时间范围内的会话数量
     */
    @Query("SELECT COUNT(cs) FROM ConsultationSession cs WHERE cs.startedAt >= :start AND cs.startedAt <= :end")
    long countByStartedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * 计算指定时间范围内的平均会话时长（分钟）
     */
    @Query(value = "SELECT AVG(TIMESTAMPDIFF(MINUTE, started_at, NOW())) " +
            "FROM consultation_session " +
            "WHERE started_at >= :start AND started_at <= :end",
            nativeQuery = true)
    Double findAverageDurationBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);


    /**
     * 查询最近的会话
     */
    @Query("SELECT cs FROM ConsultationSession cs ORDER BY cs.startedAt DESC")
    List<ConsultationSession> findRecentSessions(@Param("limit") int limit);


}
