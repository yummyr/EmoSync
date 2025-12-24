package com.emosync.service.convert;

import com.emosync.DTO.command.UserRegisterCommandDTO;
import com.emosync.DTO.command.UserUpdateCommandDTO;
import com.emosync.DTO.response.UserDetailResponseDTO;
import com.emosync.DTO.response.UserLoginResponseDTO;
import com.emosync.entity.User;
import com.emosync.enumClass.UserStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * User Conversion Class
 * Handles conversion between User entities and DTOs
 */

public class UserConvert {

    /**
     * Convert registration command DTO to User entity
     *
     * @param registerDTO     Registration command DTO
     * @param encodedPassword Encrypted password
     * @return User entity
     */
    public static User registerCommandToEntity(UserRegisterCommandDTO registerDTO, String encodedPassword) {
        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setEmail(registerDTO.getEmail());
        user.setPassword(encodedPassword);
        user.setNickname(registerDTO.getNickname());
        user.setPhone(registerDTO.getPhone());
        user.setGender(registerDTO.getGender());
        user.setBirthday(registerDTO.getBirthday());
        user.setUserType(registerDTO.getUserType());
        user.setStatus(UserStatus.NORMAL.getCode());
        return user;
    }

    /**
     * Convert User entity to detail response DTO
     *
     * @param user User entity
     * @return User detail response DTO
     */
    public static UserDetailResponseDTO entityToDetailResponse(User user) {
        return UserDetailResponseDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .avatar(user.getAvatar())
                .phone(user.getPhone())
                .gender(user.getGender())
                .genderDisplayName(getGenderDisplayName(user.getGender()))
                .birthday(user.getBirthday())
                .userType(user.getUserType())
                .userTypeDisplayName(getUserTypeDisplayName(user.getUserType()))
                .status(user.getStatus())
                .statusDisplayName(getStatusDisplayName(user.getStatus()))
                .displayName(getDisplayName(user))
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    /**
     * Build login response DTO
     *
     * @param token    JWT token
     * @param userInfo User information
     * @return Login response DTO
     */
    public static UserLoginResponseDTO buildLoginResponse(String token, UserDetailResponseDTO userInfo) {
        return UserLoginResponseDTO.builder()
                .user(userInfo)  // Fixed: changed from 'userInfo' to 'user' to match DTO field name
                .token(token)
                .roleType(userInfo.getUserType())  // Fixed: changed from toString() to direct Integer
                .build();
    }

    /**
     * Convert update command DTO to User entity
     *
     * @param updateDTO Update command DTO
     * @return User entity
     */
    public static User updateCommandToEntity(UserUpdateCommandDTO updateDTO) {
        User user = new User();
        user.setEmail(updateDTO.getEmail());
        user.setNickname(updateDTO.getNickname());
        user.setAvatar(updateDTO.getAvatar());
        user.setPhone(updateDTO.getPhone());
        user.setGender(updateDTO.getGender());
        user.setBirthday(updateDTO.getBirthday());
        user.setUserType(updateDTO.getUserType());
        user.setStatus(updateDTO.getStatus());
        user.setUpdatedAt(LocalDateTime.now());
        return user;
    }

    /**
     * Get gender display name
     *
     * @param gender Gender code
     * @return Gender display name
     */
    private static String getGenderDisplayName(Integer gender) {
        if (gender == null) {
            return "Unknown";
        }
        switch (gender) {
            case 1:
                return "Male";
            case 2:
                return "Female";
            default:
                return "Unknown";
        }
    }

    /**
     * Get user type display name
     *
     * @param userType User type code
     * @return User type display name
     */
    private static String getUserTypeDisplayName(Integer userType) {
        if (userType == null) {
            return "Regular";
        }
        switch (userType) {
            case 1:
                return "Regular";
            case 2:
                return "Admin";
            default:
                return "Regular";
        }
    }

    /**
     * Get status display name
     *
     * @param status Status code
     * @return Status display name
     */
    private static String getStatusDisplayName(Integer status) {
        if (status == null) {
            return "Active";
        }
        switch (status) {
            case 0:
                return "Disabled";
            case 1:
                return "Active";
            default:
                return "Active";
        }
    }
    /**
     * Get display name (prefer nickname, fallback to username)
     *
     * @param user User entity
     * @return Display name
     */
    private static String getDisplayName(User user) {
        if (user.getNickname() != null && !user.getNickname().trim().isEmpty()) {
            return user.getNickname();
        }
        return user.getUsername();
    }
}
