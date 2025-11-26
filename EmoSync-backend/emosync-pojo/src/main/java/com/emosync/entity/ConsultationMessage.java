package com.emosync.entity;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "consultation_message")
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConsultationMessage extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sender_type")
    private Integer senderType;

    @Column(name = "message_type")
    private Integer messageType;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "emotion_tag")
    private String emotionTag;

    @Column(name = "ai_model")
    private String aiModel;

    // FK
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private ConsultationSession session;
}
