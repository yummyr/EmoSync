package com.emosync.service.serviceImpl;

import com.emosync.DTO.command.*;
import com.emosync.DTO.query.UserListQueryDTO;
import com.emosync.DTO.response.UserDetailResponseDTO;
import com.emosync.DTO.response.UserLoginResponseDTO;
import com.emosync.Result.PageResult;
import com.emosync.entity.User;
import com.emosync.exception.BusinessException;
import com.emosync.repository.UserRepository;
import com.emosync.service.UserService;
import com.emosync.service.convert.UserConvert;
import com.emosync.util.JwtTokenUtils;

import jakarta.annotation.Resource;
import jakarta.persistence.criteria.Predicate;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {

    @Resource
    private UserRepository userRepository;
    private final JwtTokenUtils jwtTokenUtils;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /** Login */
    @Override
    public UserLoginResponseDTO login(UserLoginCommandDTO loginDTO) {
        log.info("User Service get loginDTO:{}",loginDTO);

        User user = userRepository.findByUsername(loginDTO.getUsername());
        log.info("User service login get user:{}", user);

        // Check if user exists
        if (user == null) {
            log.warn("Login failed - user not found: {}", loginDTO.getUsername());
            throw new BusinessException("Invalid username or password");
        }

        // Check user status
        if (user.getStatus() == null || user.getStatus() == 0) {
            log.warn("Login failed - account disabled: {}", loginDTO.getUsername());
            throw new BusinessException("Account is disabled");
        }

        // Verify password
        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            log.warn("Login failed - password mismatch: {}", loginDTO.getUsername());
            throw new BusinessException("Invalid username or password");
        }

        // Generate JWT token
        String token = jwtTokenUtils.generateToken(user.getId(), user.getUsername(), user.getUserType());

        log.info("Login successful for user: {}, token generated", loginDTO.getUsername());

        // Use UserConvert to convert user information
        UserDetailResponseDTO userInfo = UserConvert.entityToDetailResponse(user);

        // Use UserConvert to build login response
        return UserConvert.buildLoginResponse(token, userInfo);
    }

    /** Register */
    @Override
    public UserDetailResponseDTO register(UserRegisterCommandDTO dto) {
        // Check if username exists
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new BusinessException("Username already exists");
        }

        // Check if email exists
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Email already registered");
        }

        // Use UserConvert to create user entity
        String encodedPassword = passwordEncoder.encode(dto.getPassword());
        User user = UserConvert.registerCommandToEntity(dto, encodedPassword);

        userRepository.save(user);
        log.info("User registration successful: userId={}, username={}", user.getId(), user.getUsername());

        // Use UserConvert to return user details
        return UserConvert.entityToDetailResponse(user);
    }

    @Override
    public UserDetailResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Use UserConvert to convert user information
        return UserConvert.entityToDetailResponse(user);
    }

    @Override
    public UserDetailResponseDTO updateUserProfile(Long id, UserUpdateCommandDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Use UserConvert to update user entity
        User updatedUser = UserConvert.updateCommandToEntity(dto);
        updatedUser.setId(id); // Ensure ID remains unchanged
        updatedUser.setUsername(user.getUsername()); // Keep username
        updatedUser.setPassword(user.getPassword()); // Keep password
        updatedUser.setCreatedAt(user.getCreatedAt()); // Keep creation time

        userRepository.save(updatedUser);

        // Use UserConvert to return updated user information
        return UserConvert.entityToDetailResponse(updatedUser);
    }

    @Override
    public void changeUserPassword(Long id, PasswordUpdateDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(dto.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Old password incorrect");
        }

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public void resetPasswordByEmail(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public PageResult<UserDetailResponseDTO> getUserPage(UserListQueryDTO query) {

        try {
            // create page query
            Pageable pageable = PageRequest.of(
                    query.getCurrentPage() - 1, // JPA page from 0
                    query.getSize(),
                    Sort.by(Sort.Direction.DESC, "createdAt")
            );
            // Build query conditions
            Specification<User> specification = buildUserSpecification(query);

            // 执行分页查询
            org.springframework.data.domain.Page<User> userPage = userRepository.findAll(specification, pageable);

            // 转换为响应DTO
            List<UserDetailResponseDTO> records = userPage.getContent().stream()
                    .map(UserConvert::entityToDetailResponse)
                    .collect(Collectors.toList());

            // 直接返回自定义的PageResult
            return new PageResult<>(userPage.getTotalElements(), records);}
        catch (Exception e){
            log.error("Failed to query user list", e);
            throw new BusinessException("Query failed, please try again later");
        }

    }

    /**
     * Build user query conditions
     */
    private Specification<User> buildUserSpecification(UserListQueryDTO queryDTO) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Handle fuzzy search
            boolean hasKeywordSearch = StringUtils.hasText(queryDTO.getUsername()) &&
                    StringUtils.hasText(queryDTO.getEmail()) &&
                    StringUtils.hasText(queryDTO.getNickname()) &&
                    StringUtils.hasText(queryDTO.getPhone()) &&
                    queryDTO.getUsername().equals(queryDTO.getEmail()) &&
                    queryDTO.getEmail().equals(queryDTO.getNickname()) &&
                    queryDTO.getNickname().equals(queryDTO.getPhone());

            if (hasKeywordSearch) {
                // Global search: search keyword in all fields
                String keyword = "%" + queryDTO.getUsername() + "%";
                Predicate usernamePredicate = criteriaBuilder.like(root.get("username"), keyword);
                Predicate emailPredicate = criteriaBuilder.like(root.get("email"), keyword);
                Predicate nicknamePredicate = criteriaBuilder.like(root.get("nickname"), keyword);
                Predicate phonePredicate = criteriaBuilder.like(root.get("phone"), keyword);

                predicates.add(criteriaBuilder.or(usernamePredicate, emailPredicate, nicknamePredicate, phonePredicate));
            } else {
                // Handle search for each field separately
                if (StringUtils.hasText(queryDTO.getUsername())) {
                    predicates.add(criteriaBuilder.like(root.get("username"), "%" + queryDTO.getUsername() + "%"));
                }
                if (StringUtils.hasText(queryDTO.getEmail())) {
                    predicates.add(criteriaBuilder.like(root.get("email"), "%" + queryDTO.getEmail() + "%"));
                }
                if (StringUtils.hasText(queryDTO.getNickname())) {
                    predicates.add(criteriaBuilder.like(root.get("nickname"), "%" + queryDTO.getNickname() + "%"));
                }
                if (StringUtils.hasText(queryDTO.getPhone())) {
                    predicates.add(criteriaBuilder.like(root.get("phone"), "%" + queryDTO.getPhone() + "%"));
                }
            }

            // User type filter
            if (queryDTO.getUserType() != null) {
                predicates.add(criteriaBuilder.equal(root.get("userType"), queryDTO.getUserType()));
            }

            // Status filter
            if (queryDTO.getStatus() != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), queryDTO.getStatus()));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
    @Override
    public Map<String, Object> getUserStatistics() {
        Map<String, Object> map = new HashMap<>();
        map.put("totalUsers", userRepository.count());
        return map;
    }

    @Override
    public void updateUser(Long id, UserUpdateCommandDTO dto) {
        User user = userRepository.findById(id).orElseThrow(()->new RuntimeException("User not found"));
        user.setNickname(dto.getNickname());
        user.setEmail(dto.getEmail());
        userRepository.save(user);
    }

    @Override
    public void updateUserStatus(Long id, Integer status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(status);
        userRepository.save(user);
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
