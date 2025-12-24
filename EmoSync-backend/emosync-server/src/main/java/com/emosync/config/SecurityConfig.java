package com.emosync.config;

import com.emosync.repository.UserRepository;
import com.emosync.service.UserService;
import com.emosync.util.JwtTokenUtils;
import jakarta.servlet.Filter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


/**
 * 1. Unified authentication and authorization management - Spring Security handles all security-related functions uniformly
 * 2. JWT filter integration - Custom JWT authentication filter integrated into Spring Security filter chain
 * 3. Stateless session management - Suitable for microservices and distributed architectures
 * 4. Method-level security support - Supports annotations like @PreAuthorize
 * 5. Single configuration applies globally - Eliminates duplicate configuration, unified maintenance
 * Architecture optimization:
 * - Resolve circular dependency issues: Through lazy injection and separation of concerns
 * - Improve code maintainability: Clear dependency relationships
 * - Follow Spring best practices: Avoid complex Bean dependencies
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    private final JwtTokenUtils jwtTokenUtils;
    private final UserService userService;
    private final UserRepository userRepository;

    public SecurityConfig(JwtTokenUtils jwtTokenUtils, UserService userService, UserRepository userRepository) {
        this.jwtTokenUtils = jwtTokenUtils;
        this.userService = userService;
        this.userRepository = userRepository;
    }
    /**
     * Define public access path constants
     * These paths do not require JWT authentication and can be accessed directly
     */
    private static final String[] PUBLIC_PATHS = {
            // System basic paths
            "/",
            "/health",
            "/favicon.ico",

            // API documentation related
            "/doc.html",
            "/webjars/**",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-resources/**",

            // Authentication related endpoints (must be public)
            "/api/user/auth",        // Anonymous user authentication (registration/login)
            "/api/user/login",       // User login
            "/api/user/register",    // User registration
            "/api/user/forget",      // Forgot password
            "/api/user/add",         // User add
            "/api/file/**",          // Temporarily public
            "/api/**",
            // Public information endpoints
            "/api/user/{id}",        // User information query (public)

            // Email service endpoints
            "/api/**",         // Email sending and verification

            // Static resources (consistent with actual directory structure)
            "/static/**",           // Unified path for project static resources
            "/files/**",            // File upload directory access
            "/*.html",              // HTML files under root path
            "/file-test.html"       // File test page
    };

    /**
     * Password encoder Bean
     * <p>
     * 🎯 Separation of concerns:
     * - Independently defined to avoid circular dependencies with other Beans
     * - Uses BCrypt encryption algorithm with high security
     * - Globally shared, other services can directly inject and use
     *
     * @return PasswordEncoder BCrypt password encoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * JWT authentication filter Bean
     * <p>
     * 🎯 Resolve circular dependency:
     * - Created via @Bean method instead of @Resource injection
     * - Spring container automatically handles dependency relationships
     * - Avoids SecurityConfig directly depending on JwtAuthenticationFilter
     *
     * @return JwtAuthenticationFilter JWT authentication filter instance
     */
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(
            JwtTokenUtils jwtTokenUtils,
            UserService userService,
            UserRepository userRepository
    ) {
        return new JwtAuthenticationFilter(jwtTokenUtils, userService, userRepository);
    }


    /**
     * Configure Spring Security filter chain
     * <p>
     * Core features:
     * 1. Disable CSRF - Suitable for API services
     * 2. Stateless session - Suitable for JWT authentication
     * 3. Path permission configuration - Public paths vs protected paths
     * 4. JWT filter integration - Custom authentication logic
     * <p>
     * Security strategy:
     * - By default all requests require authentication
     * - Public paths allow anonymous access
     * - JWT filter executes before username/password authentication
     *
     * @param http HttpSecurity configuration object
     * @return SecurityFilterChain Security filter chain
     * @throws Exception Configuration exception
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // Create local CORS configuration source
        org.springframework.web.cors.UrlBasedCorsConfigurationSource corsSource = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        org.springframework.web.cors.CorsConfiguration corsConfig = new org.springframework.web.cors.CorsConfiguration();
        corsConfig.setAllowCredentials(true);
        corsConfig.addAllowedOriginPattern("*");
        corsConfig.addAllowedMethod("*");
        corsConfig.addAllowedHeader("*");
        corsConfig.addExposedHeader("Authorization");
        corsConfig.addExposedHeader("Content-Type");
        corsSource.registerCorsConfiguration("/**", corsConfig);

        http
                // Enable CORS configuration
                .cors(cors -> cors.configurationSource(corsSource))

                // Disable CSRF protection (usually not needed for API services)
                .csrf(csrf -> csrf.disable())

                // Configure session management as stateless (suitable for JWT)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Configure request authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Must allow SSE endpoints
                        .requestMatchers("/api/psychological-chat/stream").permitAll()
                        // Session start endpoint also needs to be allowed
                        .requestMatchers("/api/psychological-chat/session/start").permitAll()
                        // Public paths, allow anonymous access
                        .requestMatchers(PUBLIC_PATHS).permitAll()
                        // All other requests require authentication
                        .anyRequest().authenticated()
                )

                // Add JWT authentication filter
                .addFilterBefore((Filter) jwtAuthenticationFilter(jwtTokenUtils, userService, userRepository),
                        (Class<? extends Filter>) UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}