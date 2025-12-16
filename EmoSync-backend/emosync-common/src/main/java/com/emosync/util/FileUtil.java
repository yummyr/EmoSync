package com.emosync.util;

import lombok.Getter;

import com.emosync.enumClass.FileBusinessTypeEnum;
import com.emosync.enumClass.FileTypeEnum;
import com.emosync.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * File Operation Utility Class
 * Focuses on basic file operations: save, delete, check, etc.
 * File type validation uniformly uses FileTypeEnum
 *
 * @author Yuan
 */
public class FileUtil {
    private final static Logger log = LoggerFactory.getLogger(FileUtil.class);
    public final static String FILE_BASE_PATH = System.getProperty("user.dir") + "/files/";
    private static final String ROOT_PATH = "/files/";

    /**
     * Convert access path to relative physical path
     * @param filename Access path, may contain /files/ prefix
     * @return Relative physical path, without prefix
     */
    public static String convertToRelativePath(String filename) {
        if (!StringUtils.hasText(filename)) {
            return filename;
        }

        // If contains ROOT_PATH prefix, remove it to avoid path duplication
        if (filename.startsWith(ROOT_PATH)) {
            return filename.substring(ROOT_PATH.length());
        }
        // If path has leading slash, remove it
        else if (filename.startsWith("/")) {
            return filename.substring(1);
        }

        return filename;
    }

    /**
     * -- GETTER --
     * Get maximum file size
     */
    @Getter
    @Value("${file.upload.maxSize:10485760}")
    private static final long maxFileSize = 10245760; // 10MB

    /**
     * Safe file save method
     * Uniformly uses FileTypeEnum for file type validation
     *
     * @param file Uploaded file
     * @param relativeDir Base directory (should correspond to FileTypeEnum's code)
     * @param folderName Subdirectory name, located under relativeDir (optional)
     * @return File access path, returns null if failed
     */
    public static String saveFile(MultipartFile file, String relativeDir, String folderName) {
        try {
            log.info("Starting file save, original filename: {}, target directory: {}", file.getOriginalFilename(), relativeDir);

            validateBasicFile(file);
            String originalFilename = file.getOriginalFilename();

            // Get file extension
            String extension = getFileExtension(originalFilename);
            if (!StringUtils.hasText(extension)) {
                log.error("File has no extension: {}", originalFilename);
                return null;
            }

            // Generate unique filename
            long timestamp = System.currentTimeMillis();
            String uniqueFilename = timestamp + extension.toLowerCase();

            // Construct safe save path
            Path fileDirectory = buildSafeFilePath(relativeDir, folderName);
            if (fileDirectory == null) {
                return null;
            }

            // Create directory
            if (!Files.exists(fileDirectory)) {
                Files.createDirectories(fileDirectory);
                log.info("Directory created: {}", fileDirectory);
            }

            // Save file
            Path uploadFilePath = fileDirectory.resolve(uniqueFilename);
            File uploadFile = uploadFilePath.toFile();

            file.transferTo(uploadFile);
            log.info("File saved successfully: {}", uploadFile.getAbsolutePath());

            // Return relative path
            String relativePath = ROOT_PATH + relativeDir + "/" +
                    (StringUtils.hasText(folderName) ? folderName + "/" : "") + uniqueFilename;

            log.info("Returning file access path: {}", relativePath);
            return relativePath;

        } catch (IOException e) {
            log.error("File save exception, filename: {}, error: {}", file.getOriginalFilename(), e.getMessage(), e);
            return null;
        } catch (Exception e) {
            log.error("Unknown exception during file save, filename: {}, error: {}", file.getOriginalFilename(), e.getMessage(), e);
            return null;
        }
    }

    /**
     * Convenience method for saving images
     */
    public static String saveImage(MultipartFile file, String folderName) {
        return saveFile(file, "img", folderName);
    }

    /**
     * Convenience method for saving videos
     */
    public static String saveVideo(MultipartFile file, String folderName) {
        return saveFile(file, "video", folderName);
    }

    /**
     * Safe file deletion method
     */
    public static boolean deleteFile(String filename) {
        try {
            log.info("Starting file deletion: {}", filename);

            validateName(filename);

            // Convert to relative physical path
            filename = convertToRelativePath(filename);

            // Get file absolute path
            Path filePath = Paths.get(FILE_BASE_PATH, filename);

            // Validate if file path is within allowed directory
            Path basePath = Paths.get(FILE_BASE_PATH);
            if (!filePath.toAbsolutePath().startsWith(basePath.toAbsolutePath())) {
                log.error("File path exceeds allowed range: {}", filePath);
                return false;
            }

            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("File deleted successfully: {}", filePath);
                return true;
            } else {
                log.warn("File does not exist: {}", filePath);
                return false;
            }

        } catch (Exception e) {
            log.error("File deletion exception, filename: {}, error: {}", filename, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Write content to file
     */
    public static void writeToFile(String fileName, String content) throws IOException {
        log.info("Starting file write: {}", fileName);

        if (!StringUtils.hasText(content)) {
            throw new IllegalArgumentException("Content cannot be empty");
        }

        // Security check
        validateName(fileName);

        // Create file object
        File file = new File(fileName);
        log.info("File absolute path: {}", file.getAbsolutePath());

        // Use try-with-resources to ensure FileWriter is automatically closed after use
        try (FileWriter fileWriter = new FileWriter(file)) {
            fileWriter.write(content);
            log.info("File written successfully: {}", fileName);
        } catch (IOException e) {
            log.error("File write failed, filename: {}, error: {}", fileName, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Check if file exists
     */
    public static boolean fileExists(String filename) {
        if (!StringUtils.hasText(filename)) {
            return false;
        }

        try {
            // Convert to relative physical path
            filename = convertToRelativePath(filename);

            Path filePath = Paths.get(FILE_BASE_PATH, filename);
            return Files.exists(filePath);
        } catch (Exception e) {
            log.error("File existence check exception, filename: {}, error: {}", filename, e.getMessage());
            return false;
        }
    }

    /**
     * Get file size
     */
    public static long getFileSize(String filename) {
        if (!StringUtils.hasText(filename)) {
            return -1;
        }

        try {
            // Convert to relative physical path
            filename = convertToRelativePath(filename);

            Path filePath = Paths.get(FILE_BASE_PATH, filename);
            if (Files.exists(filePath)) {
                return Files.size(filePath);
            }
            return -1;
        } catch (Exception e) {
            log.error("Get file size exception, filename: {}, error: {}", filename, e.getMessage());
            return -1;
        }
    }

    // ==================== Private Helper Methods ====================

    /**
     * Get file extension
     */
    public static String getFileExtension(String filename) {
        if (!StringUtils.hasText(filename)) {
            return "";
        }

        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < filename.length() - 1) {
            return filename.substring(dotIndex);
        }
        return "";
    }

    /**
     * Build safe file path
     */
    private static Path buildSafeFilePath(String relativeDir, String folderName) {
        try {
            Path projectRootPath = Paths.get(FILE_BASE_PATH);

            String filePath = relativeDir;
            // If folderName is not null, add folderName after specified directory
            if (StringUtils.hasText(folderName)) {
                // Validate folderName security
                validateName(folderName);
                filePath = relativeDir + File.separator + folderName;
            }

            return projectRootPath.resolve(filePath);
        } catch (Exception e) {
            log.error("Build file path failed, baseDir: {}, folderName: {}, error: {}", relativeDir, folderName, e.getMessage());
            return null;
        }
    }

    /**
     * Validate basic file properties
     */
    public static void validateBasicFile(MultipartFile file) {
        // Validate if empty
        if (file.isEmpty()) {
            throw new BusinessException("Uploaded file cannot be empty");
        }
        // File size validation
        if (file.getSize() > maxFileSize) {
            throw new BusinessException(String.format(
                    "File size exceeds limit, current: %d bytes, maximum allowed: %d bytes",
                    file.getSize(), maxFileSize
            ));
        }
        // Filename security check
        String originalName = file.getOriginalFilename();
        validateName(originalName);
    }

    /**
     * Filename security and non-empty check
     * @param name File (or folder) name
     */
    public static void validateName(String name) {
        // Validate if filename is empty
        if (!StringUtils.hasText(name)) {
            throw new BusinessException("File (or folder) name cannot be empty");
        }

        // Check for dangerous characters
        String[] dangerousChars = {"..", "\\", ":", "*", "?", "\"", "<", ">", "|"};
        for (String dangerousChar : dangerousChars) {
            if (name.contains(dangerousChar)) {
                throw new BusinessException("File (or folder) name contains illegal character: " + dangerousChar);
            }
        }
    }

    /**
     * Parse file type to directory name (lowercase)
     */
    public static String parseFileTypeToRelativeDir(String fileType) {
        if (!StringUtils.hasText(fileType)) {
            return FileTypeEnum.OTHER.getCode();
        }
        if (!FileTypeEnum.isAllowType(fileType)) {
            return "common";
        }
        return fileType.toLowerCase();
    }

    /**
     * Parse business file type to directory name
     * Updated to use your existing isAllowedFileBussinessType method
     */
    public static String parseBusinessFileTypeToFolderName(String businessType) {
        if (!StringUtils.hasText(businessType)) {
            return FileTypeEnum.OTHER.getCode();
        }
        if (!FileBusinessTypeEnum.isAllowedFileBusinessType(businessType)) {
            return "common";
        }
        return businessType.toLowerCase();
    }

    /**
     * Validate if file type matches business type
     * Uses your existing isTypeMatchBussinessType method
     */
    public static boolean validateFileTypeMatchBusinessType(String fileType, String businessType) {
        return FileBusinessTypeEnum.isTypeMatchBusinessType(fileType, businessType);
    }

    /**
     * Build complete file path (for checking file existence)
     * @param originalFilename Original filename
     * @param relativeDir Relative directory
     * @param folderName Subdirectory name (optional)
     * @return Complete file path (relative to FILE_BASE_PATH)
     */
    public static String buildFullFilePath(String originalFilename, String relativeDir, String folderName) {
        if (!StringUtils.hasText(originalFilename)) {
            return null;
        }

        StringBuilder pathBuilder = new StringBuilder();
        pathBuilder.append("files/").append(relativeDir).append("/");

        if (StringUtils.hasText(folderName)) {
            pathBuilder.append(folderName).append("/");
        }

        pathBuilder.append(originalFilename);

        return pathBuilder.toString();
    }

    /**
     * Build unique file path with timestamp
     * @param originalFilename Original filename
     * @param relativeDir Relative directory
     * @param folderName Subdirectory name (optional)
     * @return File path with timestamp
     */
    public static String buildUniqueFilePath(String originalFilename, String relativeDir, String folderName) {
        if (!StringUtils.hasText(originalFilename)) {
            return null;
        }

        // Get file extension
        String extension = getFileExtension(originalFilename);
        if (!StringUtils.hasText(extension)) {
            return null;
        }

        // Generate unique filename
        long timestamp = System.currentTimeMillis();
        String uniqueFilename = timestamp + extension.toLowerCase();

        return buildFullFilePath(uniqueFilename, relativeDir, folderName);
    }

    /**
     * Get file MIME type
     */
    public static String getFileMimeType(String filename) {
        try {
            if (!StringUtils.hasText(filename)) {
                return "application/octet-stream";
            }

            Path filePath = Paths.get(FILE_BASE_PATH, convertToRelativePath(filename));
            if (Files.exists(filePath)) {
                return Files.probeContentType(filePath);
            }
            return "application/octet-stream";
        } catch (Exception e) {
            log.error("Get file MIME type exception, filename: {}, error: {}", filename, e.getMessage());
            return "application/octet-stream";
        }
    }

    /**
     * Validate if file is an image
     */
    public static boolean isImageFile(String filename) {
        String mimeType = getFileMimeType(filename);
        return mimeType != null && mimeType.startsWith("image/");
    }

    /**
     * Validate if file is a video
     */
    public static boolean isVideoFile(String filename) {
        String mimeType = getFileMimeType(filename);
        return mimeType != null && mimeType.startsWith("video/");
    }

    /**
     * Get file last modified time
     */
    public static long getFileLastModified(String filename) {
        try {
            if (!StringUtils.hasText(filename)) {
                return -1;
            }

            Path filePath = Paths.get(FILE_BASE_PATH, convertToRelativePath(filename));
            if (Files.exists(filePath)) {
                return Files.getLastModifiedTime(filePath).toMillis();
            }
            return -1;
        } catch (Exception e) {
            log.error("Get file last modified time exception, filename: {}, error: {}", filename, e.getMessage());
            return -1;
        }
    }
}