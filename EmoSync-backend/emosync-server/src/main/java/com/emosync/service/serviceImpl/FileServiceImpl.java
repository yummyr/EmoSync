package com.emosync.service.serviceImpl;

import com.emosync.DTO.BussinessFileUploadConfig;
import com.emosync.DTO.FileInfoDTO;
import com.emosync.DTO.FileUploadDTO;
import com.emosync.service.FileService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
@Service
public class FileServiceImpl implements FileService {
    @Override
    public FileInfoDTO uploadFile(MultipartFile file, FileUploadDTO uploadDTO, Long uploadUserId, boolean replaceOld) {
        return null;
    }

    @Override
    public FileInfoDTO uploadTempFile(MultipartFile file, Long uploadUserId) {
        return null;
    }

    @Override
    public FileInfoDTO confirmTempFile(Long tempFileId, FileUploadDTO uploadDTO) {
        return null;
    }

    @Override
    public List<FileInfoDTO> getFilesByBusiness(String businessType, String businessId) {
        return null;
    }

    @Override
    public List<FileInfoDTO> getFilesByBusinessField(String businessType, Long businessId, String businessField) {
        return null;
    }

    @Override
    public boolean deleteFile(Long fileId, Long userId) {
        return false;
    }

    @Override
    public boolean deleteFilesByBusiness(String businessType, Long businessId, String businessField) {
        return false;
    }

    @Override
    public int cleanupExpiredTempFiles() {
        return 0;
    }

    @Override
    public BussinessFileUploadConfig getUploadConfig(String businessType) {
        return null;
    }
}
