package com.emosync.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;


@Entity
@Table(name = "consultation_session")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationSession extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_title")
    private String sessionTitle;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "last_emotion_analysis", columnDefinition = "JSON")
    private String lastEmotionAnalysis;

    @Column(name = "last_emotion_updated_at")
    private LocalDateTime lastEmotionUpdatedAt;

    // FK to User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // OneToMany messages
    @OneToMany(mappedBy = "session", fetch = FetchType.LAZY)
    private List<ConsultationMessage> messages;
}
