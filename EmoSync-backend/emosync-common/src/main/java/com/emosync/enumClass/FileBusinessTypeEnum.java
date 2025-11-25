package com.emosync.enumClass;

import lombok.Getter;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;

/**
 * File Business Type Enum
 * Defines different business types for file categorization
 *
 * @author Yuan
 */
@Getter
public enum FileBusinessTypeEnum {

    // User related
    USER_AVATAR("USER_AVATAR", "User Avatar", new String[]{"IMG"}),
    USER_BACKGROUND("USER_BACKGROUND", "User Background", new String[]{"IMG"}),

    // Article related
    ARTICLE("ARTICLE", "Article Cover", new String[]{"IMG"}),

    // System related
    TEMP_FILE("TEMP_FILE", "Temporary File", new String[]{"IMG", "PDF", "DOC", "TXT"}),
    SYSTEM_NOTICE("SYSTEM_NOTICE", "System Notification", new String[]{"IMG"});

    private final String code;
    private final String description;
    private final String[] allowedTypes;  // Allowed file types

    FileBusinessTypeEnum(String code, String description, String[] allowedTypes) {
        this.code = code;
        this.description = description;
        this.allowedTypes = allowedTypes;
    }

    /**
     * Get enum instance by code
     * @param code Business type code
     * @return FileBusinessTypeEnum instance, returns null if not found
     */
    public static FileBusinessTypeEnum getByCode(String code) {
        if (!StringUtils.hasText(code)) {
            return null;
        }

        for (FileBusinessTypeEnum type : values()) {
            if (type.getCode().equals(code)) {
                return type;
            }
        }
        return null;
    }

    /**
     * Check if the business type is allowed
     * @param businessType Business type to check
     * @return true if allowed, false otherwise
     */
    public static boolean isAllowedFileBusinessType(String businessType) {
        if (!StringUtils.hasText(businessType)) {
            return false;
        }

        FileBusinessTypeEnum[] values = FileBusinessTypeEnum.values();
        List<String> valueCodes = Arrays.stream(values)
                .map(FileBusinessTypeEnum::getCode)
                .toList();
        return valueCodes.contains(businessType);
    }

    /**
     * Check if file type matches business type requirements
     * @param fileType File type to check
     * @param businessType Business type to check against
     * @return true if file type is allowed for the business type, false otherwise
     */
    public static boolean isTypeMatchBusinessType(String fileType, String businessType) {
        FileBusinessTypeEnum fileBusinessTypeEnum = getByCode(businessType);
        if (fileBusinessTypeEnum == null) {
            return false;
        }

        List<String> allowedTypesList = Arrays.stream(fileBusinessTypeEnum.getAllowedTypes())
                .toList();
        return allowedTypesList.contains(fileType);
    }

    /**
     * Get all available business type codes
     * @return List of all business type codes
     */
    public static List<String> getAllBusinessTypeCodes() {
        return Arrays.stream(values())
                .map(FileBusinessTypeEnum::getCode)
                .toList();
    }

    /**
     * Get all allowed file types for a specific business type
     * @param businessType Business type code
     * @return Array of allowed file types, returns empty array if business type not found
     */
    public static String[] getAllowedFileTypes(String businessType) {
        FileBusinessTypeEnum fileBusinessTypeEnum = getByCode(businessType);
        if (fileBusinessTypeEnum == null) {
            return new String[0];
        }
        return fileBusinessTypeEnum.getAllowedTypes();
    }

    /**
     * Check if business type allows specific file type
     * @param businessType Business type code
     * @param fileType File type to check
     * @return true if file type is allowed for the business type, false otherwise
     */
    public static boolean isFileTypeAllowed(String businessType, String fileType) {
        if (!StringUtils.hasText(businessType) || !StringUtils.hasText(fileType)) {
            return false;
        }

        FileBusinessTypeEnum fileBusinessTypeEnum = getByCode(businessType);
        if (fileBusinessTypeEnum == null) {
            return false;
        }

        List<String> allowedTypesList = Arrays.stream(fileBusinessTypeEnum.getAllowedTypes())
                .toList();
        return allowedTypesList.contains(fileType);
    }

    /**
     * Get business type description by code
     * @param code Business type code
     * @return Description of the business type, returns empty string if not found
     */
    public static String getDescriptionByCode(String code) {
        FileBusinessTypeEnum fileBusinessTypeEnum = getByCode(code);
        if (fileBusinessTypeEnum == null) {
            return "";
        }
        return fileBusinessTypeEnum.getDescription();
    }

    /**
     * Validate if business type exists
     * @param businessType Business type code to validate
     * @return true if business type exists, false otherwise
     */
    public static boolean isValidBusinessType(String businessType) {
        return getByCode(businessType) != null;
    }

    /**
     * Get default business type (first one in the enum)
     * @return Default FileBusinessTypeEnum instance
     */
    public static FileBusinessTypeEnum getDefault() {
        return USER_AVATAR;
    }

    /**
     * Check if business type is for images only
     * @param businessType Business type code
     * @return true if business type only allows images, false otherwise
     */
    public static boolean isImageOnlyBusinessType(String businessType) {
        FileBusinessTypeEnum fileBusinessTypeEnum = getByCode(businessType);
        if (fileBusinessTypeEnum == null) {
            return false;
        }

        String[] allowedTypes = fileBusinessTypeEnum.getAllowedTypes();
        return allowedTypes.length == 1 && "IMG".equals(allowedTypes[0]);
    }

    /**
     * Get all business types that allow specific file type
     * @param fileType File type to check
     * @return List of business type codes that allow the specified file type
     */
    public static List<String> getBusinessTypesForFileType(String fileType) {
        if (!StringUtils.hasText(fileType)) {
            return List.of();
        }

        return Arrays.stream(values())
                .filter(type -> Arrays.stream(type.getAllowedTypes())
                        .anyMatch(allowedType -> allowedType.equals(fileType)))
                .map(FileBusinessTypeEnum::getCode)
                .toList();
    }
}