package com.emosync.service.serviceImpl;

import com.emosync.DTO.command.CategoryCreateDTO;
import com.emosync.DTO.command.CategoryUpdateDTO;
import com.emosync.DTO.query.CategoryListQueryDTO;
import com.emosync.DTO.response.CategoryResponseDTO;
import com.emosync.Result.PageResult;
import com.emosync.service.KnowledgeCategoryService;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class KnowledgeCategoryServiceImpl implements KnowledgeCategoryService {
    @Override
    public CategoryResponseDTO createCategory(CategoryCreateDTO createDTO) {
        return null;
    }

    @Override
    public CategoryResponseDTO updateCategory(Long categoryId, CategoryUpdateDTO updateDTO) {
        return null;
    }

    @Override
    public void deleteCategory(Long categoryId) {

    }

    @Override
    public PageResult<CategoryResponseDTO> getCategoryPage(CategoryListQueryDTO queryDTO) {
        return null;
    }

    @Override
    public List<CategoryResponseDTO> getCategoryTree() {
        return null;
    }

    @Override
    public CategoryResponseDTO getCategoryById(Long id) {
        return null;
    }
}
