package com.emosync.service;

import com.emosync.DTO.SimpleFileInfoDTO;
import com.emosync.Result.Result;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
@Service
public interface SimpleFileService {
    Result<String> uploadImage(MultipartFile file);

    Result<String> uploadSimpleFile(MultipartFile file, String fileType);

    Result<List<String>> uploadMultipleFiles(MultipartFile[] files, String fileType);

    Result<Void> deleteFile(String filename);

    SimpleFileInfoDTO getFileInfo(String filename);

    Result<String> getDownloadPath(String filename);
}
