package com.emosync.controller;


import com.emosync.Result.PageResult;
import com.emosync.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.emosync.DTO.query.UserFavoriteQueryDTO;
import com.emosync.DTO.response.ArticleSimpleResponseDTO;
import com.emosync.Result.Result;
import com.emosync.service.UserFavoriteService;
import com.emosync.util.JwtTokenUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * User Favorite Management Controller
 * @author Yuan
 */
@Tag(name = "User Favorite Management")
@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/knowledge/favorite")
public class UserFavoriteController {


    private  final UserFavoriteService userFavoriteService;

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
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;

        for (GrantedAuthority authority : auth.getAuthorities()) {
            if ("ROLE_admin".equals(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }

    /**
     * Favorite article
     */
    @Operation(summary = "Favorite article")
    @PostMapping("/{articleId}")
    public Result<Void> favoriteArticle(
            @Parameter(description = "Article ID") @PathVariable String articleId,
            HttpServletRequest request) {
        
        // Get current user ID
        Long currentUserId = getCurrentUserInfo().getId();
        if (currentUserId == null) {
            return Result.error("User not logged in");
        }

        log.info("User favorite article: userId={}, articleId={}", currentUserId, articleId);
        userFavoriteService.favoriteArticle(currentUserId, articleId);
        return Result.success();
    }

    /**
     * Unfavorite article
     */
    @Operation(summary = "Unfavorite article")
    @DeleteMapping("/{articleId}")
    public Result<Void> unfavoriteArticle(
            @Parameter(description = "Article ID") @PathVariable String articleId,
            HttpServletRequest request) {
        
        // Get current user ID
        Long currentUserId = getCurrentUserInfo().getId();
        if (currentUserId == null) {
            return Result.error("User not logged in");
        }

        log.info("User unfavorite article: userId={}, articleId={}", currentUserId, articleId);
        userFavoriteService.unfavoriteArticle(currentUserId, articleId);
        return Result.success();
    }

    /**
     * Check if article is favorited
     */
    @Operation(summary = "Check if article is favorited")
    @GetMapping("/{articleId}/status")
    public Result<Boolean> checkFavoriteStatus(
            @Parameter(description = "Article ID") @PathVariable String articleId,
            HttpServletRequest request) {
        
        // Get current user ID
        Long currentUserId = getCurrentUserInfo().getId();
        if (currentUserId == null) {
            return Result.success(false);
        }

        log.info("Check article favorite status: userId={}, articleId={}", currentUserId, articleId);
        boolean isFavorited = userFavoriteService.isFavorited(currentUserId, articleId);
        return Result.success(isFavorited);
    }

    /**
     * Paginated query of user favorite articles
     */
    @Operation(summary = "Paginated query of user favorite articles")
    @GetMapping("/page")
    public Result<PageResult<ArticleSimpleResponseDTO>> getUserFavoritePage(
            @Parameter(description = "Article title") @RequestParam(required = false) String title,
            @Parameter(description = "Category ID") @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortField,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDirection,
            @Parameter(description = "Current page number") @RequestParam(defaultValue = "1") Long currentPage,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") Long size,
            HttpServletRequest request) {

        // Get current user ID
        Long currentUserId = getCurrentUserInfo().getId();
        if (currentUserId == null) {
            return Result.error("User not logged in");
        }

        UserFavoriteQueryDTO queryDTO = new UserFavoriteQueryDTO();
        queryDTO.setUserId(currentUserId);
        queryDTO.setTitle(title);
        queryDTO.setCategoryId(categoryId);
        queryDTO.setSortField(sortField);
        queryDTO.setSortDirection(sortDirection);
        queryDTO.setCurrentPage(currentPage);
        queryDTO.setSize(size);

        log.info("Paginated query user favorite articles: userId={}, page={}, size={}", currentUserId, currentPage, size);
        PageResult<ArticleSimpleResponseDTO> response = userFavoriteService.getUserFavoritePage(queryDTO);
        return Result.success(response);
    }

    /**
     * Get total count of user favorite articles
     */
    @Operation(summary = "Get total count of user favorite articles")
    @GetMapping("/count")
    public Result<Long> getUserFavoriteCount(HttpServletRequest request) {
        
        // Get current user ID
        Long currentUserId = getCurrentUserInfo().getId();
        if (currentUserId == null) {
            return Result.error("User not logged in");
        }

        log.info("Get total count of user favorite articles: userId={}", currentUserId);
        Long count = userFavoriteService.getUserFavoriteCount(currentUserId);
        return Result.success(count);
    }
}