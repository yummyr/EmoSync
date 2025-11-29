package com.emosync.repository;

import com.emosync.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

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
    Optional<User> findByUsername(String username);

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
}

