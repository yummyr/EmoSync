package com.emosync.service.serviceImpl;

import com.emosync.DTO.command.ArticleCreateDTO;
import com.emosync.DTO.command.ArticleUpdateDTO;
import com.emosync.DTO.query.ArticleListQueryDTO;
import com.emosync.DTO.response.ArticleResponseDTO;
import com.emosync.DTO.response.ArticleSimpleResponseDTO;
import com.emosync.DTO.response.ArticleStatisticsResponseDTO;
import com.emosync.Result.PageResult;
import com.emosync.entity.KnowledgeArticle;
import com.emosync.entity.KnowledgeCategory;
import com.emosync.entity.User;
import com.emosync.entity.UserFavorite;
import com.emosync.enumClass.ArticleStatus;
import com.emosync.enumClass.CategoryStatus;
import com.emosync.exception.BusinessException;
import com.emosync.exception.ServiceException;
import com.emosync.security.UserDetailsImpl;
import com.emosync.service.KnowledgeArticleService;
import com.emosync.service.convert.ArticleConvert;
import com.emosync.repository.KnowledgeArticleRepository;
import com.emosync.repository.KnowledgeCategoryRepository;
import com.emosync.repository.UserFavoriteRepository;
import com.emosync.repository.UserRepository;
import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class KnowledgeArticleServiceImpl implements KnowledgeArticleService {

    private final KnowledgeArticleRepository articleRepository;
    private final KnowledgeCategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final UserFavoriteRepository favoriteRepository;

    /** Get current authenticated UserDetailsImpl */
    private UserDetailsImpl getCurrentUserInfo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserDetailsImpl)) {
            return null;
        }
        return (UserDetailsImpl) auth.getPrincipal();
    }

    /** Check if current user has ROLE_2  */
    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;

        for (GrantedAuthority authority : auth.getAuthorities()) {
            if ("ROLE_2".equals(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }

    // ==================== Create ====================

    @Override
    @Transactional
    public ArticleResponseDTO createArticle(ArticleCreateDTO createDTO, Long authorId) {
        try {
            log.info("📝 创建文章请求: authorId={}, id={}, title={}, contentLength={}, summary={}",
                    authorId, createDTO.getId(), createDTO.getTitle(),
                    createDTO.getContent() != null ? createDTO.getContent().length() : 0,
                    createDTO.getSummary());

            if (createDTO.getContent() == null || createDTO.getContent().trim().isEmpty()) {
                log.warn("⚠️ 文章内容为空: {}", createDTO);
                throw new BusinessException("文章内容不能为空");
            }

            // 分类验证
            KnowledgeCategory category = categoryRepository.findById(createDTO.getCategoryId())
                    .orElseThrow(() -> new BusinessException("文章分类不存在"));
            if (Objects.equals(category.getStatus(), CategoryStatus.DISABLED.getCode())) {
                throw new BusinessException("文章分类已禁用");
            }

            // 作者验证
            User author = userRepository.findById(authorId)
                    .orElseThrow(() -> new BusinessException("作者用户不存在"));

            // 创建实体
            KnowledgeArticle article = ArticleConvert.createCommandToEntity(createDTO, authorId);
            if (Objects.equals(createDTO.getStatus(), ArticleStatus.PUBLISHED.getCode())) {
                article.setPublishedAt(LocalDateTime.now());
            }

            log.info("🔄 转换后的文章实体: title={}, contentLength={}",
                    article.getTitle(),
                    article.getContent() != null ? article.getContent().length() : 0);

            articleRepository.save(article);

            KnowledgeArticle saved = articleRepository.findById(article.getId())
                    .orElseThrow(() -> new ServiceException("文章保存失败"));

            log.info("📋 数据库保存结果: id={}, title={}, contentLength={}",
                    saved.getId(), saved.getTitle(),
                    saved.getContent() != null ? saved.getContent().length() : 0);

            log.info("✅ 创建知识文章成功: {}", saved.getTitle());

            return buildArticleResponse(
                    saved,
                    category.getCategoryName(),
                    author.getUsername(),
                    false
            );
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("创建知识文章失败", e);
            throw new ServiceException("创建文章失败，请稍后重试");
        }
    }

    // ==================== Delete ====================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteArticle(String articleId, Long currentUserId) {
        try {
            KnowledgeArticle article = articleRepository.findById(articleId)
                    .orElseThrow(() -> new BusinessException("文章不存在"));

            User currentUser = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new BusinessException("用户不存在"));

            if (!article.getAuthor().getId().equals(currentUserId) && currentUser.getUserType()!=2) {
                throw new BusinessException("无权限删除此文章");
            }

            deleteRelatedFavorites(articleId);
            articleRepository.deleteById(articleId);
            log.info("删除知识文章成功: {}", article.getTitle());
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("删除知识文章失败", e);
            throw new ServiceException("删除文章失败，请稍后重试");
        }
    }

    // ==================== Get by ID ====================

    @Override
    public ArticleResponseDTO getArticleById(String articleId, Long currentUserId) {
        KnowledgeArticle article = articleRepository.findById(articleId)
                .orElseThrow(() -> new BusinessException("文章不存在"));

        if (currentUserId != null) {
            User currentUser = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new BusinessException("用户不存在"));
            if (article.getStatus() !=1
                    && !article.getAuthor().getId().equals(currentUserId)
                    && currentUser.getUserType() !=2) {
                throw new BusinessException("文章不存在");
            }
        } else if (article.getStatus() !=1) {
            throw new BusinessException("文章不存在");
        }

        KnowledgeCategory category = categoryRepository.findById(article.getCategory().getId()).orElse(null);
        User author = userRepository.findById(article.getAuthor().getId()).orElse(null);

        boolean isFavorited = false;
        if (currentUserId != null) {
            isFavorited = checkUserFavorite(currentUserId, articleId);
        }

        return buildArticleResponse(
                article,
                category != null ? category.getCategoryName() : "未知分类",
                author != null ? author.getUsername() : "未知作者",
                isFavorited
        );
    }

    // ==================== Read (increase read_count) ====================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ArticleResponseDTO readArticle(String articleId, Long currentUserId) {
        try {
            ArticleResponseDTO dto = getArticleById(articleId, currentUserId);

            KnowledgeArticle article = articleRepository.findById(articleId)
                    .orElseThrow(() -> new BusinessException("文章不存在"));

            Integer old = article.getReadCount() == null ? 0 : article.getReadCount();
            article.setReadCount(old + 1);
            articleRepository.save(article);

            dto.setReadCount(old + 1);
            return dto;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("阅读文章失败", e);
            throw new ServiceException("阅读文章失败，请稍后重试");
        }
    }

    // ==================== Page Query (JPA Pageable) ====================

    @Override
    public PageResult<ArticleSimpleResponseDTO> getArticlePage(ArticleListQueryDTO queryDTO, Long currentUserId) {
        try {
            // 排序
            Sort sort;
            String sortField = queryDTO.getSortField();
            String sortDirection = queryDTO.getSortDirection();
            Sort.Direction dir = "asc".equalsIgnoreCase(sortDirection) ? Sort.Direction.ASC : Sort.Direction.DESC;

            if ("readCount".equals(sortField)) {
                sort = Sort.by(dir, "readCount");
            } else if ("createdAt".equals(sortField)) {
                sort = Sort.by(dir, "createdAt");
            } else {
                sort = Sort.by(dir, "publishedAt");
            }

            Pageable pageable = PageRequest.of(
                    (int) (queryDTO.getCurrentPage() - 1),
                    queryDTO.getSize().intValue(),
                    sort
            );

            // 动态条件 (Specification)
            Specification<KnowledgeArticle> spec = (root, query, cb) -> {
                List<Predicate> predicates = new ArrayList<>();

                // 权限：非管理员限制
                if (currentUserId == null) {
                    predicates.add(cb.equal(root.get("status"), ArticleStatus.PUBLISHED.getCode()));
                } else {
                    User currentUser = userRepository.findById(currentUserId).orElse(null);
                    if (currentUser != null && currentUser.getUserType()!=2) {
                        Predicate published = cb.equal(root.get("status"), ArticleStatus.PUBLISHED.getCode());
                        Predicate own = cb.equal(root.get("authorId"), currentUserId);
                        predicates.add(cb.or(published, own));
                    }
                }

                if (queryDTO.getCategoryId() != null) {
                    predicates.add(cb.equal(root.get("categoryId"), queryDTO.getCategoryId()));
                }

                if (StringUtils.hasText(queryDTO.getKeyword())) {
                    String kw = "%" + queryDTO.getKeyword().trim() + "%";
                    Predicate p1 = cb.like(root.get("title"), kw);
                    Predicate p2 = cb.like(root.get("content"), kw);
                    Predicate p3 = cb.like(root.get("tags"), kw);
                    predicates.add(cb.or(p1, p2, p3));
                }

                if (StringUtils.hasText(queryDTO.getTitle())) {
                    predicates.add(cb.like(root.get("title"), "%" + queryDTO.getTitle().trim() + "%"));
                }
                if (StringUtils.hasText(queryDTO.getTags())) {
                    predicates.add(cb.like(root.get("tags"), "%" + queryDTO.getTags().trim() + "%"));
                }
                if (queryDTO.getAuthorId() != null) {
                    predicates.add(cb.equal(root.get("authorId"), queryDTO.getAuthorId()));
                }
                if (queryDTO.getStatus() != null) {
                    predicates.add(cb.equal(root.get("status"), queryDTO.getStatus()));
                }

                // 日期范围（基于 publishedAt）
                DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                if (StringUtils.hasText(queryDTO.getStartDate())) {
                    LocalDateTime start = LocalDateTime.parse(queryDTO.getStartDate() + " 00:00:00", dtf);
                    predicates.add(cb.greaterThanOrEqualTo(root.get("publishedAt"), start));
                }
                if (StringUtils.hasText(queryDTO.getEndDate())) {
                    LocalDateTime end = LocalDateTime.parse(queryDTO.getEndDate() + " 23:59:59", dtf);
                    predicates.add(cb.lessThanOrEqualTo(root.get("publishedAt"), end));
                }

                return cb.and(predicates.toArray(new Predicate[0]));
            };

            Page<KnowledgeArticle> articlePage = articleRepository.findAll(spec, pageable);

            List<ArticleSimpleResponseDTO> list =
                    buildArticleSimpleResponseList(articlePage.getContent(), currentUserId);

            PageResult<ArticleSimpleResponseDTO> result = new PageResult<>();
            result.setRecords(list);
            result.setTotal(articlePage.getTotalElements());
            return result;

        } catch (Exception e) {
            log.error("查询知识文章列表失败", e);
            throw new ServiceException("查询文章列表失败，请稍后重试");
        }
    }

    // ==================== Publish / Offline ====================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ArticleResponseDTO publishArticle(String articleId, Long currentUserId) {
        try {
            KnowledgeArticle article = articleRepository.findById(articleId)
                    .orElseThrow(() -> new BusinessException("文章不存在"));

            User currentUser = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new BusinessException("用户不存在"));

            if (!article.getAuthor().getId().equals(currentUserId) && currentUser.getUserType()!=2) {
                throw new BusinessException("无权限发布此文章");
            }

            if (!ArticleStatus.fromCode(article.getStatus()).canPublish()) {
                throw new BusinessException("当前状态不允许发布");
            }

            KnowledgeArticle published = ArticleConvert.publishArticle(article);
            article.setStatus(published.getStatus());
            article.setPublishedAt(published.getPublishedAt());
            article.setUpdatedAt(published.getUpdatedAt());
            articleRepository.save(article);

            log.info("发布知识文章成功: {}", article.getTitle());
            return getArticleById(articleId, currentUserId);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("发布知识文章失败", e);
            throw new ServiceException("发布文章失败，请稍后重试");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ArticleResponseDTO offlineArticle(String articleId, Long currentUserId) {
        try {
            KnowledgeArticle article = articleRepository.findById(articleId)
                    .orElseThrow(() -> new BusinessException("文章不存在"));

            User currentUser = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new BusinessException("用户不存在"));

            if (!article.getAuthor().getId().equals(currentUserId) && currentUser.getUserType()!=2) {
                throw new BusinessException("无权限下线此文章");
            }

            if (!ArticleStatus.fromCode(article.getStatus()).canOffline()) {
                throw new BusinessException("当前状态不允许下线");
            }

            KnowledgeArticle offlined = ArticleConvert.offlineArticle(article);
            article.setStatus(offlined.getStatus());
            article.setUpdatedAt(offlined.getUpdatedAt());
            articleRepository.save(article);

            log.info("下线知识文章成功: {}", article.getTitle());
            return getArticleById(articleId, currentUserId);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("下线知识文章失败", e);
            throw new ServiceException("下线文章失败，请稍后重试");
        }
    }

    // ==================== Update / Update Status ====================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ArticleResponseDTO updateArticle(String articleId, ArticleUpdateDTO updateDTO, Long currentUserId) {
        try {
            KnowledgeArticle existing = articleRepository.findById(articleId)
                    .orElseThrow(() -> new BusinessException("文章不存在"));

            User currentUser = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new BusinessException("用户不存在"));
            if (!existing.getAuthor().getId().equals(currentUserId) && currentUser.getUserType()!=2) {
                throw new BusinessException("无权限编辑此文章");
            }

            if (updateDTO.getCategoryId() != null) {
                KnowledgeCategory category = categoryRepository.findById(updateDTO.getCategoryId())
                        .orElseThrow(() -> new BusinessException("文章分类不存在"));
                if (Objects.equals(category.getStatus(),CategoryStatus.DISABLED.getCode())) {
                    throw new BusinessException("文章分类已禁用");
                }
                existing.setCategory(category);
            }

            KnowledgeArticle updateArticle = ArticleConvert.updateCommandToEntity(updateDTO);

            if (StringUtils.hasText(updateArticle.getTitle())) {
                existing.setTitle(updateArticle.getTitle());
            }
            if (StringUtils.hasText(updateArticle.getSummary())) {
                existing.setSummary(updateArticle.getSummary());
            }
            if (StringUtils.hasText(updateArticle.getContent())) {
                existing.setContent(updateArticle.getContent());
            }
            if (StringUtils.hasText(updateArticle.getCoverImage())) {
                existing.setCoverImage(updateArticle.getCoverImage());
            }
            if (StringUtils.hasText(updateArticle.getTags())) {
                existing.setTags(updateArticle.getTags());
            }
            if (updateArticle.getStatus() != null) {
                existing.setStatus(updateArticle.getStatus());
                if (updateArticle.getStatus().equals(ArticleStatus.PUBLISHED.getCode())
                        && existing.getPublishedAt() == null) {
                    existing.setPublishedAt(LocalDateTime.now());
                }
            }

            existing.setUpdatedAt(LocalDateTime.now());
            articleRepository.save(existing);

            log.info("更新知识文章成功: {}", existing.getTitle());
            return getArticleById(articleId, currentUserId);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("更新知识文章失败", e);
            throw new ServiceException("更新文章失败，请稍后重试");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ArticleResponseDTO updateArticleStatus(String articleId, Integer status, Long currentUserId) {
        try {
            KnowledgeArticle article = articleRepository.findById(articleId)
                    .orElseThrow(() -> new BusinessException("文章不存在"));

            User currentUser = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new BusinessException("用户不存在"));

            if (!article.getAuthor().getId().equals(currentUserId) && currentUser.getUserType()!=2) {
                throw new BusinessException("无权限更新此文章状态");
            }

            ArticleStatus targetStatus = ArticleStatus.fromCode(status);
            if (targetStatus == null) {
                throw new BusinessException("无效的文章状态");
            }

            article.setStatus(status);
            article.setUpdatedAt(LocalDateTime.now());

            if (status.equals(ArticleStatus.PUBLISHED.getCode()) && article.getPublishedAt() == null) {
                article.setPublishedAt(LocalDateTime.now());
            }

            articleRepository.save(article);
            log.info("更新文章状态成功: articleId={}, status={}", articleId, status);

            return getArticleById(articleId, currentUserId);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("更新文章状态失败", e);
            throw new ServiceException("更新文章状态失败，请稍后重试");
        }
    }

    // ==================== Batch Delete ====================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchDeleteArticles(List<String> ids, Long currentUserId) {
        try {
            if (ids == null || ids.isEmpty()) {
                throw new BusinessException("删除的文章ID列表不能为空");
            }

            User currentUser = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new BusinessException("用户不存在"));

            int deletedCount = 0;
            for (String articleId : ids) {
                try {
                    KnowledgeArticle article = articleRepository.findById(articleId).orElse(null);
                    if (article == null) {
                        log.warn("文章不存在，跳过删除: articleId={}", articleId);
                        continue;
                    }

                    if (!article.getAuthor().getId().equals(currentUserId) && currentUser.getUserType()!=2) {
                        log.warn("无权限删除文章，跳过: articleId={}, userId={}", articleId, currentUserId);
                        continue;
                    }

                    deleteRelatedFavorites(articleId);
                    articleRepository.deleteById(articleId);
                    deletedCount++;
                    log.info("删除文章成功: articleId={}", articleId);
                } catch (Exception ex) {
                    log.error("删除文章失败: articleId={}", articleId, ex);
                }
            }

            if (deletedCount == 0) {
                throw new BusinessException("没有成功删除任何文章");
            }

            log.info("批量删除文章完成: 总数={}, 成功删除={}", ids.size(), deletedCount);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("批量删除文章失败", e);
            throw new ServiceException("批量删除文章失败，请稍后重试");
        }
    }

    // ==================== Statistics ====================

    @Override
    public ArticleStatisticsResponseDTO getArticleStatistics(Long currentUserId) {
        try {
            User currentUser = userRepository.findById(currentUserId).orElse(null);
            if (currentUser == null || currentUser.getUserType()!=2) {
                throw new BusinessException("无权限查看统计信息");
            }

            long totalArticles = articleRepository.count();
            long publishedArticles = articleRepository.countByStatus(ArticleStatus.PUBLISHED.getCode());
            long draftArticles = articleRepository.countByStatus(ArticleStatus.DRAFT.getCode());
            long offlineArticles = articleRepository.countByStatus(ArticleStatus.OFFLINE.getCode());

            List<KnowledgeArticle> all = articleRepository.findAll();
            long totalViews = all.stream()
                    .mapToLong(a -> a.getReadCount() == null ? 0L : a.getReadCount())
                    .sum();

            long totalFavorites = favoriteRepository.count();

            return ArticleStatisticsResponseDTO.builder()
                    .totalArticles(totalArticles)
                    .publishedArticles(publishedArticles)
                    .draftArticles(draftArticles)
                    .offlineArticles(offlineArticles)
                    .totalViews(totalViews)
                    .totalFavorites(totalFavorites)
                    .build();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("获取文章统计信息失败", e);
            throw new ServiceException("获取统计信息失败，请稍后重试");
        }
    }

    // ==================== Helper Methods ====================

    private ArticleResponseDTO buildArticleResponse(KnowledgeArticle article,
                                                    String categoryName,
                                                    String authorName,
                                                    Boolean isFavorited) {
        return ArticleConvert.entityToResponse(article, categoryName, authorName, isFavorited);
    }

    private List<ArticleSimpleResponseDTO> buildArticleSimpleResponseList(
            List<KnowledgeArticle> articles,
            Long currentUserId
    ) {
        if (articles.isEmpty()) {
            return List.of();
        }

        List<Long> categoryIds = articles.stream()
                .map(a -> a.getCategory() != null ? a.getCategory().getId() : null)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        List<Long> authorIds = articles.stream()
                .map(a -> a.getAuthor() != null ? a.getAuthor().getId() : null)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        Map<Long, String> categoryMap = categoryRepository.findAllById(categoryIds)
                .stream()
                .collect(Collectors.toMap(KnowledgeCategory::getId, KnowledgeCategory::getCategoryName));

        Map<Long, String> authorMap = userRepository.findAllById(authorIds)
                .stream()
                .collect(Collectors.toMap(User::getId, User::getUsername));


        Map<String, Boolean> favoriteMap = Map.of();
        List<String> articleIds = articles.stream()
                .map(KnowledgeArticle::getId)
                .toList();

        if (currentUserId != null) {
            favoriteMap = getUserFavoriteMap(currentUserId, articleIds);
        }

        Map<String, Integer> favoriteCountMap = getArticleFavoriteCountMap(articleIds);

        Map<String, Boolean> finalFavoriteMap = favoriteMap;

        return articles.stream().map(article -> {
            Long categoryId = article.getCategory() != null ? article.getCategory().getId() : null;
            Long authorId = article.getAuthor() != null ? article.getAuthor().getId() : null;

            return ArticleConvert.entityToSimpleResponseWithFavoriteCount(
                    article,
                    categoryMap.getOrDefault(categoryId, "Unknown Category"),
                    authorMap.getOrDefault(authorId, "Unknown Author"),
                    finalFavoriteMap.getOrDefault(article.getId(), false),
                    favoriteCountMap.getOrDefault(article.getId(), 0)
            );
        }).toList();
    }


    private boolean checkUserFavorite(Long userId, String articleId) {
        return favoriteRepository.existsByUser_IdAndKnowledgeArticle_Id(userId, articleId);
    }

    private Map<String, Boolean> getUserFavoriteMap(Long userId, List<String> articleIds) {
        List<UserFavorite> favorites =
                favoriteRepository.findByUserIdAndKnowledgeArticle_IdIn(userId, articleIds);

        return favorites.stream()
                .collect(Collectors.toMap(
                        f -> f.getKnowledgeArticle().getId(),
                        f -> true,
                        (a, b) -> a
                ));
    }


    private void deleteRelatedFavorites(String articleId) {
        favoriteRepository.deleteByKnowledgeArticle_Id(articleId);
    }

    private Map<String, Integer> getArticleFavoriteCountMap(List<String> articleIds) {
        if (articleIds.isEmpty()) return Map.of();

        List<Object[]> rows = favoriteRepository.countByArticleIdsGrouped(articleIds);

        Map<String, Integer> map = new HashMap<>();
        for (Object[] row : rows) {
            String articleId = (String) row[0];
            Long count = (Long) row[1];
            map.put(articleId, count.intValue());
        }
        return map;
    }

}
