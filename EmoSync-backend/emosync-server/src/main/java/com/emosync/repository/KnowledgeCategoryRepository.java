package com.emosync.repository;

import com.emosync.entity.KnowledgeCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface KnowledgeCategoryRepository extends JpaRepository<KnowledgeCategory, Long> {

    List<KnowledgeCategory> findByParentIdOrderBySortOrderAsc(Long parentId);
}
