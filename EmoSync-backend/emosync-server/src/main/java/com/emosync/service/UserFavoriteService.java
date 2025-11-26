package com.emosync.service;

import com.emosync.DTO.query.UserFavoriteQueryDTO;
import com.emosync.DTO.response.ArticleSimpleResponseDTO;
import com.emosync.Result.PageResult;
import com.emosync.entity.KnowledgeArticle;
import com.emosync.entity.UserFavorite;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
@Service
public interface UserFavoriteService {

    void favoriteArticle(Long userId, String articleId);

    void unfavoriteArticle(Long userId, String articleId);

    boolean isFavorited(Long userId, String articleId);

    PageResult<ArticleSimpleResponseDTO> getUserFavoritePage(UserFavoriteQueryDTO queryDTO);

    Long getUserFavoriteCount(Long userId);

    Map<String, Integer> getArticleFavoriteCountMap(List<String> articleIds);

    List<ArticleSimpleResponseDTO> buildFavoriteArticleResponseList(List<KnowledgeArticle> articles,
                                                                    List<UserFavorite> favorites,
                                                                    String sortField,
                                                                    String sortDirection);
}