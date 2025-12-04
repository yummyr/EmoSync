package com.emosync.service.serviceImpl;

import com.emosync.DTO.command.CategoryCreateDTO;
import com.emosync.DTO.command.CategoryUpdateDTO;
import com.emosync.DTO.query.CategoryListQueryDTO;
import com.emosync.DTO.response.CategoryResponseDTO;
import com.emosync.Result.PageResult;
import com.emosync.entity.KnowledgeCategory;
import com.emosync.exception.BusinessException;
import com.emosync.repository.KnowledgeArticleRepository;
import com.emosync.repository.KnowledgeCategoryRepository;
import com.emosync.service.KnowledgeCategoryService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class KnowledgeCategoryServiceImpl implements KnowledgeCategoryService {
    private final KnowledgeCategoryRepository knowledgeCategoryRepository;
    private final KnowledgeArticleRepository articleRepository;
    @Override
    public CategoryResponseDTO createCategory(CategoryCreateDTO createDTO) {
        // 分类重名检查
        if (knowledgeCategoryRepository.existsByCategoryName(createDTO.getCategoryName())) {
            throw new BusinessException("分类名称已存在");
        }

        KnowledgeCategory category = KnowledgeCategory.builder()
                .categoryName(createDTO.getCategoryName())
                .description(createDTO.getDescription())
                .sortOrder(createDTO.getSortOrder())
                .status(createDTO.getStatus())
                .build();

        knowledgeCategoryRepository.save(category);

        log.info("创建分类成功: {}", category.getCategoryName());

        return toResponse(category, 0);
    }

    @Override
    public CategoryResponseDTO updateCategory(Long categoryId, CategoryUpdateDTO updateDTO) {
        KnowledgeCategory existing = knowledgeCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new BusinessException("分类不存在"));

        // 新名称是否被其他分类使用
        if (updateDTO.getCategoryName() != null &&
                knowledgeCategoryRepository.existsByCategoryNameAndIdNot(updateDTO.getCategoryName(), categoryId)) {
            throw new BusinessException("分类名称已被其他分类使用");
        }

        if (updateDTO.getCategoryName() != null)
            existing.setCategoryName(updateDTO.getCategoryName());

        if (updateDTO.getDescription() != null)
            existing.setDescription(updateDTO.getDescription());

        if (updateDTO.getSortOrder() != null)
            existing.setSortOrder(updateDTO.getSortOrder());

        if (updateDTO.getStatus() != null)
            existing.setStatus(updateDTO.getStatus());

        existing.setUpdatedAt(LocalDateTime.now());
        knowledgeCategoryRepository.save(existing);

        Integer articleCount = Math.toIntExact(articleRepository.countByCategory_Id(existing.getId()));

        log.info("更新分类成功: {}", existing.getCategoryName());

        return toResponse(existing, articleCount);
    }

    @Override
    public void deleteCategory(Long categoryId) {
        KnowledgeCategory category = knowledgeCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new BusinessException("分类不存在"));

        Long articleCount = articleRepository.countByCategory_Id(categoryId);

        if (articleCount > 0) {
            throw new BusinessException("该分类下存在文章，无法删除");
        }

        knowledgeCategoryRepository.delete(category);

        log.info("删除分类成功 ID={}", categoryId);
    }
    /**
     * 根据ID获取分类
     */
    @Override
    public CategoryResponseDTO getCategoryById(Long id) {

        KnowledgeCategory category = knowledgeCategoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException("分类不存在"));

        Integer articleCount = Math.toIntExact(articleRepository.countByCategory_Id(id));

        return toResponse(category, articleCount);
    }

    @Override
    public PageResult<CategoryResponseDTO> getCategoryPage(CategoryListQueryDTO queryDTO) {
        Pageable pageable = PageRequest.of(
                queryDTO.getCurrentPage().intValue() - 1,
                queryDTO.getSize().intValue(),
                Sort.by("sortOrder").ascending().and(Sort.by("createdAt").descending())
        );

        // 动态查询：Specification 方式
        Specification<KnowledgeCategory> spec = (root, query, cb) -> {
            List<Predicate> predicates = new java.util.ArrayList<>();

            if (queryDTO.getCategoryName() != null && !queryDTO.getCategoryName().isBlank()) {
                predicates.add(cb.like(root.get("categoryName"),
                        "%" + queryDTO.getCategoryName().trim() + "%"));
            }
            if (queryDTO.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), queryDTO.getStatus()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<KnowledgeCategory> page = knowledgeCategoryRepository.findAll(spec, pageable);

        List<CategoryResponseDTO> records = page.getContent().stream()
                .map(c -> toResponse(c, Math.toIntExact(articleRepository.countByCategory_Id(c.getId()))))
                .collect(Collectors.toList());


        return new PageResult<>(page.getTotalElements(),records);
    }

    @Override
    public List<CategoryResponseDTO> getCategoryTree() {

        return knowledgeCategoryRepository.findAllCategoryDTOs();
    }
    @Override
    public Map<Long,String> getEnabledCategory() {
        List<KnowledgeCategory> categories = knowledgeCategoryRepository.findAllEnabled();

        return categories.stream()
                .collect(Collectors.toMap(
                        KnowledgeCategory::getId,
                        KnowledgeCategory::getCategoryName,
                        (existing, replacement) -> existing
                ));
    }


    /**
     * 工具方法：将 Entity 映射为 DTO
     */
    private CategoryResponseDTO toResponse(KnowledgeCategory entity, Integer articleCount) {
        return CategoryResponseDTO.builder()
                .id(entity.getId())
                .categoryName(entity.getCategoryName())
                .description(entity.getDescription())
                .sortOrder(entity.getSortOrder())
                .status(entity.getStatus())
                .statusText(entity.getStatus() == 1 ? "ENABLE" : "DISABLE")
                .articleCount(articleCount)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }


}
