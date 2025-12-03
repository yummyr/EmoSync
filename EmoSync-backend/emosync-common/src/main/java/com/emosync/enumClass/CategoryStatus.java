package com.emosync.enumClass;

import lombok.Getter;

/**
 * Knowledge Category Status Enum
 * @author Yuan
 */
@Getter
public enum CategoryStatus {

    DISABLED(0, "Disabled"),
    ENABLED(1, "Enabled");

    private final Integer code;
    private final String description;

    CategoryStatus(Integer code, String description) {
        this.code = code;
        this.description = description;
    }

    /**
     * Get enum by code
     */
    public static CategoryStatus fromCode(Integer code) {
        for (CategoryStatus status : CategoryStatus.values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown category status code: " + code);
    }

    /**
     * Validate if category status code is valid
     */
    public static boolean isValidCode(Integer code) {
        for (CategoryStatus status : CategoryStatus.values()) {
            if (status.getCode().equals(code)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Is enabled
     */
    public boolean isEnabled() {
        return this == ENABLED;
    }

    /**
     * Is disabled
     */
    public boolean isDisabled() {
        return this == DISABLED;
    }
}