package com.emosync.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web Configuration Class - Enterprise Unified Configuration
 *
 * 🎯 Unified Responsibilities:
 * 1. API prefix configuration
 * 2. Static resource mapping configuration
 * 3. API documentation resource configuration
 *
 * 🚀 Architectural Advantages:
 * - Unified management of all web-related configurations
 * - Avoid conflicts between multiple configuration classes
 * - Clear responsibilities, easy to maintain
 * - Follows single configuration principle
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Configure API path prefix
     *
     * Automatically add "/api" prefix to all controller classes with @RestController annotation
     * This distinguishes API interfaces from other web resources (such as static resources, documentation)
     *
     * Working Principle:
     * - UserController: /user/* → /api/user/*
     * - FileController: /file/* → /api/file/*
     * - EmailController: /email/* → /api/email/*
     *
     * Exclusion Rules:
     * - Swagger/Knife4j related interfaces do not add prefix
     * - Exclude springfox, swagger, doc related packages through package name judgment
     *
     * @param configurer Path matcher configurator
     */
    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        configurer.addPathPrefix("/api", clazz ->
                clazz.isAnnotationPresent(RestController.class) &&
                        !clazz.getPackage().getName().contains("springfox") &&
                        !clazz.getPackage().getName().contains("swagger") &&
                        !clazz.getPackage().getName().contains("doc")
        );
    }

    /**
     * Configure static resource mapping uniformly
     *
     * 🎯 Configuration Goals:
     * 1. Static resource access paths
     * 2. File upload directory access
     * 3. API documentation related resources
     * 4. Avoid conflicts with API paths
     *
     * 📁 Resource Mapping Rules:
     * - /static/** → classpath:/static/ (Project static resources)
     * - /files/** → file:./files/ (File upload directory)
     * - /doc.html → Knife4j documentation homepage
     * - /webjars/** → Maven webjars resources
     * - /swagger-ui/** → Swagger UI resources
     * - /v3/api-docs/** → OpenAPI documentation
     *
     * @param registry Resource handler registry
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 1. Static resource configuration - project custom static files
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(3600); // Cache for 1 hour
        
        // 2. File upload directory configuration - user uploaded file access
        registry.addResourceHandler("/files/**")
                .addResourceLocations("file:./files/")
                .setCachePeriod(86400); // Cache for 24 hours
        
        // 3. API documentation resource configuration - Knife4j/Swagger related
        registry.addResourceHandler("doc.html")
                .addResourceLocations("classpath:/META-INF/resources/");
                
        registry.addResourceHandler("swagger-ui.html")
                .addResourceLocations("classpath:/META-INF/resources/");
                
        registry.addResourceHandler("/webjars/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/");
                
        registry.addResourceHandler("/swagger-ui/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/swagger-ui/");
                
        registry.addResourceHandler("/v3/api-docs/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/");
    }
}
