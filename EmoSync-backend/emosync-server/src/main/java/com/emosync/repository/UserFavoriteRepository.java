package com.emosync.repository;

import com.emosync.entity.UserFavorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserFavoriteRepository extends JpaRepository<UserFavorite, Long> {

    Optional<UserFavorite> findByUserIdAndArticleId(Long userId, String articleId);

    List<UserFavorite> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByUserIdAndArticleId(Long userId, String articleId);
}
