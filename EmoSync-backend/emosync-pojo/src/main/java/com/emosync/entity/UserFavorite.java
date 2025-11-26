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
     * User entity relationship - 这个属性名必须与 User 实体中 mappedBy 的值匹配
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;  // 属性名必须是 "user"


    /**
     * KnowledgeArticle entity relationship - 这个属性名必须与 KnowledgeArticle 实体中 mappedBy 的值匹配
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private KnowledgeArticle knowledgeArticle;  // 属性名必须是 "knowledgeArticle"

    /**
     * Created time
     */
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
