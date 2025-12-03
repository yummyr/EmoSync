package com.emosync.repository;

import com.emosync.entity.ConsultationMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface ConsultationMessageRepository extends JpaRepository<ConsultationMessage, Long> {

    List<ConsultationMessage> findBySessionIdOrderByCreatedAtAsc(Long sessionId);


    /**
     * 查询指定会话ID列表中的情绪标签统计
     */
    @Query("SELECT cm.emotionTag, COUNT(cm) FROM ConsultationMessage cm WHERE cm.session.id IN :sessionIds AND cm.emotionTag IS NOT NULL AND cm.emotionTag != '' GROUP BY cm.emotionTag ORDER BY COUNT(cm) DESC")
    List<Object[]> findEmotionTagsBySessionIds(@Param("sessionIds") List<Long> sessionIds);

    /**
     * 查询指定会话的所有消息
     */
    @Query("SELECT cm FROM ConsultationMessage cm WHERE cm.session.id IN :sessionIds ORDER BY cm.createdAt ASC")
    List<ConsultationMessage> findBySessionIdIn(List<Long> sessionIds);

    /**
     * 统计指定会话的消息数量
     */
    @Query("SELECT COUNT(cm) FROM ConsultationMessage cm WHERE cm.session.id = :sessionId")
    long countBySessionId(@Param("sessionId") Long sessionId);

    /**
     * 查询指定会话中特定发送者类型的消息
     */
    @Query("SELECT cm FROM ConsultationMessage cm WHERE cm.session.id = :sessionId AND cm.senderType = :senderType ORDER BY cm.createdAt ASC")
    List<ConsultationMessage> findBySessionIdAndSenderType(@Param("sessionId") Long sessionId, @Param("senderType") String senderType);
    /**
     * 查询指定会话中带有情绪标签的消息
     */
    @Query("SELECT cm FROM ConsultationMessage cm WHERE cm.session.id = :sessionId AND cm.emotionTag IS NOT NULL AND cm.emotionTag != '' ORDER BY cm.createdAt ASC")
    List<ConsultationMessage> findMessagesWithEmotionTagBySessionId(@Param("sessionId") Long sessionId);

    /**
     * 查询指定情绪标签的所有消息
     */
    @Query("SELECT cm FROM ConsultationMessage cm WHERE cm.emotionTag = :emotionTag ORDER BY cm.createdAt DESC")
    List<ConsultationMessage> findByEmotionTag(@Param("emotionTag") String emotionTag);

    /**
     * 查询指定会话的最新消息
     */
    @Query("SELECT cm FROM ConsultationMessage cm WHERE cm.session.id = :sessionId ORDER BY cm.createdAt DESC LIMIT 1")
    ConsultationMessage findLatestBySessionId(@Param("sessionId") Long sessionId);

    /**
     * 批量查询多个会话的最新消息
     */
    @Query(value = "SELECT DISTINCT ON (session_id) * FROM consultation_message WHERE session_id IN :sessionIds ORDER BY session_id, created_at DESC", nativeQuery = true)
    List<ConsultationMessage> findLatestMessagesBySessionIds(@Param("sessionIds") List<Long> sessionIds);

    /**
     * 查询指定时间范围内的消息
     */
    @Query("SELECT cm FROM ConsultationMessage cm WHERE cm.createdAt >= :start AND cm.createdAt <= :end ORDER BY cm.createdAt ASC")
    List<ConsultationMessage> findByCreatedAtBetween(@Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);
}
