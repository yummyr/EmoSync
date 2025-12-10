package com.emosync.controller;

import com.emosync.DTO.command.*;
import com.emosync.DTO.query.UserListQueryDTO;
import com.emosync.DTO.response.UserDetailResponseDTO;
import com.emosync.DTO.response.UserLoginResponseDTO;
import com.emosync.Result.Result;
import com.emosync.Result.PageResult;
import com.emosync.security.UserDetailsImpl;
import com.emosync.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * User Management Controller
 *
 * Provides:
 * - Login / Register
 * - Profile operations
 * - Admin operations (user list, update, delete, statistics)
 */
@Tag(name = "User Management")
@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {


    private final UserService userService;


    /** Get current authenticated UserDetailsImpl */
    private UserDetailsImpl getCurrentUserInfo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !(auth.getPrincipal() instanceof UserDetailsImpl)) {
            return null;
        }
        return (UserDetailsImpl) auth.getPrincipal();
    }

    /** Check if current user has ROLE_2  */
    private boolean isAdmin() {
        UserDetailsImpl userDetails = getCurrentUserInfo();
        return userDetails != null && userDetails.isAdmin();
    }

    /** User Login */
    @Operation(summary = "User Login")
    @PostMapping("/login")
    public Result<UserLoginResponseDTO> login(@Valid @RequestBody UserLoginCommandDTO loginDTO) {
        log.info("UserController Login request: {}", loginDTO.getUsername());
        log.info("get loginDTO:{}",loginDTO);
        UserLoginResponseDTO response = userService.login(loginDTO);
        return Result.success("Login successful", response);
    }

    /** User Registration */
    @Operation(summary = "User Registration")
    @PostMapping("/add")
    public Result<UserDetailResponseDTO> register(@Valid @RequestBody UserRegisterCommandDTO registerDTO) {
        log.info("Register request: {}", registerDTO.getUsername());
        UserDetailResponseDTO response = userService.register(registerDTO);
        return Result.success("Registration successful", response);
    }

    /** Get Current User Info */
    @Operation(summary = "Get Current User Info")
    @GetMapping("/current")
    public Result<UserDetailResponseDTO> getCurrentUser() {
        UserDetailsImpl current = getCurrentUserInfo();
        if (current == null) {
            return Result.error("Not logged in or invalid token");
        }

        log.info("Fetching current user info: userId={}", current.getId());
        return Result.success(userService.getUserById(current.getId()));
    }

    /** Update Profile */

    @Operation(summary = "Update User Profile")
    @PutMapping("/profile")
    public Result<UserDetailResponseDTO> updateProfile(@Valid @RequestBody UserUpdateCommandDTO updateDTO) {

        UserDetailsImpl current = getCurrentUserInfo();
        if (current == null) {
            return Result.error("Not logged in");
        }

        log.info("Update profile: userId={}", current.getId());
        return Result.success("Profile updated", userService.updateUserProfile(current.getId(), updateDTO));
    }

    /** Change Password */
    @Operation(summary = "Change Password")
    @PutMapping("/password")
    public Result<Void> changePassword(@Valid @RequestBody PasswordUpdateDTO passwordUpdateDTO) {
        UserDetailsImpl current = getCurrentUserInfo();
        if (current == null) {
            return Result.error("Not logged in");
        }

        log.info("Change password: userId={}", current.getId());
        userService.changeUserPassword(current.getId(), passwordUpdateDTO);
        return Result.success();
    }

    /** Forgot Password */
    @Operation(summary = "Forgot Password")
    @GetMapping("/forget")
    public Result<Void> forgetPassword(
            @Parameter(description = "Email") @RequestParam String email,
            @Parameter(description = "New Password") @RequestParam String newPassword) {

        log.info("Forgot password request: email={}", email);
        userService.resetPasswordByEmail(email, newPassword);
        return Result.success();
    }

    /** Logout */
    @Operation(summary = "User Logout")
    @PostMapping("/logout")
    public Result<?> logout() {
        try {
            log.info("Logout request");
            return Result.success("Logout successful");
        } catch (Exception e) {
            log.error("Logout failed", e);
            return Result.success("Logout successful");
        }
    }

    /** Admin: Query User Page */
    @Operation(summary = "Admin - Paged User List")
    @GetMapping("/page")
    public Result<PageResult<UserDetailResponseDTO>> getUserPage(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String nickname,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) Integer userType,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "1") Integer currentPage,
            @RequestParam(defaultValue = "10") Integer size) {

        if (!isAdmin()) {
            return Result.error("Permission denied — Admin only");
        }

        UserListQueryDTO query = new UserListQueryDTO();
        query.setUsername(username);
        query.setEmail(email);
        query.setNickname(nickname);
        query.setPhone(phone);
        query.setUserType(userType);
        query.setStatus(status);
        query.setCurrentPage(currentPage);
        query.setSize(size);

        log.info("Admin query user list: page={}, size={}", currentPage, size);
        return Result.success(userService.getUserPage(query));
    }

    /** Admin: User Statistics */
    @Operation(summary = "Admin - User Statistics")
    @GetMapping("/statistics")
    public Result<Map<String, Object>> getUserStatistics() {
        if (!isAdmin()) {
            return Result.error("Permission denied");
        }
        return Result.success(userService.getUserStatistics());
    }

    /** Admin: Update User Info */
    @Operation(summary = "Admin - Update User Info")
    @PutMapping("/{id}")
    public Result<Void> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateCommandDTO updateDTO) {

        if (!isAdmin()) {
            return Result.error("Permission denied");
        }

        log.info("Admin updating user: {}", id);
        userService.updateUser(id, updateDTO);
        return Result.success();
    }

    /** Admin: Update User Status */
    @Operation(summary = "Admin - Update User Status")
    @PutMapping("/{id}/status")
    public Result<Void> updateUserStatus(
            @PathVariable Long id,
            @RequestParam Integer status) {

        if (!isAdmin()) {
            return Result.error("Permission denied");
        }

        log.info("Admin updating user status: {} -> {}", id, status);
        userService.updateUserStatus(id, status);
        return Result.success();
    }

    /** Admin: Delete User */
    @Operation(summary = "Admin - Delete User")
    @DeleteMapping("/{id}")
    public Result<Void> deleteUser(@PathVariable Long id) {
        if (!isAdmin()) {
            return Result.error("Permission denied");
        }
        log.info("Admin deleting user: {}", id);
        userService.deleteUser(id);
        return Result.success();
    }
}
