package com.emosync.repository;

import com.emosync.entity.KnowledgeArticle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface KnowledgeArticleRepository extends JpaRepository<KnowledgeArticle, String> {

    List<KnowledgeArticle> findByCategoryIdOrderByPublishedAtDesc(Long categoryId);

    List<KnowledgeArticle> findByAuthorId(Long authorId);
}
