package com.emosync.service;

import com.emosync.DTO.command.CategoryCreateDTO;
import com.emosync.DTO.command.CategoryUpdateDTO;
import com.emosync.DTO.query.CategoryListQueryDTO;
import com.emosync.DTO.response.CategoryResponseDTO;
import com.emosync.Result.PageResult;
import com.emosync.entity.KnowledgeCategory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public interface KnowledgeCategoryService {
    CategoryResponseDTO createCategory(CategoryCreateDTO createDTO);
    CategoryResponseDTO updateCategory(Long categoryId, CategoryUpdateDTO updateDTO) ;

     void deleteCategory(Long categoryId);
    PageResult<CategoryResponseDTO> getCategoryPage(CategoryListQueryDTO queryDTO) ;
    List<CategoryResponseDTO> getCategoryTree();

    CategoryResponseDTO getCategoryById(Long id);

    Map<Long,String> getEnabledCategory();

    void updateStatus(Long id);
}
