package com.emosync.enumClass;

/**
 * AI Analysis Task Status Enum
 * @author Yuan
 */
public enum AiTaskStatus {
    PENDING("PENDING", "Pending"),
    PROCESSING("PROCESSING", "Processing"),
    COMPLETED("COMPLETED", "Completed"),
    FAILED("FAILED", "Failed");

    private final String code;
    private final String description;

    AiTaskStatus(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static AiTaskStatus fromCode(String code) {
        for (AiTaskStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown task status: " + code);
    }
}


