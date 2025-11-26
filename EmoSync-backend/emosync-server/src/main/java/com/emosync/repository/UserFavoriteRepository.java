package com.emosync.repository;

import com.emosync.entity.UserFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface UserFavoriteRepository extends JpaRepository<UserFavorite, Long> {

    // 使用对象导航查询
    Optional<UserFavorite> findByUser_IdAndKnowledgeArticle_Id(Long userId, String articleId);

    List<UserFavorite> findByUser_IdOrderByCreatedAtDesc(Long userId);

    boolean existsByUser_IdAndKnowledgeArticle_Id(Long userId, String articleId);

    // 其他查询方法
    List<UserFavorite> findByKnowledgeArticle_Id(String articleId);

    int countByUser_Id(Long userId);
}
