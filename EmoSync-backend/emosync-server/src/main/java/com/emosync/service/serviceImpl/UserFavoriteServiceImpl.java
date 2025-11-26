package com.emosync.service.serviceImpl;

import com.emosync.DTO.query.UserFavoriteQueryDTO;
import com.emosync.DTO.response.ArticleSimpleResponseDTO;
import com.emosync.Result.PageResult;
import com.emosync.entity.KnowledgeArticle;
import com.emosync.entity.UserFavorite;
import com.emosync.service.UserFavoriteService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
@Service
public class UserFavoriteServiceImpl implements UserFavoriteService {
    @Override
    public void favoriteArticle(Long userId, String articleId) {

    }

    @Override
    public void unfavoriteArticle(Long userId, String articleId) {

    }

    @Override
    public boolean isFavorited(Long userId, String articleId) {
        return false;
    }

    @Override
    public PageResult<ArticleSimpleResponseDTO> getUserFavoritePage(UserFavoriteQueryDTO queryDTO) {
        return null;
    }

    @Override
    public Long getUserFavoriteCount(Long userId) {
        return null;
    }

    @Override
    public Map<String, Integer> getArticleFavoriteCountMap(List<String> articleIds) {
        return null;
    }

    @Override
    public List<ArticleSimpleResponseDTO> buildFavoriteArticleResponseList(List<KnowledgeArticle> articles, List<UserFavorite> favorites, String sortField, String sortDirection) {
        return null;
    }
}
