package com.emosync.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * JWT Configuration Class
 *
 * @author Yuan
 * @date 2025-11-23
 */
@Data
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtConfig {
    
    /**
     * JWT Secret Key
     */
    private String secret;
    
    /**
     * Token expiration time (milliseconds)
     */
    private long expiration;
    
    /**
     * Refresh Token expiration time (milliseconds)
     */
    private long refreshExpiration;
    
    /**
     * Token header name
     */
    private String header = "Authorization";
    
    /**
     * Token prefix
     */
    private String tokenPrefix = "Bearer ";
}
