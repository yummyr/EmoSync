package com.emosync.service.convert;

import com.emosync.DTO.command.ArticleCreateDTO;
import com.emosync.DTO.command.ArticleUpdateDTO;
import com.emosync.DTO.response.ArticleResponseDTO;
import com.emosync.DTO.response.ArticleSimpleResponseDTO;
import com.emosync.entity.KnowledgeArticle;
import com.emosync.entity.KnowledgeCategory;
import com.emosync.entity.User;
import com.emosync.enumClass.ArticleStatus;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Knowledge article conversion utility class
 * @author system
 */
public class ArticleConvert {

    /**
     * Convert create command DTO to entity
     * @param createDTO Create command DTO
     * @param authorId Author ID
     * @return Article entity
     */
    public static KnowledgeArticle createCommandToEntity(ArticleCreateDTO createDTO, Long authorId) {
        KnowledgeCategory category = new KnowledgeCategory();
        category.setId(createDTO.getCategoryId());

        User author = new User();
        author.setId(authorId);

        KnowledgeArticle.KnowledgeArticleBuilder builder = KnowledgeArticle.builder()
                .category(category)
                .title(createDTO.getTitle())
                .summary(createDTO.getSummary())
                .content(createDTO.getContent())
                .coverImage(createDTO.getCoverImage())
                .tags(createDTO.getTags())
                .author(author)
                .readCount(0)
                .status(createDTO.getStatus());

                
        // If frontend provides ID (UUID pre-generated), then use that ID
        if (createDTO.getId() != null && !createDTO.getId().trim().isEmpty()) {
            builder.id(createDTO.getId());
        }
        
        return builder.build();
    }

    /**
     * Convert update command DTO to entity
     * @param updateDTO Update command DTO
     * @return Article entity
     */
    public static KnowledgeArticle updateCommandToEntity(ArticleUpdateDTO updateDTO) {
        KnowledgeArticle article = new KnowledgeArticle();

        // Handle category_id → KnowledgeCategory
        if (updateDTO.getCategoryId() != null) {
            KnowledgeCategory category = new KnowledgeCategory();
            category.setId(updateDTO.getCategoryId());
            article.setCategory(category);
        }


        article.setTitle(updateDTO.getTitle());
        article.setSummary(updateDTO.getSummary());
        article.setContent(updateDTO.getContent());
        article.setCoverImage(updateDTO.getCoverImage());
        article.setTags(updateDTO.getTags());
        article.setStatus(updateDTO.getStatus());
        article.setUpdatedAt(LocalDateTime.now());
        return article;
    }

    /**
     * Convert entity to response DTO
     * @param article Article entity
     * @param categoryName Category name
     * @param authorName Author name
     * @param isFavorited Whether favorited
     * @return Article response DTO
     */
    public static ArticleResponseDTO entityToResponse(KnowledgeArticle article, 
                                                     String categoryName, 
                                                     String authorName, 
                                                     Boolean isFavorited) {
        return ArticleResponseDTO.builder()
                .id(article.getId())
                .categoryId(article.getCategory() != null ? article.getCategory().getId() : null)
                .categoryName(categoryName)
                .title(article.getTitle())
                .summary(article.getSummary())
                .content(article.getContent())
                .coverImage(article.getCoverImage())
                .tags(article.getTags())
                .authorId(article.getAuthor() != null ? article.getAuthor().getId() : null)
                .authorName(authorName)
                .readCount(article.getReadCount())
                .status(article.getStatus())
                .statusText(getStatusText(article.getStatus()))
                .isFavorited(isFavorited)
                .publishedAt(article.getPublishedAt())
                .createdAt(article.getCreatedAt())
                .updatedAt(article.getUpdatedAt())
                .build();
    }

    private static List<String> convertTagsToList(String tags) {
        if (tags == null || tags.isBlank()) return Collections.emptyList();
        return Arrays.stream(tags.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .collect(Collectors.toList());
    }

    /**
     * Convert entity to simple response DTO
     * @param article Article entity
     * @param categoryName Category name
     * @param authorName Author name
     * @param isFavorited Whether favorited
     * @return Article simple response DTO
     */
    public static ArticleSimpleResponseDTO entityToSimpleResponse(KnowledgeArticle article, 
                                                                 String categoryName, 
                                                                 String authorName, 
                                                                 Boolean isFavorited) {
        return ArticleSimpleResponseDTO.builder()
                .id(article.getId())
                .categoryId(article.getCategory() != null ? article.getCategory().getId() : null)
                .categoryName(categoryName)
                .title(article.getTitle())
                .summary(article.getSummary()) // Use auto-generated summary
                .coverImage(article.getCoverImage())
                .tags(article.getTags())
                .authorName(authorName)
                .readCount(article.getReadCount())
                .status(article.getStatus())
                .statusText(getStatusText(article.getStatus()))
                .isFavorited(isFavorited)
                .favoriteCount(0) // Default value, actual value needs to be set in Service layer
                .publishedAt(article.getPublishedAt())
                .createdAt(article.getCreatedAt())
                .updatedAt(article.getUpdatedAt())
                .build();
    }

    /**
     * Convert entity to simple response DTO (with favorite count)
     * @param article Article entity
     * @param categoryName Category name
     * @param authorName Author name
     * @param isFavorited Whether favorited
     * @param favoriteCount Favorite count
     * @return Article simple response DTO
     */
    public static ArticleSimpleResponseDTO entityToSimpleResponseWithFavoriteCount(KnowledgeArticle article, 
                                                                                   String categoryName, 
                                                                                   String authorName, 
                                                                                   Boolean isFavorited,
                                                                                   Integer favoriteCount) {
        return ArticleSimpleResponseDTO.builder()
                .id(article.getId())
                .categoryId(article.getCategory() != null ? article.getCategory().getId() : null)
                .categoryName(categoryName)
                .title(article.getTitle())
                .summary(article.getSummary()) // Use auto-generated summary
                .coverImage(article.getCoverImage())
                .tags(article.getTags())
                .authorName(authorName)
                .readCount(article.getReadCount())
                .status(article.getStatus())
                .statusText(getStatusText(article.getStatus()))
                .isFavorited(isFavorited)
                .favoriteCount(favoriteCount)
                .publishedAt(article.getPublishedAt())
                .createdAt(article.getCreatedAt())
                .updatedAt(article.getUpdatedAt())
                .build();
    }

    /**
     * Convert entity to simple response DTO (with favorite time)
     * @param article Article entity
     * @param categoryName Category name
     * @param authorName Author name
     * @param isFavorited Whether favorited
     * @param favoriteTime Favorite time
     * @return Article simple response DTO
     */
    public static ArticleSimpleResponseDTO entityToSimpleResponseWithFavoriteTime(KnowledgeArticle article, 
                                                                                   String categoryName, 
                                                                                   String authorName, 
                                                                                   Boolean isFavorited,
                                                                                   LocalDateTime favoriteTime) {
        return ArticleSimpleResponseDTO.builder()
                .id(article.getId())
                .categoryId(article.getCategory() != null ? article.getCategory().getId() : null)
                .categoryName(categoryName)
                .title(article.getTitle())
                .summary(article.getSummary()) // Use auto-generated summary
                .coverImage(article.getCoverImage())
                .tags(article.getTags())
                .authorName(authorName)
                .readCount(article.getReadCount())
                .status(article.getStatus())
                .statusText(getStatusText(article.getStatus()))
                .isFavorited(isFavorited)
                .favoriteCount(0) // Default value, favorite count not displayed on MyFavorites page
                .favoriteTime(favoriteTime)
                .publishedAt(article.getPublishedAt())
                .createdAt(article.getCreatedAt())
                .updatedAt(article.getUpdatedAt())
                .build();
    }

    /**
     * Convert entity list to simple response DTO list
     * @param articles Article entity list
     * @return Article simple response DTO list
     */
    public static List<ArticleSimpleResponseDTO> entityListToSimpleResponseList(List<KnowledgeArticle> articles) {
        return articles.stream()
                .map(article -> entityToSimpleResponse(article, null, null, false))
                .collect(Collectors.toList());
    }

    /**
     * Update entity when publishing article
     * @param article Article entity
     * @return Updated article entity
     */
    public static KnowledgeArticle publishArticle(KnowledgeArticle article) {
        article.setStatus(ArticleStatus.PUBLISHED.getCode());
        article.setPublishedAt(LocalDateTime.now());
        article.setUpdatedAt(LocalDateTime.now());
        return article;
    }

    /**
     * Update entity when taking article offline
     * @param article Article entity
     * @return Updated article entity
     */
    public static KnowledgeArticle offlineArticle(KnowledgeArticle article) {
        article.setStatus(ArticleStatus.OFFLINE.getCode());
        article.setUpdatedAt(LocalDateTime.now());
        return article;
    }

    /**
     * Get status display text
     * @param status Status code
     * @return Status display text
     */
    private static String getStatusText(Integer status) {
        if (status == null) {
            return "Unknown";
        }
        try {
            return ArticleStatus.fromCode(status).getDescription();
        } catch (IllegalArgumentException e) {
            return "Unknown";
        }
    }
}