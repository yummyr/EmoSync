package com.emosync.repository;

import com.emosync.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * UserRepository
 *
 * Provides CRUD operations + custom query helpers for the User entity.
 *
 * - Supports username/email/phone unique checks
 * - Supports user login (findByUsernameOrEmail)
 * - Supports pagination filtering through Specification (JpaSpecificationExecutor)
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    /**
     * Find user by username.
     */
    User findByUsername(String username);

    /**
     * Find user by email.
     */
    Optional<User> findByEmail(String email);

    /**
     * Find user by phone.
     */
    Optional<User> findByPhone(String phone);

    /**
     * Used for login:
     * Login can be performed by username OR email.
     */
    Optional<User> findByUsernameOrEmail(String username, String email);

    /**
     * Check if username already exists.
     */
    boolean existsByUsername(String username);

    /**
     * Check if email already exists.
     */
    boolean existsByEmail(String email);

    /**
     * Check if phone already exists.
     */
    boolean existsByPhone(String phone);

    /**
     * 统计在指定时间范围内创建的用户数量
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :start AND u.createdAt <= :end")
    Long countByCreatedAtBetween(@Param("start")LocalDateTime start, @Param("end")LocalDateTime end);

    /**
     * 查找在指定时间范围内活跃的用户ID（根据createdAt判断）
     * 注意：这个方法返回的是在指定时间范围内创建的用户ID
     * 如果你需要根据用户活动判断活跃用户，需要在业务逻辑中处理
     */
    @Query("SELECT DISTINCT u.id FROM User u WHERE u.createdAt >= :start AND u.createdAt <= :end")
    List<Long> findActiveUserIdsBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    boolean existsByIdAndUserType(Long id, Integer userType);
}

