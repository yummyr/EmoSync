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

        User user = userRepository.findByUsername(loginDTO.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check user status
        if (user.getStatus() == 0) {
            throw new BusinessException("Account is disabled");
        }

        // Verify password
        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            throw new BusinessException("Invalid username or password");
        }

        // Generate JWT token
        String token = jwtTokenUtils.generateToken(user.getId(), user.getUsername(), user.getUserType());


        // 使用 UserConvert 转换用户信息
        UserDetailResponseDTO userInfo = UserConvert.entityToDetailResponse(user);

        // 使用 UserConvert 构建登录响应
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

        // 使用 UserConvert 创建用户实体
        String encodedPassword = passwordEncoder.encode(dto.getPassword());
        User user = UserConvert.registerCommandToEntity(dto, encodedPassword);

        userRepository.save(user);
        log.info("User registration successful: userId={}, username={}", user.getId(), user.getUsername());

        // 使用 UserConvert 返回用户详情
        return UserConvert.entityToDetailResponse(user);
    }

    @Override
    public UserDetailResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // 使用 UserConvert 转换用户信息
        return UserConvert.entityToDetailResponse(user);
    }

    @Override
    public UserDetailResponseDTO updateUserProfile(Long id, UserUpdateCommandDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 使用 UserConvert 更新用户实体
        User updatedUser = UserConvert.updateCommandToEntity(dto);
        updatedUser.setId(id); // 确保ID不变
        updatedUser.setUsername(user.getUsername()); // 保留用户名
        updatedUser.setPassword(user.getPassword()); // 保留密码
        updatedUser.setCreatedAt(user.getCreatedAt()); // 保留创建时间

        userRepository.save(updatedUser);

        // 使用 UserConvert 返回更新后的用户信息
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
        // TODO: Implement real paging
        try {
            // create page query
            Pageable pageable = PageRequest.of(
                    query.getCurrentPage() - 1, // JPA page from 0
                    query.getSize(),
                    Sort.by(Sort.Direction.DESC, "createdAt")
            );
            // 构建查询条件
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
            log.error("查询用户列表失败", e);
            throw new BusinessException("查询失败，请稍后重试");
        }

    }

    /**
     * 构建用户查询条件
     */
    private Specification<User> buildUserSpecification(UserListQueryDTO queryDTO) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 处理模糊搜索
            boolean hasKeywordSearch = StringUtils.hasText(queryDTO.getUsername()) &&
                    StringUtils.hasText(queryDTO.getEmail()) &&
                    StringUtils.hasText(queryDTO.getNickname()) &&
                    StringUtils.hasText(queryDTO.getPhone()) &&
                    queryDTO.getUsername().equals(queryDTO.getEmail()) &&
                    queryDTO.getEmail().equals(queryDTO.getNickname()) &&
                    queryDTO.getNickname().equals(queryDTO.getPhone());

            if (hasKeywordSearch) {
                // 全局搜索：在所有字段中搜索关键词
                String keyword = "%" + queryDTO.getUsername() + "%";
                Predicate usernamePredicate = criteriaBuilder.like(root.get("username"), keyword);
                Predicate emailPredicate = criteriaBuilder.like(root.get("email"), keyword);
                Predicate nicknamePredicate = criteriaBuilder.like(root.get("nickname"), keyword);
                Predicate phonePredicate = criteriaBuilder.like(root.get("phone"), keyword);

                predicates.add(criteriaBuilder.or(usernamePredicate, emailPredicate, nicknamePredicate, phonePredicate));
            } else {
                // 分别处理各个字段的搜索
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

            // 用户类型筛选
            if (queryDTO.getUserType() != null) {
                predicates.add(criteriaBuilder.equal(root.get("userType"), queryDTO.getUserType()));
            }

            // 状态筛选
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
