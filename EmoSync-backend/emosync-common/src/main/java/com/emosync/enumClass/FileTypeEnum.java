package com.emosync.enumClass;

import lombok.Getter;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;

/**
 * File Type Enum
 * Unified management of supported file types and extensions.
 *
 * Replaced Hutool StrUtil with Spring's StringUtils.
 *
 * @author Yuan
 */
@Getter
public enum FileTypeEnum {

    // Image files
    IMG("IMG", "Image", Arrays.asList("jpg", "jpeg", "png", "gif", "bmp", "webp", "svg")),

    // Document files
    PDF("PDF", "PDF Document", List.of("pdf")),
    DOC("DOC", "Word Document", Arrays.asList("doc", "docx")),
    XLS("XLS", "Excel Spreadsheet", Arrays.asList("xls", "xlsx")),
    PPT("PPT", "PowerPoint Presentation", Arrays.asList("ppt", "pptx")),
    TXT("TXT", "Text File", Arrays.asList("txt", "md", "log")),

    // Audio files
    AUDIO("AUDIO", "Audio File", Arrays.asList("mp3", "wav", "flac", "aac", "m4a", "ogg")),

    // Video files
    VIDEO("VIDEO", "Video File", Arrays.asList("mp4", "avi", "mov", "wmv", "flv", "mkv", "webm")),

    // Compressed files
    ZIP("ZIP", "Compressed File", Arrays.asList("zip", "rar", "7z", "tar", "gz")),

    // Other files
    OTHER("OTHER", "Other", List.of());

    private final String code;
    private final String description;
    private final List<String> extensions;

    FileTypeEnum(String code, String description, List<String> extensions) {
        this.code = code;
        this.description = description;
        this.extensions = extensions;
    }

    /**
     * Check if file type code is allowed.
     */
    public static boolean isAllowType(String fileType) {
        if (!StringUtils.hasText(fileType)) {
            return false;
        }

        List<String> codes = Arrays.stream(values())
                .map(FileTypeEnum::getCode)
                .toList();

        return codes.contains(fileType);
    }

    /**
     * Get file type enum based on the extension.
     *
     * @param extension File extension (with or without dot)
     * @return FileTypeEnum
     */
    public static FileTypeEnum getByExtension(String extension) {
        if (!StringUtils.hasText(extension)) {
            return OTHER;
        }

        // Normalize extension: remove dot and lower case
        String normalizedExt = extension.toLowerCase().replace(".", "");

        for (FileTypeEnum type : values()) {
            if (type.getExtensions().contains(normalizedExt)) {
                return type;
            }
        }
        return OTHER;
    }

    /**
     * Get file type enum from original file name.
     */
    public static FileTypeEnum getByFileName(String fileName) {
        if (!StringUtils.hasText(fileName)) {
            return OTHER;
        }
        return getByExtension(extractExtension(fileName));
    }

    /**
     * Extract extension from file name.
     *
     * @param fileName Full file name
     * @return extension without dot (e.g., "jpg")
     */
    private static String extractExtension(String fileName) {
        if (!StringUtils.hasText(fileName)) {
            return "";
        }

        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < fileName.length() - 1) {
            return fileName.substring(dotIndex + 1);
        }
        return "";
    }
}
