package com.emosync.repository;

import com.emosync.entity.SysFileInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SysFileInfoRepository extends JpaRepository<SysFileInfo, Long> {

    List<SysFileInfo> findByBusinessTypeAndBusinessId(String businessType, String businessId);

    List<SysFileInfo> findByUploadUserId(Long uploadUserId);
}
