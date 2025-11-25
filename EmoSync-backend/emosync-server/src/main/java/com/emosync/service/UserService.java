package com.emosync.service;

import com.emosync.DTO.command.*;
import com.emosync.DTO.query.UserListQueryDTO;
import com.emosync.DTO.response.UserDetailResponseDTO;
import com.emosync.DTO.response.UserLoginResponseDTO;
import com.emosync.Result.PageResult;

import java.util.Map;

public interface UserService {

    UserLoginResponseDTO login(UserLoginCommandDTO dto);

    UserDetailResponseDTO register(UserRegisterCommandDTO dto);

    UserDetailResponseDTO getUserById(Long id);

    UserDetailResponseDTO updateUserProfile(Long id, UserUpdateCommandDTO dto);

    void changeUserPassword(Long id, PasswordUpdateDTO dto);

    void resetPasswordByEmail(String email, String newPassword);

    PageResult<UserDetailResponseDTO> getUserPage(UserListQueryDTO query);

    Map<String, Object> getUserStatistics();

    void updateUser(Long id, UserUpdateCommandDTO dto);

    void updateUserStatus(Long id, Integer status);

    void deleteUser(Long id);
}
