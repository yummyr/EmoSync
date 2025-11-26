package com.emosync.service.serviceImpl;

import com.emosync.DTO.SimpleFileInfoDTO;
import com.emosync.Result.Result;
import com.emosync.service.SimpleFileService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
@Service
public class SimpleFileServiceImpl implements SimpleFileService {
    @Override
    public Result<String> uploadImage(MultipartFile file) {
        return null;
    }

    @Override
    public Result<String> uploadSimpleFile(MultipartFile file, String fileType) {
        return null;
    }

    @Override
    public Result<List<String>> uploadMultipleFiles(MultipartFile[] files, String fileType) {
        return null;
    }

    @Override
    public Result<Void> deleteFile(String filename) {
        return null;
    }

    @Override
    public SimpleFileInfoDTO getFileInfo(String filename) {
        return null;
    }

    @Override
    public Result<String> getDownloadPath(String filename) {
        return null;
    }
}
