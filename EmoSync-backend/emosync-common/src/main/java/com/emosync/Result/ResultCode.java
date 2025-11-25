package com.emosync.Result;

public enum ResultCode {
    SUCCESS("200", "Operation successful"),
    ERROR("-1", "Operation failed"),
    VALIDATE_FAILED("404", "Parameter validation failed"),
    UNAUTHORIZED("401", "Not logged in or token has expired"),
    FORBIDDEN("403", "No relevant permissions"),
    SYSTEM_ERROR("500", "System error"),

    // Parameter related errors
    PARAM_ERROR("400", "Parameter error"),
    PARAM_MISSING("4001", "Missing required parameter"),
    PARAM_INVALID("4002", "Invalid parameter format"),

    // File operation related errors
    FILE_NOT_FOUND("5001", "File not found"),
    FILE_UPLOAD_FAILED("5002", "File upload failed"),
    FILE_DELETE_FAILED("5003", "File deletion failed"),
    FILE_SIZE_EXCEEDED("5004", "File size exceeded limit"),
    FILE_TYPE_NOT_SUPPORTED("5005", "Unsupported file type"),
    FILE_NAME_INVALID("5006", "Invalid file name"),
    FILE_CONTENT_INVALID("5007", "Invalid file content"),
    FILE_SAVE_FAILED("5008", "File save failed"),

    // Business related errors
    BUSINESS_ERROR("6000", "Business processing failed"),
    ACCOUNT_SAME("6001", "Username already exists"),
    USER_NOT_EXIST("6002", "User does not exist");

    private String code;
    private String msg;

    ResultCode(String code, String msg) {
        this.code = code;
        this.msg = msg;
    }

    public String code() {
        return code;
    }

    public String getCode() {
        return code;
    }

    public String getMsg() {
        return msg;
    }
} 