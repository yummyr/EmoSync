package com.emosync.repository;

import com.emosync.Result.PageResult;
import com.emosync.entity.KnowledgeArticle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface KnowledgeArticleRepository extends JpaRepository<KnowledgeArticle, String> {

    @Query("SELECT a FROM KnowledgeArticle a WHERE a.category.id =:categoryId ORDER BY a.publishedAt DESC ")
    List<KnowledgeArticle> findByCategoryIdOrderByPublishedAtDesc(Long categoryId);


    long countByStatus(Integer status);

    /** 统计某分类下是否存在文章（用于删除校验） */
    Long countByCategory_Id(Long categoryId);

    /** 统计分类下的文章数量（分页展示用） */
    Long countByCategory_IdAndStatus(Long categoryId, Integer status);


    Page<KnowledgeArticle> findAll(Specification<KnowledgeArticle> spec, Pageable pageable);

    @Query("SELECT COUNT(a) FROM KnowledgeArticle a WHERE a.category.id = :categoryId AND a.status = 1")
    Long countPublishedArticlesByCategory(@Param("categoryId") Long id);
}
