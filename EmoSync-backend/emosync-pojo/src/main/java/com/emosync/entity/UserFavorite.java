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
     * User entity relationship - This attribute name must match the mappedBy value in the User entity
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;  // Attribute name must be "user"


    /**
     * KnowledgeArticle entity relationship - This attribute name must match the mappedBy value in the KnowledgeArticle entity
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private KnowledgeArticle knowledgeArticle;  // Attribute name must be "knowledgeArticle"

    /**
     * Created time
     */
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
