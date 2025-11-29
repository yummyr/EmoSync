package com.emosync.util;


import jakarta.servlet.http.HttpServletRequest;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import com.emosync.config.JwtConfig;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * JWT Utility Class - Unified JWT Token Management
 *
 * Core Features:
 * 1. Generate JWT token (using userId, username, roleType as identifiers)
 * 2. Verify JWT token validity and integrity
 * 3. Parse user information from token
 * 4. Extract token from HTTP request
 *
 * Design Principles:
 * - Unified user information retrieval from token, avoiding dependency on request attributes
 * - Simplified token extraction logic, supporting multiple header methods
 * - Comprehensive exception handling and security validation
 * - Use secret key from configuration file for improved security
 *
 * @author Yuan
 * @date 2025-11-24
 */
@Slf4j
@Component
@AllArgsConstructor
public class JwtTokenUtils {

    private final JwtConfig jwtConfig ;


    /**
     * Token issuer - Constant
     */
    private static final String ISSUER = "EmoSync-mental-health-assistant";


    /**
     * Authorization Header name
     */
    private static final String HEADER_NAME = "Authorization";

    /**
     * Token prefix
     */
    private static final String TOKEN_PREFIX = "Bearer ";


    /**
     * Generate secret key
     *
     * @param secretKey Secret key string
     * @return SecretKey
     */
    private static SecretKey getSecretKey(String secretKey) {
        byte[] decodedKey = java.util.Base64.getDecoder().decode(secretKey);
        return Keys.hmacShaKeyFor(decodedKey);
    }


    /**
     * generate JWT token
     *
     * @param userId   payload-userId
     * @param username payload-username
     * @param roleType payload-roleTpye
     * @return JWT token
     * @throws RuntimeException throw when fail to generate
     */
    public  String generateToken(Long userId, String username, Integer roleType) {
        try {

            // 创建claims
            Map<String, Object> claims = new HashMap<>();
            claims.put("userId", userId);
            claims.put("username", username);
            claims.put("roleType", roleType);
            claims.put("iss", ISSUER);

            long nowMillis = System.currentTimeMillis();
            Date now = new Date(nowMillis);
            SecretKey key = getSecretKey(jwtConfig.getSecret());

            String token = Jwts.builder()
                    .setClaims(claims)
                    .setIssuedAt(now)
                    .setExpiration(new Date(nowMillis + jwtConfig.getExpiration()))
                    .signWith(key, SignatureAlgorithm.HS256)
                    .compact();

            log.debug("JWT token generated successfully, User ID: {}, Username: {}, Role: {}", userId, username, roleType);
            return token;
        } catch (Exception e) {
            log.error("Failed to generate JWT token, User ID: {}, Username: {}, Role: {}", userId, username, roleType, e);
            throw new RuntimeException("Failed to generate JWT token", e);
        }
    }

    /**
     * verify JWT token
     *
     * @param token JWT token
     * @return decoded Claims
     * @throws RuntimeException if fail to verify token
     */
    public Claims verifyToken(String token) {
        if (!StringUtils.hasText(token)) {
            throw new RuntimeException("Token cannot be empty");
        }
        try {
            SecretKey key = getSecretKey(jwtConfig.getSecret());
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            log.error("Token verification failed: {}", e.getMessage());
            throw new RuntimeException("Token verification failed", e);
        }
    }

    /**
     * Get user ID from token
     *
     * @param token JWT token
     * @return User ID, returns null if parsing fails
     */
    public Long getUserIdFromToken(String token) {
        try {
            Claims claims = verifyToken(token);
            Object userId = claims.get("userId");
            if (userId instanceof Integer) {
                return ((Integer) userId).longValue();
            } else if (userId instanceof Long) {
                return (Long) userId;
            } else {
                log.warn("User ID type mismatch: {}", userId.getClass().getSimpleName());
                return null;
            }
        } catch (Exception e) {
            log.warn("Failed to get user ID from token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Get username from token
     *
     * @param token JWT token
     * @return Username, returns null if parsing fails
     */

    public String getUsernameFromToken(String token) {
        try {
            Claims claims = verifyToken(token);
            return claims.get("username", String.class);
        } catch (Exception e) {
            log.warn("Failed to get username from token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Get role code from token
     *
     * @param token JWT token
     * @return Role code, returns null if parsing fails
     */
    public Integer getRoleTypeFromToken(String token) {
        try {
            Claims claims = verifyToken(token);
            Integer roleType = claims.get("roleType", Integer.class);

            log.warn("Role not found or unrecognized in token");
            return roleType;
        } catch (Exception e) {
            log.warn("Failed to get role code from token: {}", e.getMessage());
            return null;
        }
    }


    /**
     * Check if token is expired
     *
     * @param token JWT token
     * @return Whether the token is expired
     */
    public boolean isTokenExpired(String token) {
        try {
            Claims claims = verifyToken(token);
            return claims.getExpiration().before(new Date());
        } catch (Exception e) {
            log.warn("Failed to check token expiration status: {}", e.getMessage());
            return true; // Consider expired if parsing fails
        }
    }

    /**
     * Extract JWT token from request (supports multiple methods)
     *
     * @param request HTTP request
     * @return Token string, returns null if not found or format incorrect
     */
    public  String extractTokenFromRequest(HttpServletRequest request) {
        // 1. 标准 Authorization: Bearer xxx
        String header = request.getHeader(jwtConfig.getHeader());
        if (StringUtils.hasText(header) && header.startsWith(jwtConfig.getTokenPrefix())) {
            return header.substring(jwtConfig.getTokenPrefix().length());
        }

        // 2. 备用 token 头（兼容旧前端）
        String tokenHeader = request.getHeader("token");
        if (StringUtils.hasText(tokenHeader)) {
            return tokenHeader;
        }

        return null;
    }


    /**
     * Refresh token (generate new token)
     *
     * @param oldToken Old token
     * @return New token, returns null if failed
     */
    public String refreshToken(String oldToken) {
        try {
            Long userId = getUserIdFromToken(oldToken);
            String username = getUsernameFromToken(oldToken);
            Integer roleType = getRoleTypeFromToken(oldToken);

            if (userId != null && username != null && roleType != null) {
                return generateToken(userId, username, roleType);
            }
            log.warn("Token refresh failed: Unable to parse complete user information from old token");
        } catch (Exception e) {
            log.error("Token refresh failed", e);
        }
        return null;
    }



    /**
     * Validate token integrity and extract user info.
     *
     * @param token JWT token
     * @return TokenValidationResult or null if invalid
     */
    public TokenValidationResult validateToken(String token) {
        try {
            Claims c = verifyToken(token);

            return new TokenValidationResult(
                    c.get("userId", Long.class),
                    c.get("username", String.class),
                    c.get("roleType", Integer.class),
                    true
            );
        } catch (Exception e) {
            return new TokenValidationResult(null, null, null, false);
        }
    }


    /**
     * Token validation result wrapper class
     */
    @Getter
    public static class TokenValidationResult {
        private final Long userId;
        private final String username;
        private final Integer roleType;
        private final boolean valid;

        public TokenValidationResult(Long userId, String username, Integer roleType, boolean valid) {
            this.userId = userId;
            this.username = username;
            this.roleType = roleType;
            this.valid = valid;
        }

    }
}