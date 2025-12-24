package com.emosync.service.convert;

import com.emosync.DTO.command.CategoryCreateDTO;
import com.emosync.DTO.command.CategoryUpdateDTO;
import com.emosync.DTO.response.CategoryResponseDTO;
import com.emosync.entity.KnowledgeCategory;
import com.emosync.enumClass.CategoryStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Knowledge category conversion class
 */
public class CategoryConvert {

    /**
     * Convert create command DTO to entity
     * @param createDTO Create command DTO
     * @return Category entity
     */
    public static KnowledgeCategory createCommandToEntity(CategoryCreateDTO createDTO) {
        return KnowledgeCategory.builder()
                .categoryName(createDTO.getCategoryName())
                .description(createDTO.getDescription())
                .sortOrder(createDTO.getSortOrder())
                .status(createDTO.getStatus())
                .build();
    }

    /**
     * Convert update command DTO to entity
     * @param updateDTO Update command DTO
     * @return Category entity
     */
    public static KnowledgeCategory updateCommandToEntity(CategoryUpdateDTO updateDTO) {
        KnowledgeCategory category = new KnowledgeCategory();
        category.setCategoryName(updateDTO.getCategoryName());
        category.setDescription(updateDTO.getDescription());
        category.setSortOrder(updateDTO.getSortOrder());
        category.setStatus(updateDTO.getStatus());
        category.setUpdatedAt(LocalDateTime.now());
        return category;
    }

    /**
     * Convert entity to response DTO
     * @param category Category entity
     * @return Category response DTO
     */
    public static CategoryResponseDTO entityToResponse(KnowledgeCategory category) {
        return CategoryResponseDTO.builder()
                .id(category.getId())
                .categoryName(category.getCategoryName())
                .description(category.getDescription())
                .sortOrder(category.getSortOrder())
                .status(category.getStatus())
                .statusText(getStatusText(category.getStatus()))
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    /**
     * Convert entity to response DTO (with statistics)
     * @param category Category entity
     * @param articleCount Article count
     * @return Category response DTO
     */
    public static CategoryResponseDTO entityToResponseWithStats(KnowledgeCategory category,
                                                               Integer articleCount) {
        CategoryResponseDTO response = entityToResponse(category);
        response.setArticleCount(articleCount);
        return response;
    }

    /**
     * Convert entity list to response DTO list
     * @param categories Category entity list
     * @return Category response DTO list
     */
    public static List<CategoryResponseDTO> entityListToResponseList(List<KnowledgeCategory> categories) {
        return categories.stream()
                .map(CategoryConvert::entityToResponse)
                .collect(Collectors.toList());
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
            return CategoryStatus.fromCode(status).getDescription();
        } catch (IllegalArgumentException e) {
            return "Unknown";
        }
    }
}