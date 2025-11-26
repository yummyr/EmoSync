package com.emosync.service.serviceImpl;

import com.emosync.DTO.command.ArticleCreateDTO;
import com.emosync.DTO.command.ArticleUpdateDTO;
import com.emosync.DTO.query.ArticleListQueryDTO;
import com.emosync.DTO.response.ArticleResponseDTO;
import com.emosync.DTO.response.ArticleSimpleResponseDTO;
import com.emosync.DTO.response.ArticleStatisticsResponseDTO;
import com.emosync.Result.PageResult;
import com.emosync.service.KnowledgeArticleService;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class KnowledgeArticleServiceImpl implements KnowledgeArticleService {
    @Override
    public ArticleResponseDTO createArticle(ArticleCreateDTO createDTO, Long authorId) {
        return null;
    }

    @Override
    public void deleteArticle(String articleId, Long currentUserId) {

    }

    @Override
    public ArticleResponseDTO getArticleById(String articleId, Long currentUserId) {
        return null;
    }

    @Override
    public ArticleResponseDTO readArticle(String articleId, Long currentUserId) {
        return null;
    }

    @Override
    public PageResult<ArticleSimpleResponseDTO> getArticlePage(ArticleListQueryDTO queryDTO, Long currentUserId) {
        return null;
    }

    @Override
    public ArticleResponseDTO publishArticle(String articleId, Long currentUserId) {
        return null;
    }

    @Override
    public ArticleResponseDTO offlineArticle(String articleId, Long currentUserId) {
        return null;
    }

    @Override
    public ArticleResponseDTO updateArticle(String id, ArticleUpdateDTO updateDTO, Long currentUserId) {
        return null;
    }

    @Override
    public ArticleResponseDTO updateArticleStatus(String id, Integer status, Long currentUserId) {
        return null;
    }

    @Override
    public void batchDeleteArticles(List<String> ids, Long currentUserId) {

    }

    @Override
    public ArticleStatisticsResponseDTO getArticleStatistics(Long currentUserId) {
        return null;
    }
}
