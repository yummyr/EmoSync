package com.emosync.DTO.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 知识分类响应DTO
 * @author system
 */
@Data
@Builder
@Schema(description = "知识分类响应")
public class CategoryResponseDTO {

    @Schema(description = "分类ID")
    private Long id;

    @Schema(description = "分类名称")
    private String categoryName;

    @Schema(description = "分类描述")
    private String description;

    @Schema(description = "排序号")
    private Integer sortOrder;

    @Schema(description = "状态")
    private Integer status;

    @Schema(description = "状态描述")
    private String statusText;

    @Schema(description = "文章数量")
    private Integer articleCount;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;
    // 用于JPQL查询的构造函数
    public CategoryResponseDTO(Long id, String categoryName, String description,
                               Integer sortOrder, Integer status, String statusText,
                               Integer articleCount, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.categoryName = categoryName;
        this.description = description;
        this.sortOrder = sortOrder;
        this.status = status;
        this.statusText = statusText;
        this.articleCount = articleCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}