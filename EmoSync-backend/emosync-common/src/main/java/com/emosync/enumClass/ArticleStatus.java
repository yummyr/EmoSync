package com.emosync.enumClass;

import lombok.Getter;

/**
 * Knowledge Article Status Enum
 * @author Yuan
 */
@Getter
public enum ArticleStatus {

    DRAFT(0, "Draft"),
    PUBLISHED(1, "Published"),
    OFFLINE(2, "Offline");

    private final Integer code;
    private final String description;

    ArticleStatus(Integer code, String description) {
        this.code = code;
        this.description = description;
    }

    /**
     * Get enum by code
     */
    public static ArticleStatus fromCode(Integer code) {
        for (ArticleStatus status : ArticleStatus.values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown article status code: " + code);
    }

    /**
     * Validate if article status code is valid
     */
    public static boolean isValidCode(Integer code) {
        for (ArticleStatus status : ArticleStatus.values()) {
            if (status.getCode().equals(code)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Can publish
     */
    public boolean canPublish() {
        return this == DRAFT || this == OFFLINE;
    }

    /**
     * Can offline
     */
    public boolean canOffline() {
        return this == PUBLISHED;
    }

    /**
     * Can edit
     */
    public boolean canEdit() {
        return this == DRAFT || this == OFFLINE;
    }
}