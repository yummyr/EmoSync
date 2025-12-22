package com.emosync.util;


import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * Redis Utility Class
 *
 * Uses Spring Boot's built-in Jackson serialization (configured in RedisConfig),
 * so all objects stored in Redis are automatically serialized/deserialized as JSON.
 *
 * This utility provides common operations such as:
 * - set / get
 * - set with expiration
 * - delete
 * - exists
 * - increment / decrement
 * - get expiration time
 *
 * No manual JSON handling is required.
 * No deprecated API usage.
 *
 * @author Yuan
 * @date 2025-11-24
 */
@Component
@Slf4j
public class RedisUtils {
    
    @Resource
    private RedisTemplate<String, Object> redisTemplate;

    /**
     * Set a value without expiration.
     *
     * @param key   Redis key
     * @param value Object value
     */
    public void set(String key, Object value) {
        try {
            redisTemplate.opsForValue().set(key, value);
        } catch (Exception e) {
            log.error("Failed to set Redis cache, key: {}, error: {}", key, e.getMessage(), e);
        }
    }

    /**
     * Set a value with expiration time.
     *
     * @param key     Redis key
     * @param value   Value to store
     * @param seconds Expiration time in seconds
     */
    public void set(String key, Object value, long seconds) {
        try {
            redisTemplate.opsForValue().set(key, value, Duration.ofSeconds(seconds));
        } catch (Exception e) {
            log.error("Failed to set Redis key with expiration, key: {}, error: {}", key, e.getMessage(), e);
        }
    }

    /**
     * Get value from Redis.
     *
     * @param key Redis key
     * @return stored Object or null
     */
    public Object get(String key) {
        try {
            return key == null ? null : redisTemplate.opsForValue().get(key);
        } catch (Exception e) {
            log.error("Failed to get Redis key: {}, error: {}", key, e.getMessage(), e);
            return null;
        }
    }

    /**
     * Get value and convert to target class using Jackson automatically.
     *
     * Serialization/Deserialization is handled by RedisTemplate configuration.
     *
     * @param key   Redis key
     * @param clazz Target type
     * @return typed object or null
     */
    public <T> T get(String key, Class<T> clazz) {
        try {
            Object raw = get(key);
            if (raw == null) return null;

            // The RedisTemplate serializer already returns the correct type
            if (clazz.isInstance(raw)) {
                return clazz.cast(raw);
            }

            log.warn("Redis value type mismatch: expected {}, actual {}",
                    clazz.getSimpleName(), raw.getClass().getSimpleName());
            return null;

        } catch (Exception e) {
            log.error("Failed to convert Redis value for key: {}, error: {}", key, e.getMessage(), e);
            return null;
        }
    }


    /**
     * Delete a key.
     *
     * @param key Redis key
     * @return true if the key was removed
     */
    public boolean delete(String key) {
        try {
            return Boolean.TRUE.equals(redisTemplate.delete(key));
        } catch (Exception e) {
            log.error("Failed to delete Redis key: {}, error: {}", key, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Check if a key exists.
     *
     * @param key Redis key
     * @return true if key exists
     */
    public boolean exists(String key) {
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(key));
        } catch (Exception e) {
            log.error("Failed to check existence of Redis key: {}, error: {}", key, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Set expiration time.
     *
     * @param key     Redis key
     * @param seconds Expiration time in seconds
     */
    public boolean expire(String key, long seconds) {
        try {
            return Boolean.TRUE.equals(redisTemplate.expire(key, seconds, TimeUnit.SECONDS));
        } catch (Exception e) {
            log.error("Failed to set expiration for key: {}, error: {}", key, e.getMessage(), e);
            return false;
        }
    }


    /**
     * Get expiration time in seconds.
     *
     * @param key Redis key
     * @return seconds, -1 = never expire, -2 = key does not exist
     */
    public long getExpire(String key) {
        try {
            Long expire = redisTemplate.getExpire(key, TimeUnit.SECONDS);
            return expire != null ? expire : -2;
        } catch (Exception e) {
            log.error("Failed to get expiration for key: {}, error: {}", key, e.getMessage(), e);
            return -2;
        }
    }

    /**
     * Increment a numeric value.
     */
    public long increment(String key, long delta) {
        try {
            Long value = redisTemplate.opsForValue().increment(key, delta);
            return value != null ? value : 0;
        } catch (Exception e) {
            log.error("Failed to increment key: {}, delta: {}, error: {}", key, delta, e.getMessage(), e);
            return 0;
        }
    }


    /**
     * Decrement a numeric value.
     */
    public long decrement(String key, long delta) {
        try {
            Long value = redisTemplate.opsForValue().decrement(key, delta);
            return value != null ? value : 0;
        } catch (Exception e) {
            log.error("Failed to decrement key: {}, delta: {}, error: {}", key, delta, e.getMessage(), e);
            return 0;
        }
    }
} 