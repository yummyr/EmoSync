package com.emosync.repository;

import com.emosync.entity.UserFavorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserFavoriteRepository extends JpaRepository<UserFavorite, Long> {


    boolean existsByUser_IdAndKnowledgeArticle_Id(Long userId, String knowledgeArticleId);

    void deleteByKnowledgeArticle_Id(String knowledgeArticleId);

    List<UserFavorite> findByUserIdAndKnowledgeArticle_IdIn(Long userId, List<String> articleIds);

    @Query("""
                SELECT f.knowledgeArticle.id, COUNT(f)
                FROM UserFavorite f
                WHERE f.knowledgeArticle.id IN :articleIds
                GROUP BY f.knowledgeArticle.id
            """)
    List<Object[]> countByArticleIdsGrouped(List<String> articleIds);

    Optional<UserFavorite> findByUser_IdAndKnowledgeArticle_Id(Long userId, String articleId);

    Page<UserFavorite> findAll(Specification<UserFavorite> spec, Pageable pageable);

    Long countByUser_Id(Long userId);

    @Query("""
        select f.knowledgeArticle.id, count(f)
        from UserFavorite f
        where f.knowledgeArticle.id in :articleIds
        group by f.knowledgeArticle.id
    """)
    List<Object[]> countFavoritesGroupedByArticleIds(@Param("articleIds") List<String> articleIds);
}
