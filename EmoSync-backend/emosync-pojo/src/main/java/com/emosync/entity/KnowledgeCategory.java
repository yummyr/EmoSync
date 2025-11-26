package com.emosync.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "knowledge_category")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KnowledgeCategory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(name = "category_name")
    private String categoryName;

    @Column(name = "category_code")
    private String categoryCode;

    private String description;

    @Column(name = "sort_order")
    private Integer sortOrder;

    private Integer status;

    @OneToMany(mappedBy = "category")
    private List<KnowledgeArticle> articles;
}
