package com.emosync.repository;

import com.emosync.entity.ConsultationMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface ConsultationMessageRepository extends JpaRepository<ConsultationMessage, Long> {

    List<ConsultationMessage> findBySession_IdOrderByCreatedAtAsc(Long sessionId);


    @Query("SELECT cm FROM ConsultationMessage cm WHERE cm.content LIKE CONCAT('%', :keyword, '%')")
    List<ConsultationMessage> searchByContent(@Param("keyword") String keyword);



    /**
     * 查询指定会话ID列表中的情绪标签统计
     */
    @Query("SELECT cm.emotionTag, COUNT(cm) FROM ConsultationMessage cm WHERE cm.session.id IN :sessionIds AND cm.emotionTag <> '' GROUP BY cm.emotionTag ORDER BY COUNT(cm) DESC")
    List<Object[]> findEmotionTagsBySessionIds(@Param("sessionIds") List<Long> sessionIds);

    /**
     * 查询指定会话的所有消息
     */
    @Query("SELECT cm FROM ConsultationMessage cm WHERE cm.session.id IN :sessionIds ORDER BY cm.createdAt ASC")
    List<ConsultationMessage> findBySessionIdIn(@Param("sessionIds")List<Long> sessionIds);

    /**
     * 统计指定会话的消息数量
     */
    @Query("SELECT COUNT(cm) FROM ConsultationMessage cm WHERE cm.session.id = :sessionId")
    long countBySessionId(@Param("sessionId") Long sessionId);

    /**
     * 查询指定会话中特定发送者类型的消息
     */
    @Query("SELECT cm FROM ConsultationMessage cm WHERE cm.session.id = :sessionId AND cm.senderType = :senderType ORDER BY cm.createdAt ASC")
    List<ConsultationMessage> findBySession_IdAndSenderType(@Param("sessionId") Long sessionId, @Param("senderType") String senderType);
    /**
     * 查询指定会话中带有情绪标签的消息
     */
    @Query("SELECT cm FROM ConsultationMessage cm WHERE cm.session.id = :sessionId AND cm.emotionTag <> '' ORDER BY cm.createdAt ASC")
    List<ConsultationMessage> findMessagesWithEmotionTagBySessionId(@Param("sessionId") Long sessionId);

    /**
     * 查询指定情绪标签的所有消息
     */
    @Query("SELECT cm FROM ConsultationMessage cm WHERE cm.emotionTag = :emotionTag ORDER BY cm.createdAt DESC")
    List<ConsultationMessage> findByEmotionTag(@Param("emotionTag") String emotionTag);

    /**
     * 查询指定会话的最新消息
     */
    @Query("SELECT cm FROM ConsultationMessage cm WHERE cm.session.id = :sessionId ORDER BY cm.createdAt DESC")
    List<ConsultationMessage> findLatestBySessionId(@Param("sessionId") Long sessionId, org.springframework.data.domain.Pageable pageable);


    /**
     * 批量查询多个会话的最新消息
     */
    @Query(value = """
            SELECT t.* 
            FROM consultation_message t
            JOIN (
                SELECT session_id, MAX(created_at) AS max_time
                FROM consultation_message
                WHERE session_id IN (:sessionIds)
                GROUP BY session_id
            ) x ON t.session_id = x.session_id AND t.created_at = x.max_time
            """, nativeQuery = true)
    List<ConsultationMessage> findLatestMessagesBySessionIds(@Param("sessionIds") List<Long> sessionIds);

    /**
     * 查询指定时间范围内的消息
     */
    @Query("SELECT cm FROM ConsultationMessage cm WHERE cm.createdAt BETWEEN :start AND :end ORDER BY cm.createdAt ASC")
    List<ConsultationMessage> findByCreatedAtBetween(@Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);
}
