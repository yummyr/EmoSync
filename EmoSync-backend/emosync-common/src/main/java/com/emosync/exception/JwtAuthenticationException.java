package com.emosync.exception;

/**
 * JWT Authentication Exception Class
 *
 * Used to handle various exceptions during JWT authentication:
 * - Token missing
 * - Token format error
 * - Token expired
 * - Token validation failed
 * - User information not found
 */
public class JwtAuthenticationException extends RuntimeException {
    
    private final int errorCode;
    
    public JwtAuthenticationException(String message) {
        super(message);
        this.errorCode = 401;
    }
    
    public JwtAuthenticationException(String message, int errorCode) {
        super(message);
        this.errorCode = errorCode;
    }
    
    public JwtAuthenticationException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = 401;
    }
    
    public JwtAuthenticationException(String message, Throwable cause, int errorCode) {
        super(message, cause);
        this.errorCode = errorCode;
    }
    
    public int getErrorCode() {
        return errorCode;
    }
} 