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
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

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

    private  final JwtConfig jwtConfig;


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
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
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
            String roleName;
            if (roleType== 1){
                roleName = "regularUser";
            }else if (roleType ==2){
                roleName = "admin";
            }else {
                throw new IllegalArgumentException("role type is illegal");
            }
            // 创建claims
            Map<String, Object> claims = new HashMap<>();
            claims.put("userId", userId);
            claims.put("username", username);
            claims.put("roles", Collections.singletonList("ROLE_" + roleName));
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
            Object roleType = claims.get("roleType");
            if (roleType instanceof Integer) {
                return (Integer) roleType;
            } else if (roleType instanceof String) {
                return Integer.valueOf((String) roleType);
            } else {
                log.warn("Role type format mismatch: {}", roleType.getClass().getSimpleName());
                return null;
            }
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
    public static String extractTokenFromRequest(HttpServletRequest request) {
        if (request == null) {
            return null;
        }

        // Method 1: Extract from Authorization Header (standard method)
        String authHeader = request.getHeader(HEADER_NAME);
        if (StringUtils.hasText(authHeader) && authHeader.startsWith(TOKEN_PREFIX)) {
            return authHeader.substring(TOKEN_PREFIX.length());
        }

        // Method 2: Extract from token Header (method used by frontend)
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
     * Get current user ID from token
     *
     * @param token JWT token
     * @return User ID, returns null if failed to get
     */
    public Long getCurrentUserId(String token) {
        return getUserIdFromToken(token);
    }

    /**
     * Get current username from token
     *
     * @param token JWT token
     * @return Username, returns null if failed to get
     */
    public String getCurrentUsername(String token) {
        return getUsernameFromToken(token);
    }

    /**
     * Get current user role from token
     *
     * @param token JWT token
     * @return Role code, returns null if failed to get
     */
    public Integer getCurrentUserRole(String token) {
        return getRoleTypeFromToken(token);
    }

    /**
     * Get token from current request context
     *
     * @return JWT token string, returns null if unable to extract or no request context
  */
    // public String getCurrentToken() {
    //     try {
    //         // Get request attributes from current thread context
    //         RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
    //
    //         if (requestAttributes == null) {
    //             log.debug("No request context available - likely outside of web request");
    //             return null;
    //         }
    //
    //         // Ensure we have ServletRequestAttributes for web requests
    //         if (!(requestAttributes instanceof ServletRequestAttributes)) {
    //             log.warn("RequestAttributes is not a ServletRequestAttributes: {}",
    //                     requestAttributes.getClass().getSimpleName());
    //             return null;
    //         }
    //
    //         ServletRequestAttributes servletAttributes = (ServletRequestAttributes) requestAttributes;
    //         HttpServletRequest request = servletAttributes.getRequest();
    //
    //         if (request == null) {
    //             log.warn("Unable to get HttpServletRequest from ServletRequestAttributes");
    //             return null;
    //         }
    //
    //         // Priority 1: Check if token was set by filter in request attributes
    //         String filterToken = (String) request.getAttribute("jwtToken");
    //         if (StringUtils.hasText(filterToken)) {
    //             log.debug("Found JWT token in request attributes");
    //             return filterToken;
    //         }
    //
    //         // Priority 2: Extract token from request headers
    //         String headerToken = extractTokenFromRequest(request);
    //         if (StringUtils.hasText(headerToken)) {
    //             log.debug("Found JWT token in request headers");
    //             return headerToken;
    //         }
    //
    //         log.debug("No JWT token found in current request");
    //         return null;
    //
    //     } catch (IllegalStateException e) {
    //         // This happens when no request is bound to current thread
    //         log.debug("No request bound to current thread: {}", e.getMessage());
    //         return null;
    //     } catch (ClassCastException e) {
    //         log.warn("Type casting error while getting request attributes: {}", e.getMessage());
    //         return null;
    //     } catch (Exception e) {
    //         log.warn("Unexpected error while extracting token from request: {}", e.getMessage(), e);
    //         return null;
    //     }
    // }


    /**
     * Get current user ID (from current request context)
     *
     * @return Current user ID, returns null if failed to get
     */
    // public Long getCurrentUserId() {
    //     String token = getCurrentToken();
    //     return token != null ? getUserIdFromToken(token) : null;
    // }

    /**
     * Get current username (from current request context)
     *
     * @return Current username, returns null if failed to get
     */
    // public String getCurrentUsername() {
    //     String token = getCurrentToken();
    //     return token != null ? getUsernameFromToken(token) : null;
    // }

    /**
     * Get current user role (from current request context)
     *
     * @return Current user role code, returns null if failed to get
     */
    // public Integer getCurrentUserRole() {
    //     String token = getCurrentToken();
    //     if (token == null) {
    //         log.warn("Failed to get current user role: Unable to get token");
    //         return null;
    //     }
    //     Integer role = getRoleTypeFromToken(token);
    //     log.debug("Get current user role: token exists={}, role={}", token != null, role);
    //     return role;
    // }

    /**
     * Validate token integrity and extract user info.
     *
     * @param token JWT token
     * @return TokenValidationResult or null if invalid
     */
    public TokenValidationResult validateToken(String token) {
        if (!StringUtils.hasText(token)) {
            return null;
        }

        try {
            Claims claims = verifyToken(token);
            if (claims == null) {
                return null;
            }

            Long userId = null;
            Object userIdObj = claims.get("userId");
            if (userIdObj instanceof Integer) {
                userId = ((Integer) userIdObj).longValue();
            } else if (userIdObj instanceof Long) {
                userId = (Long) userIdObj;
            }

            String username = claims.get("username", String.class);

            Integer roleType = null;
            Object roleObj = claims.get("roleType");
            if (roleObj instanceof Integer) {
                roleType = (Integer) roleObj;
            } else if (roleObj instanceof String) {
                roleType = Integer.valueOf((String) roleObj);
            }

            if (userId != null && StringUtils.hasText(username) && roleType != null) {
                return new TokenValidationResult(userId, username, roleType, true);
            }

        } catch (Exception e) {
            log.warn("Token validation failed: {}", e.getMessage());
        }

        return null;
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