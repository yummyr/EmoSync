package com.emosync.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * File Information Response DTO
 * Represents metadata information of uploaded files.
 *
 * - Uses Java built-in DateTimeFormatter
 */
@Data
@Schema(description = "File Information Response DTO")
public class FileInfoDTO {

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Schema(description = "File ID")
    private Long id;

    @Schema(description = "Original file name")
    private String originalName;

    @Schema(description = "File access path")
    private String filePath;

    @Schema(description = "File size (bytes)")
    private Long fileSize;

    @Schema(description = "File type")
    private String fileType;

    @Schema(description = "File type description")
    private String fileTypeDesc;

    @Schema(description = "Business type")
    private String businessType;

    @Schema(description = "Business type description")
    private String businessTypeDesc;

    @Schema(description = "Business object ID")
    private String businessId;

    @Schema(description = "Business field name")
    private String businessField;

    @Schema(description = "Uploader user ID")
    private Long uploadUserId;

    @Schema(description = "Is temporary file")
    private Boolean isTemp;

    @Schema(description = "Status")
    private Integer status;

    @Schema(description = "Creation time (string)")
    private String createTime;

    @Schema(description = "Expiration time (string)")
    private String expireTime;

    @Schema(description = "File extension")
    private String fileExtension;

    @Schema(description = "Whether the file is expired")
    private Boolean isExpired;

    /**
     * Sets creation time (convert LocalDateTime → String)
     */
    public void setCreateTime(LocalDateTime createTime) {
        if (createTime != null) {
            this.createTime = FORMATTER.format(createTime);
        }
    }

    /**
     * Sets expiration time (convert LocalDateTime → String)
     */
    public void setExpireTime(LocalDateTime expireTime) {
        if (expireTime != null) {
            this.expireTime = FORMATTER.format(expireTime);
        }
    }
}
