package com.emosync.service;

import com.emosync.DTO.command.ArticleCreateDTO;
import com.emosync.DTO.command.ArticleUpdateDTO;
import com.emosync.DTO.query.ArticleListQueryDTO;
import com.emosync.DTO.response.ArticleResponseDTO;
import com.emosync.DTO.response.ArticleSimpleResponseDTO;
import com.emosync.DTO.response.ArticleStatisticsResponseDTO;
import com.emosync.Result.PageResult;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public interface KnowledgeArticleService {
    ArticleResponseDTO createArticle(ArticleCreateDTO createDTO, Long authorId);

    void deleteArticle(String articleId, Long currentUserId);

    ArticleResponseDTO getArticleById(String articleId, Long currentUserId);

    ArticleResponseDTO readArticle(String articleId, Long currentUserId);

    PageResult<ArticleSimpleResponseDTO> getArticlePage(ArticleListQueryDTO queryDTO, Long currentUserId);

    ArticleResponseDTO publishArticle(String articleId, Long currentUserId);

    ArticleResponseDTO offlineArticle(String articleId, Long currentUserId);

    ArticleResponseDTO updateArticle(String id, ArticleUpdateDTO updateDTO, Long currentUserId);

    ArticleResponseDTO updateArticleStatus(String id, Integer status, Long currentUserId);

    void batchDeleteArticles(List<String> ids, Long currentUserId);

    ArticleStatisticsResponseDTO getArticleStatistics(Long currentUserId);
}
