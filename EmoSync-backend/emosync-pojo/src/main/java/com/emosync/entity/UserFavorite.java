package com.emosync.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_favorite", uniqueConstraints = {
        @UniqueConstraint(name = "user_article_unique", columnNames = {"user_id", "article_id"})
}
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserFavorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * User ID
     */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /**
     * Article ID (UUID)
     */
    @Column(name = "article_id", nullable = false, length = 36)
    private String articleId;

    /**
     * Created time
     */
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
