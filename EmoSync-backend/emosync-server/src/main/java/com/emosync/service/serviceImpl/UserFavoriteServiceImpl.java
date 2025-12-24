package com.emosync.service.serviceImpl;

import com.emosync.DTO.query.UserFavoriteQueryDTO;
import com.emosync.DTO.response.ArticleSimpleResponseDTO;
import com.emosync.Result.PageResult;
import com.emosync.entity.KnowledgeArticle;
import com.emosync.entity.KnowledgeCategory;
import com.emosync.entity.User;
import com.emosync.entity.UserFavorite;
import com.emosync.enumClass.ArticleStatus;
import com.emosync.exception.BusinessException;
import com.emosync.exception.ServiceException;
import com.emosync.repository.KnowledgeArticleRepository;
import com.emosync.repository.KnowledgeCategoryRepository;
import com.emosync.repository.UserFavoriteRepository;
import com.emosync.repository.UserRepository;
import com.emosync.security.UserDetailsImpl;
import com.emosync.service.UserFavoriteService;
import com.emosync.service.convert.ArticleConvert;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserFavoriteServiceImpl implements UserFavoriteService {

    private final UserFavoriteRepository userFavoriteRepository;
    private final KnowledgeArticleRepository knowledgeArticleRepository;
    private final KnowledgeCategoryRepository knowledgeCategoryRepository;
    private final UserRepository userRepository;

    /**
     * Get current userId from SecurityContext
     */
    private Long getCurrentUserIdOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        Object p = auth.getPrincipal();
        if (p instanceof UserDetailsImpl u) return u.getId();
        return null;
    }


    @Override
    @Transactional(rollbackFor = Exception.class)
    public void favoriteArticle(Long userId, String articleId) {
        try {
            if (userId == null) throw new BusinessException("User not logged in");
            if (articleId == null || articleId.isBlank()) throw new BusinessException("ArticleId is empty");

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new BusinessException("User does not exist"));

            KnowledgeArticle article = knowledgeArticleRepository.findById(articleId)
                    .orElseThrow(() -> new BusinessException("Article does not exist"));

            //  Only allow favoriting published articles

            if (!Objects.equals(article.getStatus(), ArticleStatus.PUBLISHED.getCode()))
                throw new BusinessException("Can only favorite published articles");

            if (userFavoriteRepository.existsByUser_IdAndKnowledgeArticle_Id(userId, articleId)) {
                throw new BusinessException("Already favorited this article");
            }

            UserFavorite favorite = UserFavorite.builder()
                    .user(user)
                    .knowledgeArticle(article)
                    .createdAt(LocalDateTime.now())
                    .build();

            userFavoriteRepository.save(favorite);
            log.info("User favorited article successfully: userId={}, articleId={}", userId, articleId);

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to favorite article", e);
            throw new ServiceException("Favorite failed, please try again later");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void unfavoriteArticle(Long userId, String articleId) {
        try {
            if (userId == null) throw new BusinessException("User not logged in");
            if (articleId == null || articleId.isBlank()) throw new BusinessException("ArticleId is empty");

            UserFavorite favorite = userFavoriteRepository
                    .findByUser_IdAndKnowledgeArticle_Id(userId, articleId)
                    .orElseThrow(() -> new BusinessException("Article not favorited"));

            userFavoriteRepository.delete(favorite);
            log.info("User unfavorited article successfully: userId={}, articleId={}", userId, articleId);

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to unfavorite article", e);
            throw new ServiceException("Unfavorite failed, please try again later");
        }
    }

    @Override
    public boolean isFavorited(Long userId, String articleId) {
        if (userId == null || articleId == null || articleId.isBlank()) return false;
        return userFavoriteRepository.existsByUser_IdAndKnowledgeArticle_Id(userId, articleId);
    }

    // Page Query (Specification + Join + Pageable)
    @Override
    public PageResult<ArticleSimpleResponseDTO> getUserFavoritePage(UserFavoriteQueryDTO queryDTO) {
        try {
            if (queryDTO.getUserId() == null) {
                throw new BusinessException("UserId is required");
            }

            // ---- Sort ----
            Sort.Direction dir = "asc".equalsIgnoreCase(queryDTO.getSortDirection())
                    ? Sort.Direction.ASC
                    : Sort.Direction.DESC;

            Sort sort;
            if ("title".equalsIgnoreCase(queryDTO.getSortField())) {
                sort = Sort.by(dir, "knowledgeArticle.title");
            } else {
                sort = Sort.by(dir, "createdAt");
            }

            int pageIndex = Math.max(0, (int) (queryDTO.getCurrentPage() - 1));
            int pageSize = Math.max(1, queryDTO.getSize().intValue());

            Pageable pageable = PageRequest.of(pageIndex, pageSize, sort);

            Specification<UserFavorite> spec = (root, query, cb) -> {
                List<Predicate> predicates = new ArrayList<>();

                // join user & article
                Join<UserFavorite, User> userJoin = root.join("user", JoinType.INNER);
                Join<UserFavorite, KnowledgeArticle> articleJoin = root.join("knowledgeArticle", JoinType.INNER);

                // userId filter
                predicates.add(cb.equal(userJoin.get("id"), queryDTO.getUserId()));

                // title like
                if (queryDTO.getTitle() != null && !queryDTO.getTitle().trim().isEmpty()) {
                    String kw = "%" + queryDTO.getTitle().trim().toLowerCase() + "%";
                    predicates.add(cb.like(cb.lower(articleJoin.get("title")), kw));
                }

                // category filter
                if (queryDTO.getCategoryId() != null) {

                    //  KnowledgeArticle has category relationship (ManyToOne KnowledgeCategory category)
                    Join<KnowledgeArticle, KnowledgeCategory> categoryJoin = articleJoin.join("category", JoinType.INNER);
                    predicates.add(cb.equal(categoryJoin.get("id"), queryDTO.getCategoryId()));
                }


                return cb.and(predicates.toArray(new Predicate[0]));
            };

            Page<UserFavorite> favoritePage = userFavoriteRepository.findAll(spec, pageable);

            List<UserFavorite> favorites = favoritePage.getContent();
            if (favorites.isEmpty()) {
                return new PageResult<>(favoritePage, List.of());
            }

            List<KnowledgeArticle> articles = favorites.stream()
                    .map(UserFavorite::getKnowledgeArticle)
                    .filter(Objects::nonNull)
                    .toList();

            List<ArticleSimpleResponseDTO> dtoList = buildFavoriteArticleResponseList(
                    articles, favorites, queryDTO.getSortField(), queryDTO.getSortDirection()
            );

            return new PageResult<>(favoritePage, dtoList);

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to query user favorite article list", e);
            throw new ServiceException("Failed to query favorite list, please try again later");
        }
    }

    @Override
    public Long getUserFavoriteCount(Long userId) {
        if (userId == null) return 0L;
        return userFavoriteRepository.countByUser_Id(userId);
    }

    @Override
    public Map<String, Integer> getArticleFavoriteCountMap(List<String> articleIds) {
        if (articleIds == null || articleIds.isEmpty()) return Map.of();

        List<Object[]> rows = userFavoriteRepository.countFavoritesGroupedByArticleIds(articleIds);
        Map<String, Integer> map = new HashMap<>();
        for (Object[] r : rows) {
            String articleId = (String) r[0];
            Long cnt = (Long) r[1];
            map.put(articleId, cnt == null ? 0 : cnt.intValue());
        }
        return map;
    }


    @Override
    public List<ArticleSimpleResponseDTO> buildFavoriteArticleResponseList(
            List<KnowledgeArticle> articles,
            List<UserFavorite> favorites,
            String sortField,
            String sortDirection
    ) {
        if (articles == null || articles.isEmpty()) return List.of();

        // favoriteTimeMap: articleId -> createdAt
        Map<String, LocalDateTime> favoriteTimeMap = favorites.stream()
                .filter(f -> f.getKnowledgeArticle() != null && f.getKnowledgeArticle().getId() != null)
                .collect(Collectors.toMap(
                        f -> f.getKnowledgeArticle().getId(),
                        UserFavorite::getCreatedAt,
                        (a, b) -> a // Take the first one when duplicates occur (theoretically won't happen)
                ));


        List<Long> categoryIds = articles.stream()
                .map(a -> a.getCategory() == null ? null : a.getCategory().getId())
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        Map<Long, String> categoryMap = categoryIds.isEmpty()
                ? Map.of()
                : knowledgeCategoryRepository.findAllById(categoryIds).stream()
                .collect(Collectors.toMap(KnowledgeCategory::getId, KnowledgeCategory::getCategoryName));


        List<Long> authorIds = articles.stream()
                .map(a -> a.getAuthor() == null ? null : a.getAuthor().getId())
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        Map<Long, String> authorMap = authorIds.isEmpty()
                ? Map.of()
                : userRepository.findAllById(authorIds).stream()
                .collect(Collectors.toMap(User::getId, User::getUsername));


        List<ArticleSimpleResponseDTO> list = articles.stream()
                .map(article -> {
                    Long catId = article.getCategory() == null ? null : article.getCategory().getId();
                    Long authorId = article.getAuthor() == null ? null : article.getAuthor().getId();

                    return ArticleConvert.entityToSimpleResponseWithFavoriteTime(
                            article,
                            categoryMap.getOrDefault(catId, "Unknown category"),
                            authorMap.getOrDefault(authorId, "Unknown author"),
                            true,
                            favoriteTimeMap.get(article.getId())
                    );
                })
                .collect(Collectors.toList());


        Sort.Direction dir = "asc".equalsIgnoreCase(sortDirection) ? Sort.Direction.ASC : Sort.Direction.DESC;

        if ("title".equalsIgnoreCase(sortField)) {
            list.sort((a, b) -> {
                String t1 = a.getTitle() == null ? "" : a.getTitle();
                String t2 = b.getTitle() == null ? "" : b.getTitle();
                return dir.isAscending() ? t1.compareTo(t2) : t2.compareTo(t1);
            });
        } else {
            list.sort((a, b) -> {
                LocalDateTime t1 = favoriteTimeMap.get(a.getId());
                LocalDateTime t2 = favoriteTimeMap.get(b.getId());
                if (t1 == null && t2 == null) return 0;
                if (t1 == null) return dir.isAscending() ? -1 : 1;
                if (t2 == null) return dir.isAscending() ? 1 : -1;
                return dir.isAscending() ? t1.compareTo(t2) : t2.compareTo(t1);
            });
        }

        return list;
    }
}
