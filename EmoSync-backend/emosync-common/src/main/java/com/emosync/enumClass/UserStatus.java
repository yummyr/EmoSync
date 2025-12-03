package com.emosync.enumClass;

import lombok.Getter;

/**
 * User Status Enum
 * @author Yuan
 */
@Getter
public enum UserStatus {

    DISABLED(0, "Disabled"),
    NORMAL(1, "Normal");

    private final Integer code;
    private final String description;

    UserStatus(Integer code, String description) {
        this.code = code;
        this.description = description;
    }

    /**
     * Get enum by code
     */
    public static UserStatus fromCode(Integer code) {
        for (UserStatus status : UserStatus.values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown user status code: " + code);
    }

    /**
     * Validate if user status code is valid
     */
    public static boolean isValidCode(Integer code) {
        for (UserStatus status : UserStatus.values()) {
            if (status.getCode().equals(code)) {
                return true;
            }
        }
        return false;
    }
}
