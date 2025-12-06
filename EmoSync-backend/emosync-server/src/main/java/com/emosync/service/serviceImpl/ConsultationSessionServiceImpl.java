package com.emosync.service.serviceImpl;

import com.emosync.DTO.command.ConsultationSessionCreateDTO;
import com.emosync.DTO.query.ConsultationSessionQueryDTO;
import com.emosync.DTO.response.ConsultationSessionResponseDTO;
import com.emosync.Result.PageResult;
import com.emosync.entity.ConsultationSession;
import com.emosync.entity.User;
import com.emosync.exception.BusinessException;
import com.emosync.repository.ConsultationSessionRepository;
import com.emosync.repository.UserRepository;
import com.emosync.service.ConsultationMessageService;
import com.emosync.service.ConsultationSessionService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConsultationSessionServiceImpl implements ConsultationSessionService {

    private final ConsultationSessionRepository consultationSessionRepository;
    private final UserRepository userRepository;
    private final ConsultationMessageService consultationMessageService;

    @Override
    @Transactional
    public ConsultationSession createSession(Long userId, ConsultationSessionCreateDTO createDTO) {
        log.info("创建咨询会话，用户ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        ConsultationSession session = new ConsultationSession();
        session.setUser(user);
        session.setSessionTitle(createDTO.getSessionTitle());
        session.setStartedAt(LocalDateTime.now());

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM-dd HH:mm");

        if (session.getSessionTitle() == null || session.getSessionTitle().trim().isEmpty()) {
            session.setSessionTitle("AI Assistant - " + LocalDateTime.now().format(formatter));
        }

        ConsultationSession saved = consultationSessionRepository.save(session);
        log.info("咨询会话创建成功，会话ID: {}", saved.getId());
        return saved;
    }

    @Override
    public ConsultationSession getSessionById(Long sessionId) {
        return consultationSessionRepository.findById(sessionId).orElse(null);
    }

    @Override
    @Transactional
    public void updateLastEmotionAnalysis(Long sessionId, String emotionAnalysisJson) {
        log.info("更新会话情绪分析，会话ID: {}", sessionId);

        ConsultationSession session = consultationSessionRepository.findById(sessionId)
                .orElseThrow(() -> new BusinessException("会话不存在"));

        session.setLastEmotionAnalysis(emotionAnalysisJson);
        session.setLastEmotionUpdatedAt(LocalDateTime.now());

        consultationSessionRepository.save(session);
        log.info("会话情绪分析更新成功，会话ID: {}", sessionId);
    }

    @Override
    public PageResult<ConsultationSessionResponseDTO> selectPage(ConsultationSessionQueryDTO queryDTO) {
        log.info("分页查询咨询会话，查询条件: {}", queryDTO);

        // 构造 Specification
        Specification<ConsultationSession> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 按用户过滤（普通用户只能看自己的，会在 Controller 中设置 userId）
            if (queryDTO.getUserId() != null) {
                predicates.add(cb.equal(root.get("user").get("id"), queryDTO.getUserId()));
            }

            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            if (StringUtils.hasText(queryDTO.getStartDate())) {
                LocalDateTime start = LocalDateTime.parse(queryDTO.getStartDate() + " 00:00:00", dtf);
                predicates.add(cb.greaterThanOrEqualTo(root.get("startedAt"), start));
            }

            if (StringUtils.hasText(queryDTO.getEndDate())) {
                LocalDateTime end = LocalDateTime.parse(queryDTO.getEndDate() + " 23:59:59", dtf);
                predicates.add(cb.lessThanOrEqualTo(root.get("startedAt"), end));
            }

            if (StringUtils.hasText(queryDTO.getKeyword())) {
                String kw = "%" + queryDTO.getKeyword().trim() + "%";
                predicates.add(cb.like(root.get("sessionTitle"), kw));
            }

            query.orderBy(cb.desc(root.get("startedAt")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        int pageIndex = (int) (queryDTO.getCurrentPage() - 1);
        int pageSize = queryDTO.getSize().intValue();

        Pageable pageable = PageRequest.of(pageIndex, pageSize,
                Sort.by(Sort.Direction.DESC, "startedAt"));

        Page<ConsultationSession> page =
                consultationSessionRepository.findAll(spec, pageable);

        List<ConsultationSessionResponseDTO> records = page.getContent().stream()
                .map(this::convertToResponseDTO)
                .toList();
        log.info("分页查询结果:{}", records);
        return new PageResult<>(page.getTotalElements(), records);
    }

    @Override
    public ConsultationSessionResponseDTO getSessionDetail(Long sessionId) {

        ConsultationSession session = consultationSessionRepository.findById(sessionId)
                .orElseThrow(() -> new BusinessException("会话不存在"));
        log.info("session detail:{}",convertToResponseDTO(session));
        return convertToResponseDTO(session);
    }

    @Override
    @Transactional
    public boolean deleteSession(Long sessionId) {
        log.info("删除咨询会话，会话ID: {}", sessionId);

        ConsultationSession session = consultationSessionRepository.findById(sessionId)
                .orElseThrow(() -> new BusinessException("会话不存在"));

        try {
            // 先删消息
            consultationMessageService.deleteMessagesBySessionId(sessionId);

            // 再删会话
            consultationSessionRepository.delete(session);

            log.info("咨询会话删除成功，会话ID: {}", sessionId);
            return true;
        } catch (Exception e) {
            log.error("删除咨询会话异常，会话ID: {}, 错误: {}", sessionId, e.getMessage(), e);
            throw new BusinessException("删除会话失败: " + e.getMessage());
        }
    }

    @Override
    public boolean updateSessionTitle(Long sessionId, Long userId, String newTitle) {
        log.info("更新会话标题，会话ID: {}, 用户ID: {}, 新标题: {}", sessionId, userId, newTitle);

        ConsultationSession session = consultationSessionRepository.findById(sessionId)
                .orElseThrow(() -> new BusinessException("会话不存在"));

        // 只有会话所有者可以修改
        if (session.getUser() == null || !session.getUser().getId().equals(userId)) {
            throw new BusinessException("无权修改此会话");
        }

        String finalTitle = newTitle;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM-dd HH:mm");

        if (session.getSessionTitle() == null || session.getSessionTitle().trim().isEmpty()) {
            session.setSessionTitle("AI Assistant - " + LocalDateTime.now().format(formatter));
        }

        session.setSessionTitle(finalTitle);
        consultationSessionRepository.save(session);

        log.info("会话标题更新成功，会话ID: {}, 新标题: {}", sessionId, finalTitle);
        return true;
    }

    // ==================== 私有工具方法 ====================

    /**
     * 实体 -> 响应 DTO
     */
    private ConsultationSessionResponseDTO convertToResponseDTO(ConsultationSession session) {
        ConsultationSessionResponseDTO dto = new ConsultationSessionResponseDTO();

        dto.setId(session.getId());
        if (session.getUser() != null) {
            dto.setUserId(session.getUser().getId());
            dto.setUserNickname(session.getUser().getNickname());
            dto.setUserAvatar(session.getUser().getAvatar());
        }

        dto.setSessionTitle(session.getSessionTitle());
        dto.setStartedAt(session.getStartedAt());
        dto.setDurationMinutes(session.getDurationMinutes());


        // 补充消息统计信息
        enrichWithMessageInfo(dto, session.getId());
        log.info("返回dto:{}", dto.toString());

        return dto;
    }

    private void enrichWithMessageInfo(ConsultationSessionResponseDTO dto, Long sessionId) {
        try {
            // 消息总数
            dto.setMessageCount(consultationMessageService.getMessageCountBySessionId(sessionId));

            // 最后一条消息
            var lastMsg = consultationMessageService.getLastMessageBySessionId(sessionId);
            if (lastMsg != null) {
                dto.setLastMessageContent(lastMsg.getContentPreview());
                dto.setLastMessageTime(lastMsg.getCreatedAt());
            }

            // 情绪标签
            var emotionTags = consultationMessageService.getEmotionTagsBySessionId(sessionId);
            dto.setEmotionTags(emotionTags);

            if (emotionTags != null && !emotionTags.isEmpty()) {
                dto.setPrimaryEmotion(emotionTags.get(0));
            }
        } catch (Exception e) {
            log.warn("丰富消息信息失败，会话ID: {}, 错误: {}", sessionId, e.getMessage());
        }
    }
}
