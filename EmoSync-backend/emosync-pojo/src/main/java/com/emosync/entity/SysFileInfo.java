package com.emosync.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "sys_file_info")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SysFileInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "original_name")
    private String originalName;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "file_type")
    private String fileType;

    @Column(name = "business_type")
    private String businessType;

    @Column(name = "business_id")
    private String businessId;

    @Column(name = "business_field")
    private String businessField;

    @Column(name = "upload_user_id")
    private Long uploadUserId;

    @Column(name = "is_temp")
    private Boolean isTemp;

    private Integer status;

    @Column(name = "create_time")
    private LocalDateTime createTime;

    @Column(name = "expire_time")
    private LocalDateTime expireTime;
}
