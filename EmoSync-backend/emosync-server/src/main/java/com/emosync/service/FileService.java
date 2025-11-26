package com.emosync.service;

import com.emosync.DTO.BussinessFileUploadConfig;
import com.emosync.DTO.FileInfoDTO;
import com.emosync.DTO.FileUploadDTO;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;



@Service
public interface FileService {
    FileInfoDTO uploadFile(MultipartFile file, FileUploadDTO uploadDTO, Long uploadUserId, boolean replaceOld);

    FileInfoDTO uploadTempFile(MultipartFile file, Long uploadUserId);

    FileInfoDTO confirmTempFile(Long tempFileId, FileUploadDTO uploadDTO);

    List<FileInfoDTO> getFilesByBusiness(String businessType, String businessId);

    List<FileInfoDTO> getFilesByBusinessField(String businessType, Long businessId, String businessField);

    boolean deleteFile(Long fileId, Long userId);

    boolean deleteFilesByBusiness(String businessType, Long businessId, String businessField);

    int cleanupExpiredTempFiles();

    BussinessFileUploadConfig getUploadConfig(String businessType);

}
