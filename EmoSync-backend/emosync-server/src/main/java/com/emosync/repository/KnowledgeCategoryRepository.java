package com.emosync.repository;

import com.emosync.DTO.response.CategoryResponseDTO;
import com.emosync.entity.KnowledgeCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeCategoryRepository extends JpaRepository<KnowledgeCategory, Long> {
    /** 检查分类名称重复（排除自身） */
    boolean existsByCategoryName(String categoryName);

    boolean existsByCategoryNameAndIdNot(String categoryName, Long id);

    @Query("""
        SELECT new com.emosync.DTO.response.CategoryResponseDTO(
            c.id,
            c.categoryName,
            c.description,
            c.sortOrder,
            c.status,
            CASE 
                WHEN c.status = 1 THEN 'ENABLE'
                WHEN c.status = 0 THEN 'DISABLE'
                ELSE 'UNKNOWN'
            END,
            SIZE(c.articles),
            c.createdAt,
            c.updatedAt
        )
        FROM KnowledgeCategory c
        WHERE c.status = 1
        ORDER BY c.sortOrder ASC, c.createdAt DESC
        """)
    List<CategoryResponseDTO> findAllCategoryDTOs();

    @Query("SELECT kc FROM KnowledgeCategory kc WHERE kc.status = 1 ORDER BY kc.sortOrder ASC")
    List<KnowledgeCategory> findAllEnabled();

    Page<KnowledgeCategory> findAll(Specification<KnowledgeCategory> spec, Pageable pageable);
}
