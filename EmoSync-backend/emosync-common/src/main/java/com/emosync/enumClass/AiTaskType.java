package com.emosync.enumClass;

/**
 * AI Analysis Task Type Enum
 * @author Yuan
 */
public enum AiTaskType {
    AUTO("AUTO", "Auto triggered"),
    MANUAL("MANUAL", "Manual triggered"),
    ADMIN("ADMIN", "Admin triggered"),
    BATCH("BATCH", "Batch triggered");

    private final String code;
    private final String description;

    AiTaskType(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static AiTaskType fromCode(String code) {
        for (AiTaskType type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown task type: " + code);
    }
}


