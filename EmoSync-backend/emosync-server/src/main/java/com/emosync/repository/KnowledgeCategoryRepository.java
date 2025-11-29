package com.emosync.repository;

import com.emosync.entity.KnowledgeCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeCategoryRepository extends JpaRepository<KnowledgeCategory, Long> {

    List<KnowledgeCategory> findByParentIdOrderBySortOrderAsc(Long parentId);
}
