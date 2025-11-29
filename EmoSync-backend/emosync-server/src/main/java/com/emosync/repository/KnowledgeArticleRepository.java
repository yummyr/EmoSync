package com.emosync.repository;

import com.emosync.entity.KnowledgeArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface KnowledgeArticleRepository extends JpaRepository<KnowledgeArticle, String> {

    List<KnowledgeArticle> findByCategoryIdOrderByPublishedAtDesc(Long categoryId);

    List<KnowledgeArticle> findByAuthorId(Long authorId);
}
