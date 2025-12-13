package com.emosync.controller;

import com.emosync.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.emosync.DTO.BussinessFileUploadConfig;
import com.emosync.DTO.FileInfoDTO;
import com.emosync.DTO.FileUploadDTO;
import com.emosync.DTO.SimpleFileInfoDTO;
import com.emosync.Result.Result;
import com.emosync.service.FileService;
import com.emosync.service.SimpleFileService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * File Management Controller
 * Provides simple file upload and complete business file management functionality
 * @author Yuan
 */
@Tag(name = "File Management", description = "File upload, download, delete, and information query APIs")
@RequestMapping("/file")
@RestController
@Slf4j
@Validated
@AllArgsConstructor
public class FileController {


    private final FileService fileService;


    private final SimpleFileService simpleFileService;

    /** Get current authenticated UserDetailsImpl */
    private UserDetailsImpl getCurrentUserInfo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !(auth.getPrincipal() instanceof UserDetailsImpl)) {
            return null;
        }
        return (UserDetailsImpl) auth.getPrincipal();
    }


    // ========== Simple File Upload APIs (Not stored in database) ==========

    @Operation(summary = "Simple Image Upload", description = "Upload image file and return access path")
    @PostMapping("/simple/upload/image")
    public Result<String> uploadImage(@RequestParam("file") MultipartFile file) {
        log.info("Received simple image upload request, filename: {}", file.getOriginalFilename());
        return simpleFileService.uploadImage(file);
    }

    @Operation(summary = "Simple File Upload", description = "Upload common file type and return access path")
    @PostMapping("/simple/upload")
    public Result<String> uploadSimpleFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", defaultValue = "COMMON") String fileType) {
        log.info("Received simple file upload request, filename: {}, type: {}",
                file.getOriginalFilename(), fileType);
        return simpleFileService.uploadSimpleFile(file, fileType);
    }

    @Operation(summary = "Multiple Files Upload", description = "Batch upload multiple files with partial success support")
    @PostMapping("/simple/upload/multiple")
    public Result<List<String>> uploadMultipleFiles(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "fileType", defaultValue = "COMMON") String fileType) {
        log.info("Received batch file upload request, file count: {}, type: {}", files != null ? files.length : 0, fileType);
        return simpleFileService.uploadMultipleFiles(files, fileType);
    }

    @Operation(summary = "Simple File Delete", description = "Delete file by filename")
    @DeleteMapping("/simple/delete/{filename}")
    public Result<Void> deleteSimpleFile(@PathVariable String filename) {
        log.info("Received simple file delete request, filename: {}", filename);
        return simpleFileService.deleteFile(filename);
    }

    @Operation(summary = "Get File Information", description = "Get detailed file information")
    @GetMapping("/simple/info/{filename}")
    public Result<SimpleFileInfoDTO> getSimpleFileInfo(@PathVariable String filename) {
        log.info("Received file information query request, filename: {}", filename);
        return Result.success(simpleFileService.getFileInfo(filename));
    }

    @Operation(summary = "File Download", description = "Download specified file")
    @GetMapping("/simple/download/{filename}")
    public Result<String> downloadFile(@PathVariable String filename) {
        log.info("Received file download request, filename: {}", filename);
        return simpleFileService.getDownloadPath(filename);
    }

    // ========== Complete Business File Management APIs ==========

    @Operation(summary = "Business File Upload", description = "Upload file and bind to business object, optionally replace old file")
    @PostMapping("/upload")
    public Result<FileInfoDTO> uploadFile(
            @Parameter(description = "Uploaded file") @RequestParam("file") MultipartFile file,
            @Parameter(description = "Business type") @RequestParam("businessType") String businessType,
            @Parameter(description = "Business object ID") @RequestParam("businessId") String businessId,
            @Parameter(description = "Business field name") @RequestParam(value = "businessField", required = false) String businessField,
            @Parameter(description = "Replace old file") @RequestParam(value = "replaceOld", defaultValue = "false") boolean replaceOld) {

        try {
            Long userId = getCurrentUserId();
            log.info("File upload request: userId={}, filename={}, businessType={}, businessId={}, replaceMode={}",
                    userId, file.getOriginalFilename(), businessType, businessId, replaceOld);

            FileUploadDTO uploadDTO = buildFileUploadDTO(businessType, businessId, businessField, false);
            FileInfoDTO result = fileService.uploadFile(file, uploadDTO, userId, replaceOld);

            return Result.success(result);

        } catch (Exception e) {
            log.error("File upload failed: filename={}, error={}", file.getOriginalFilename(), e.getMessage(), e);
            return Result.error("File upload failed: " + e.getMessage());
        }
    }

    @Operation(summary = "Temporary File Upload", description = "Upload temporary file, can be confirmed as formal file later")
    @PostMapping("/upload/temp")
    public Result<FileInfoDTO> uploadTempFile(
            @Parameter(description = "Uploaded file") @RequestParam("file") MultipartFile file) {

        try {
            Long userId = getCurrentUserId();
            log.info("Temporary file upload request: userId={}, filename={}", userId, file.getOriginalFilename());

            FileInfoDTO result = fileService.uploadTempFile(file, userId);
            return Result.success(result);

        } catch (Exception e) {
            log.error("Temporary file upload failed: filename={}, error={}", file.getOriginalFilename(), e.getMessage(), e);
            return Result.error("Temporary file upload failed: " + e.getMessage());
        }
    }

    @Operation(summary = "Temporary Business File Upload", description = "Upload temporary business file with business ID 0, marked as temporary")
    @PostMapping("/upload/temp-business")
    public Result<FileInfoDTO> uploadTempBusinessFile(
            @Parameter(description = "Uploaded file") @RequestParam("file") MultipartFile file,
            @Parameter(description = "Business type") @RequestParam("businessType") String businessType,
            @Parameter(description = "Business field name") @RequestParam(value = "businessField", required = false) String businessField) {

        try {
            Long userId = getCurrentUserId();
            log.info("Temporary business file upload request: userId={}, filename={}, businessType={}, businessField={}",
                    userId, file.getOriginalFilename(), businessType, businessField);

            FileUploadDTO uploadDTO = buildFileUploadDTO(businessType, "0", businessField, true);
            FileInfoDTO result = fileService.uploadFile(file, uploadDTO, userId, false);
            return Result.success(result);

        } catch (Exception e) {
            log.error("Temporary business file upload failed: filename={}, error={}", file.getOriginalFilename(), e.getMessage(), e);
            return Result.error("Temporary business file upload failed: " + e.getMessage());
        }
    }

    @Operation(summary = "Confirm Temporary File", description = "Confirm temporary file as formal file and bind to business object")
    @PutMapping("/confirm/{tempFileId}")
    public Result<FileInfoDTO> confirmTempFile(
            @Parameter(description = "Temporary file ID") @PathVariable Long tempFileId,
            @Parameter(description = "File upload information") @Valid @RequestBody FileUploadDTO uploadDTO) {

        try {
            log.info("Confirm temporary file request: fileId={}, businessType={}, businessId={}",
                    tempFileId, uploadDTO.getBusinessType(), uploadDTO.getBusinessId());

            FileInfoDTO result = fileService.confirmTempFile(tempFileId, uploadDTO);
            return Result.success(result);

        } catch (Exception e) {
            log.error("Confirm temporary file failed: fileId={}, error={}", tempFileId, e.getMessage(), e);
            return Result.error("Confirm temporary file failed: " + e.getMessage());
        }
    }

    @Operation(summary = "Get Business File List", description = "Get file list by business type and business ID")
    @GetMapping("/business/{businessType}/{businessId}")
    public Result<List<FileInfoDTO>> getFilesByBusiness(
            @Parameter(description = "Business type") @PathVariable String businessType,
            @Parameter(description = "Business object ID") @PathVariable String businessId) {

        try {
            log.info("Query business file list: businessType={}, businessId={}", businessType, businessId);
            List<FileInfoDTO> fileList = fileService.getFilesByBusiness(businessType, businessId);
            return Result.success(fileList);

        } catch (Exception e) {
            log.error("Query business file list failed: businessType={}, businessId={}, error={}",
                    businessType, businessId, e.getMessage(), e);
            return Result.error("Query file list failed: " + e.getMessage());
        }
    }

    @Operation(summary = "Get Business Field Files", description = "Get files by business type, business ID and field name")
    @GetMapping("/business/{businessType}/{businessId}/{businessField}")
    public Result<List<FileInfoDTO>> getFilesByBusinessField(
            @Parameter(description = "Business type") @PathVariable String businessType,
            @Parameter(description = "Business object ID") @PathVariable Long businessId,
            @Parameter(description = "Business field name") @PathVariable String businessField) {

        try {
            log.info("Query business field files: businessType={}, businessId={}, field={}",
                    businessType, businessId, businessField);

            List<FileInfoDTO> fileList = fileService.getFilesByBusinessField(
                    businessType, businessId, businessField);
            return Result.success(fileList);

        } catch (Exception e) {
            log.error("Query business field files failed: businessType={}, businessId={}, field={}, error={}",
                    businessType, businessId, businessField, e.getMessage(), e);
            return Result.error("Query files failed: " + e.getMessage());
        }
    }

    @Operation(summary = "Delete Business File", description = "Delete specified business file")
    @DeleteMapping("/{fileId}")
    public Result<Boolean> deleteFile(
            @Parameter(description = "File ID") @PathVariable Long fileId) {

        try {
            UserDetailsImpl currentUser = getCurrentUserInfo();
            Long userId = currentUser != null ? currentUser.getId() : null;
            log.info("Delete file request: userId={}, fileId={}", userId, fileId);

            boolean result = fileService.deleteFile(fileId, userId);
            return Result.success(result);

        } catch (Exception e) {
            log.error("Delete file failed: fileId={}, error={}", fileId, e.getMessage(), e);
            return Result.error("Delete file failed: " + e.getMessage());
        }
    }

    @Operation(summary = "Batch Delete Business Files", description = "Batch delete files by business information")
    @DeleteMapping("/business/{businessType}/{businessId}")
    public Result<Boolean> deleteFilesByBusiness(
            @Parameter(description = "Business type") @PathVariable String businessType,
            @Parameter(description = "Business object ID") @PathVariable Long businessId,
            @Parameter(description = "Business field name") @RequestParam(value = "businessField", required = false) String businessField) {

        try {
            log.info("Batch delete business files request: businessType={}, businessId={}, field={}",
                    businessType, businessId, businessField);

            boolean result = fileService.deleteFilesByBusiness(businessType, businessId, businessField);
            return Result.success(result);

        } catch (Exception e) {
            log.error("Batch delete business files failed: businessType={}, businessId={}, error={}",
                    businessType, businessId, e.getMessage(), e);
            return Result.error("Batch delete files failed: " + e.getMessage());
        }
    }

    @Operation(summary = "Get File Upload Configuration", description = "Get file upload configuration for specified business type")
    @GetMapping("/upload/config")
    public Result<BussinessFileUploadConfig> getUploadConfig(
            @Parameter(description = "Business type") @RequestParam String businessType) {

        try {
            log.info("Get file upload configuration: businessType={}", businessType);
            BussinessFileUploadConfig bussinessFileUploadConfig = fileService.getUploadConfig(businessType);
            return Result.success(bussinessFileUploadConfig);

        } catch (Exception e) {
            log.error("Get file upload configuration failed: businessType={}, error={}", businessType, e.getMessage(), e);
            return Result.error("Get configuration failed: " + e.getMessage());
        }
    }

    @Operation(summary = "Clean Expired Temporary Files", description = "System management interface: Clean expired temporary files")
    @PostMapping("/cleanup/temp")
    public Result<Integer> cleanupExpiredTempFiles() {

        try {
            log.info("Clean expired temporary files request");
            int cleanupCount = fileService.cleanupExpiredTempFiles();
            return Result.success(cleanupCount);

        } catch (Exception e) {
            log.error("Clean expired temporary files failed: error={}", e.getMessage(), e);
            return Result.error("Clean failed: " + e.getMessage());
        }
    }

    // ========== Private Methods ==========

    /**
     * Get current user ID, use default test user ID if retrieval fails
     */
    private Long getCurrentUserId() {
        try {
            UserDetailsImpl currentUser = getCurrentUserInfo();
            return currentUser != null ? currentUser.getId() : null;
        } catch (Exception e) {
            Long defaultUserId = 1L;
            log.warn("Failed to get user ID, using default test user ID: {}", defaultUserId);
            return defaultUserId;
        }
    }

    /**
     * Build file upload DTO
     */
    private FileUploadDTO buildFileUploadDTO(String businessType, String businessId, String businessField, Boolean isTemp) {
        FileUploadDTO uploadDTO = new FileUploadDTO();
        uploadDTO.setBusinessType(businessType);
        uploadDTO.setBusinessId(businessId);
        uploadDTO.setBusinessField(businessField);
        uploadDTO.setIsTemp(isTemp);
        return uploadDTO;
    }
}