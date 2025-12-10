package com.emosync.controller;

import com.emosync.Result.PageResult;
import com.emosync.entity.KnowledgeCategory;
import com.emosync.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.emosync.DTO.command.CategoryCreateDTO;
import com.emosync.DTO.command.CategoryUpdateDTO;
import com.emosync.DTO.query.CategoryListQueryDTO;
import com.emosync.DTO.response.CategoryResponseDTO;
import com.emosync.Result.Result;
import com.emosync.enumClass.UserType;
import com.emosync.service.KnowledgeCategoryService;
import com.emosync.util.JwtTokenUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Knowledge Category Management Controller
 * @author Yuan
 */
@Tag(name = "Knowledge Category Management")
@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/knowledge/category")
public class KnowledgeCategoryController {


    private final KnowledgeCategoryService knowledgeCategoryService;

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
     * Create category (Admin feature)
     */
    @Operation(summary = "Create knowledge category")
    @PostMapping
    public Result<CategoryResponseDTO> createCategory(
            @Valid @RequestBody CategoryCreateDTO createDTO,
            HttpServletRequest request) {
        
        // Permission check: only admin can create categories
        if (!isAdmin()) {
            return Result.error("Permission denied");
        }

        log.info("Admin creates knowledge category: {}", createDTO.getCategoryName());
        CategoryResponseDTO response = knowledgeCategoryService.createCategory(createDTO);
        return Result.success("Category created successfully", response);
    }

    /**
     * Update category (Admin feature)
     */
    @Operation(summary = "Update knowledge category")
    @PutMapping("/{id}")
    public Result<CategoryResponseDTO> updateCategory(
            @Parameter(description = "Category ID") @PathVariable Long id,
            @Valid @RequestBody CategoryUpdateDTO updateDTO,
            HttpServletRequest request) {
        
        // Permission check: only admin can update categories
        if (!isAdmin()) {
            return Result.error("Permission denied");
        }

        log.info("Admin updates knowledge category: categoryId={}", id);
        CategoryResponseDTO response = knowledgeCategoryService.updateCategory(id, updateDTO);
        return Result.success("Category updated successfully", response);
    }

    /**
     * Delete category (Admin feature)
     */
    @Operation(summary = "Delete knowledge category")
    @DeleteMapping("/{id}")
    public Result<Void> deleteCategory(
            @Parameter(description = "Category ID") @PathVariable Long id,
            HttpServletRequest request) {
        
        // Permission check: only admin can delete categories
        if (!isAdmin()) {
            return Result.error("Permission denied");
        }

        log.info("Admin deletes knowledge category: categoryId={}", id);
        knowledgeCategoryService.deleteCategory(id);
        return Result.success();
    }

    /**
     * Get category details by ID
     */
    @Operation(summary = "Get knowledge category details")
    @GetMapping("/{id}")
    public Result<CategoryResponseDTO> getCategoryById(
            @Parameter(description = "分类ID") @PathVariable Long id) {
        
        log.info("Get knowledge category details: categoryId={}", id);
        CategoryResponseDTO response = knowledgeCategoryService.getCategoryById(id);
        return Result.success(response);
    }

    /**
     * Update knowledge category status
     */
    @Operation(summary = "Update knowledge category status")
    @PutMapping("/status/{id}")
    public Result<CategoryResponseDTO> updateCategoryStatus(@PathVariable Long id) {

        log.info("Update knowledge category status: categoryId={}", id);
         knowledgeCategoryService.updateStatus(id);
        return Result.success();
    }

    /**
     * Paginated category list query
     */
    @Operation(summary = "Get paginated knowledge category list")
    @GetMapping("/page")
    public Result<PageResult<CategoryResponseDTO>> getCategoryPage(
            @Parameter(description = "Category name") @RequestParam(required = false) String categoryName,
            @Parameter(description = "Status") @RequestParam(required = false) Integer status,
            @Parameter(description = "Current page") @RequestParam(defaultValue = "1") Long currentPage,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") Long size) {

        CategoryListQueryDTO queryDTO = new CategoryListQueryDTO();
        queryDTO.setCategoryName(categoryName);
        queryDTO.setStatus(status);
        queryDTO.setCurrentPage(currentPage);
        queryDTO.setSize(size);

        log.info("Get paginated knowledge category list: page={}, size={}", currentPage, size);
        PageResult<CategoryResponseDTO> response = knowledgeCategoryService.getCategoryPage(queryDTO);
        return Result.success(response);
    }

    /**
     * Get all enabled knowledge category IDs and names
     */
    @Operation(summary = "Get enabled knowledge categories")
    @GetMapping("/all")
    public Result<Map<Long,String>> getEnabledCategory() {
        log.info("Get enabled knowledge categories");
        Map<Long,String> response = knowledgeCategoryService.getEnabledCategory();
        return Result.success(response);
    }

    /**
     * Get category tree (for frontend display)
     */
    @Operation(summary = "Get knowledge category tree")
    @GetMapping("/tree")
    public Result<List<CategoryResponseDTO>> getCategoryTree() {
        log.info("Get knowledge category tree");
        List<CategoryResponseDTO> response = knowledgeCategoryService.getCategoryTree();
        return Result.success(response);
    }
}