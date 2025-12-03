package com.emosync.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "knowledge_article")
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KnowledgeArticle extends BaseEntity {

    @Id
    private String id; // UUID

    @Column(name = "title")
    private String title;

    private String summary;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "cover_image")
    private String coverImage;

    private String tags;

    @Column(name = "read_count")
    private Integer readCount;

    private Integer status;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    // FK: category
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private KnowledgeCategory category;

    // FK: author
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;

    @OneToMany(mappedBy = "knowledgeArticle")
    private List<UserFavorite> favorites;
}
