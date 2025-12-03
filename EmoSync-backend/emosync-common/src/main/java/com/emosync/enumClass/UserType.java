package com.emosync.enumClass;

import lombok.Getter;

/**
 * User Type Enum
 * @author Yuan
 */
@Getter
public enum UserType {

    USER(1, "Regular User"),
    ADMIN(2, "Administrator");

    private final Integer code;
    private final String description;

    UserType(Integer code, String description) {
        this.code = code;
        this.description = description;
    }

    /**
     * Get enum by code
     */
    public static UserType fromCode(Integer code) {
        for (UserType type : UserType.values()) {
            if (type.getCode().equals(code)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown user type code: " + code);
    }

    /**
     * Validate if user type code is valid
     */
    public static boolean isValidCode(Integer code) {
        for (UserType type : UserType.values()) {
            if (type.getCode().equals(code)) {
                return true;
            }
        }
        return false;
    }
}
