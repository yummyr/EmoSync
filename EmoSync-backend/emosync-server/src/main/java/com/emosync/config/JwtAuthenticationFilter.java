package com.emosync.config;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.emosync.entity.User;
import com.emosync.enumClass.UserStatus;
import com.emosync.repository.UserRepository;
import com.emosync.security.UserDetailsImpl;
import com.emosync.service.UserService;
import com.emosync.util.JwtTokenUtils;
import jakarta.annotation.Resource;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * JWT Authentication Filter
 *
 * Core Responsibilities:
 * 1. Extract JWT token from HTTP request
 * 2. Validate token validity and integrity
 * 3. Set Spring Security authentication context
 *
 * Design Principles:
 * - Extend OncePerRequestFilter to ensure single execution per request
 * - Deep integration with Spring Security
 * - Comprehensive exception handling and security validation
 * - Unified user information retrieval from token, not dependent on request attributes
 *
 * @author Yuan
 * @date 2025-11-23
 */
@Slf4j
@AllArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenUtils jwtTokenUtils;
    @Resource
    private UserService userService;
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String requestUri = request.getRequestURI();
        String method = request.getMethod();
        log.debug("JWT auth filter processing request: {} {}", method, requestUri);

        try {
            // 1. Extract JWT token
            String token = jwtTokenUtils.extractTokenFromRequest(request);

            if (StringUtils.hasText(token)) {
                log.debug("Successfully extracted token, length: {}", token.length());

                // Check for invalid placeholder token
                if ("temp-token".equals(token)) {
                    // Silently handle frontend placeholder token without warning logs
                    log.debug("Detected frontend placeholder token, handling silently: {}", token);
                    clearSecurityContext();
                    filterChain.doFilter(request, response);
                    return;
                }

                if (token.length() < 10) {
                    log.warn("Detected invalid token, length too short: {}", token);
                    clearSecurityContext();
                    filterChain.doFilter(request, response);
                    return;
                }

                // 2. Validate token and extract user information
                JwtTokenUtils.TokenValidationResult validationResult = jwtTokenUtils.validateToken(token);

                if (validationResult != null && validationResult.isValid()) {
                    // 3. Check if token has expired
                    if (jwtTokenUtils.isTokenExpired(token)) {
                        log.warn("JWT token has expired, userId: {}, username: {}",
                            validationResult.getUserId(), validationResult.getUsername());
                        clearSecurityContext();
                        filterChain.doFilter(request, response);
                        return;
                    }

                    // 4. Query user information and verify user status
                    User user = userRepository.findById(validationResult.getUserId())
                            .orElseThrow(() -> new RuntimeException("User not found"));


                    if (user != null && UserStatus.NORMAL.getCode().equals(user.getStatus())) {

                        // Build ROLE
                        String roleCode = "ROLE_" + validationResult.getRoleType();
                        log.info("Creating role: {}", roleCode);
                        List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                                new SimpleGrantedAuthority(roleCode)
                        );

                        // Build UserDetailsImpl
                        UserDetailsImpl userDetails =
                                new UserDetailsImpl(
                                        user.getId(),
                                        user.getUsername(),
                                        user.getPassword(),
                                        authorities
                                );

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        authorities
                                );

                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        request.setAttribute("jwtToken", token);

                        log.info("JWT Auth success: id={}, username={}, role={}",
                                user.getId(), user.getUsername(), roleCode);
                    } else {
                        clearSecurityContext();
                    }
                } else {
                    clearSecurityContext();
                }
            }
        } catch (JWTVerificationException e) {
            log.warn("JWT verification failed: {}, clearing auth context", e.getMessage());
            clearSecurityContext();
        } catch (Exception e) {
            log.error("Exception occurred during JWT authentication, request: {} {}, error: {}, clearing auth context",
                method, requestUri, e.getMessage(), e);
            clearSecurityContext();
        }

        // Continue filter chain
        filterChain.doFilter(request, response);
    }

    /**
     * Clear Spring Security authentication context
     * Ensures no authentication information is retained on authentication failure
     */
    private void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }
}