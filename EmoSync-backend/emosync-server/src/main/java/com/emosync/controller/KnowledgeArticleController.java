package com.emosync.controller;

import com.emosync.Result.PageResult;
import com.emosync.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.emosync.DTO.command.ArticleBatchDeleteDTO;
import com.emosync.DTO.command.ArticleCreateDTO;
import com.emosync.DTO.command.ArticleStatusUpdateDTO;
import com.emosync.DTO.command.ArticleUpdateDTO;
import com.emosync.DTO.query.ArticleListQueryDTO;
import com.emosync.DTO.response.ArticleResponseDTO;
import com.emosync.DTO.response.ArticleSimpleResponseDTO;
import com.emosync.DTO.response.ArticleStatisticsResponseDTO;
import com.emosync.Result.Result;
import com.emosync.service.KnowledgeArticleService;
import com.emosync.util.JwtTokenUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * Knowledge Article Management Controller
 * @author system
 */
@Tag(name = "Knowledge Article Management")
@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/knowledge/article")
public class KnowledgeArticleController {


    private final KnowledgeArticleService knowledgeArticleService;


    /** Get current authenticated UserDetailsImpl */
    private UserDetailsImpl getCurrentUserInfo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !(auth.getPrincipal() instanceof UserDetailsImpl)) {
            return null;
        }
        return (UserDetailsImpl) auth.getPrincipal();
    }

    /** Check if current user has ROLE_ADMIN */
    private boolean isAdmin() {
        UserDetailsImpl userDetails = getCurrentUserInfo();
        return userDetails != null && userDetails.isAdmin();
    }

    /**
     * Create article
     */
    @Operation(summary = "Create knowledge article")
    @PostMapping
    public Result<ArticleResponseDTO> createArticle(
            @Valid @RequestBody ArticleCreateDTO createDTO,
            HttpServletRequest request) {
        
        // Get current user ID
        Long currentUserId = getCurrentUserInfo().getId();
        if (currentUserId == null) {
            return Result.error("User not logged in");
        }

        // Add detailed logs
        log.info("📝 User creates knowledge article: userId={}, title={}, contentLength={}, summary={}",
            currentUserId, createDTO.getTitle(),
            createDTO.getContent() != null ? createDTO.getContent().length() : 0,
            createDTO.getSummary());

        if (createDTO.getContent() == null || createDTO.getContent().trim().isEmpty()) {
            log.warn("⚠️ Controller layer detects empty content: {}", createDTO);
            return Result.error("Article content cannot be empty");
        }

        ArticleResponseDTO response = knowledgeArticleService.createArticle(createDTO, currentUserId);
        return Result.success("Article created successfully", response);
    }

    /**
     * Update article
     */
    @Operation(summary = "Update knowledge article")
    @PutMapping("/{id}")
    public Result<ArticleResponseDTO> updateArticle(
            @Parameter(description = "Article ID") @PathVariable String id,
            @Valid @RequestBody ArticleUpdateDTO updateDTO,
            HttpServletRequest request) {
        
        // Get current user ID
        Long currentUserId = getCurrentUserInfo().getId();
        if (currentUserId == null) {
            return Result.error("User not logged in");
        }

        log.info("User updates knowledge article: userId={}, articleId={}", currentUserId, id);
        ArticleResponseDTO response = knowledgeArticleService.updateArticle(id, updateDTO, currentUserId);
        return Result.success("Article updated successfully", response);
    }

    /**
     * Delete article
     */
    @Operation(summary = "Delete knowledge article")
    @DeleteMapping("/{id}")
    public Result<Void> deleteArticle(
            @Parameter(description = "Article ID") @PathVariable String id,
            HttpServletRequest request) {
        
        // Get current user ID
        Long currentUserId = getCurrentUserInfo().getId();
        if (currentUserId == null) {
            return Result.error("User not logged in");
        }

        log.info("User deletes knowledge article: userId={}, articleId={}", currentUserId, id);
        knowledgeArticleService.deleteArticle(id, currentUserId);
        return Result.success();
    }

    /**
     * Get article details by ID
     */
    @Operation(summary = "Get knowledge article details")
    @GetMapping("/{id}")
    public Result<ArticleResponseDTO> getArticleById(
            @Parameter(description = "Article ID") @PathVariable String id,
            HttpServletRequest request) {
        
        // Get current user ID (can be null, used to determine favorite status)
        Long currentUserId = getCurrentUserInfo().getId();

        log.info("Get knowledge article details: articleId={}, userId={}", id, currentUserId);
        ArticleResponseDTO response = knowledgeArticleService.getArticleById(id, currentUserId);
        return Result.success(response);
    }

    /**
     * Read article (increase read count)
     */
    @Operation(summary = "Read knowledge article")
    @PostMapping("/{id}/read")
    public Result<ArticleResponseDTO> readArticle(
            @Parameter(description = "Article ID") @PathVariable String id,
            HttpServletRequest request) {
        
        // Get current user ID (can be null)
        Long currentUserId = getCurrentUserInfo().getId();

        log.info("Read knowledge article: articleId={}, userId={}", id, currentUserId);
        ArticleResponseDTO response = knowledgeArticleService.readArticle(id, currentUserId);
        return Result.success(response);
    }

    /**
     * Publish article
     */
    @Operation(summary = "Publish knowledge article")
    @PostMapping("/{id}/publish")
    public Result<ArticleResponseDTO> publishArticle(
            @Parameter(description = "Article ID") @PathVariable String id,
            HttpServletRequest request) {
        
        // Get current user ID
        Long currentUserId = getCurrentUserInfo().getId();
        if (currentUserId == null) {
            return Result.error("User not logged in");
        }

        log.info("User publishes knowledge article: userId={}, articleId={}", currentUserId, id);
        ArticleResponseDTO response = knowledgeArticleService.publishArticle(id, currentUserId);
        return Result.success("Article published successfully", response);
    }

    /**
     * Take article offline
     */
    @Operation(summary = "Take knowledge article offline")
    @PostMapping("/{id}/offline")
    public Result<ArticleResponseDTO> offlineArticle(
            @Parameter(description = "Article ID") @PathVariable String id,
            HttpServletRequest request) {
        
        // Get current user ID
        Long currentUserId = getCurrentUserInfo().getId();
        if (currentUserId == null) {
            return Result.error("User not logged in");
        }

        log.info("User takes knowledge article offline: userId={}, articleId={}", currentUserId, id);
        ArticleResponseDTO response = knowledgeArticleService.offlineArticle(id, currentUserId);
        return Result.success("Article taken offline successfully", response);
    }

    /**
     * Paginated article list query
     */
    @Operation(summary = "Get paginated knowledge article list")
    @GetMapping("/page")
    public Result<PageResult<ArticleSimpleResponseDTO>> getArticlePage(
            @Parameter(description = "Keyword search (title+content+tags)") @RequestParam(required = false) String keyword,
            @Parameter(description = "Category ID") @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Article title") @RequestParam(required = false) String title,
            @Parameter(description = "Tags") @RequestParam(required = false) String tags,
            @Parameter(description = "Author ID") @RequestParam(required = false) Long authorId,
            @Parameter(description = "Status") @RequestParam(required = false) Integer status,
            @Parameter(description = "Start date") @RequestParam(required = false) String startDate,
            @Parameter(description = "End date") @RequestParam(required = false) String endDate,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "publishedAt") String sortField,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDirection,
            @Parameter(description = "Current page") @RequestParam(defaultValue = "1") Long currentPage,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") Long size,
            HttpServletRequest request) {

        // 获取当前用户ID（可为空，用于判断收藏状态和权限）
        Long currentUserId = getCurrentUserInfo().getId();

        ArticleListQueryDTO queryDTO = new ArticleListQueryDTO();
        queryDTO.setKeyword(keyword);
        queryDTO.setCategoryId(categoryId);
        queryDTO.setTitle(title);
        queryDTO.setTags(tags);
        queryDTO.setAuthorId(authorId);
        queryDTO.setStatus(status);
        queryDTO.setStartDate(startDate);
        queryDTO.setEndDate(endDate);
        queryDTO.setSortField(sortField);
        queryDTO.setSortDirection(sortDirection);
        queryDTO.setCurrentPage(currentPage);
        queryDTO.setSize(size);

        log.info("Get paginated knowledge article list: keyword={}, page={}, size={}, userId={}", keyword, currentPage, size, currentUserId);
        PageResult<ArticleSimpleResponseDTO> response = knowledgeArticleService.getArticlePage(queryDTO, currentUserId);
        return Result.success(response);
    }

    /**
     * Update article status
     */
    @Operation(summary = "Update article status")
    @PutMapping("/{id}/status")
    public Result<ArticleResponseDTO> updateArticleStatus(
            @Parameter(description = "Article ID") @PathVariable String id,
            @Valid @RequestBody ArticleStatusUpdateDTO statusUpdateDTO,
            HttpServletRequest request) {
        
        // Get current user ID
        Long currentUserId = getCurrentUserInfo().getId();
        if (currentUserId == null) {
            return Result.error("User not logged in");
        }

        log.info("User updates article status: userId={}, articleId={}, status={}", currentUserId, id, statusUpdateDTO.getStatus());
        ArticleResponseDTO response = knowledgeArticleService.updateArticleStatus(id, statusUpdateDTO.getStatus(), currentUserId);
        return Result.success("Status updated successfully", response);
    }

    /**
     * Batch delete articles
     */
    @Operation(summary = "Batch delete articles")
    @DeleteMapping("/batch")
    public Result<Void> batchDeleteArticles(
            @Valid @RequestBody ArticleBatchDeleteDTO batchDeleteDTO,
            HttpServletRequest request) {
        
        // Get current user ID
        Long currentUserId = getCurrentUserInfo().getId();
        if (currentUserId == null) {
            return Result.error("User not logged in");
        }

        log.info("User batch deletes articles: userId={}, articleIds={}", currentUserId, batchDeleteDTO.getIds());
        knowledgeArticleService.batchDeleteArticles(batchDeleteDTO.getIds(), currentUserId);
        return Result.success();
    }

    /**
     * Get article statistics
     */
    @Operation(summary = "Get article statistics")
    @GetMapping("/statistics")
    public Result<ArticleStatisticsResponseDTO> getArticleStatistics(HttpServletRequest request) {
        
        // Get current user ID (for permission control)
        Long currentUserId =getCurrentUserInfo().getId();
        if (currentUserId == null) {
            return Result.error("User not logged in");
        }

        log.info("Get article statistics: userId={}", currentUserId);
        ArticleStatisticsResponseDTO response = knowledgeArticleService.getArticleStatistics(currentUserId);
        return Result.success(response);
    }
}