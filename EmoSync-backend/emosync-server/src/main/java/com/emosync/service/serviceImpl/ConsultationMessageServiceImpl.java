package com.emosync.service.serviceImpl;

import com.emosync.DTO.response.ConsultationMessageResponseDTO;
import com.emosync.entity.ConsultationMessage;
import com.emosync.entity.ConsultationSession;
import com.emosync.repository.ConsultationMessageRepository;
import com.emosync.repository.ConsultationSessionRepository;
import com.emosync.service.ConsultationMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConsultationMessageServiceImpl implements ConsultationMessageService {

    private final ConsultationMessageRepository consultationMessageRepository;
    private final ConsultationSessionRepository consultationSessionRepository;
    @Override
    public ConsultationMessage saveUserMessage(Long sessionId, String content, String emotionTag) {
        // Avoid content = null insertion failure
        if (content == null) {
            content = "";
        }
        ConsultationSession session = consultationSessionRepository.findById(sessionId).orElse(null);

        ConsultationMessage msg = new ConsultationMessage();
        msg.setSession(session);
        msg.setSenderType(1);
        msg.setContent(content);
        msg.setMessageType(1);
        msg.setEmotionTag(emotionTag);
        msg.setCreatedAt(LocalDateTime.now());
        return consultationMessageRepository.save(msg);
    }

    @Override
    public ConsultationMessage saveAiMessage(Long sessionId, String content, String aiModel) {
        ConsultationSession session = consultationSessionRepository.findById(sessionId).orElse(null);

        ConsultationMessage msg = new ConsultationMessage();
        msg.setSession(session);
        msg.setSenderType(2);
        msg.setContent(content);
        msg.setAiModel(aiModel);
        msg.setMessageType(1);
        msg.setCreatedAt(LocalDateTime.now());
        return consultationMessageRepository.save(msg);
    }

    @Override
    public List<ConsultationMessageResponseDTO> getMessagesBySessionId(Long sessionId) {
        List<ConsultationMessage> list =
                consultationMessageRepository.findBySession_IdOrderByCreatedAtAsc(sessionId);

        return list.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Integer getMessageCountBySessionId(Long sessionId) {
        try {
            long count = consultationMessageRepository.countBySessionId(sessionId);
            return (int) count;
        } catch (Exception e) {
            log.error("Failed to get message count for session ID: {}", sessionId, e);
            return 0;
        }
    }

    @Override
    public ConsultationMessageResponseDTO getLastMessageBySessionId(Long sessionId) {
        ConsultationMessage msg =
                consultationMessageRepository.findLatestBySessionId(sessionId, PageRequest.of(0, 1))
                        .stream().findFirst().orElse(null);

        if (msg == null) {
            return null;
        }

        return toDTO(msg);
    }

    @Override
    public List<String> getEmotionTagsBySessionId(Long sessionId) {

        try {
            List<ConsultationMessage> list =
                    consultationMessageRepository.findMessagesWithEmotionTagBySessionId(sessionId);

            return list.stream()
                    .map(ConsultationMessage::getEmotionTag)
                    .filter(tag -> tag != null && !tag.isEmpty())
                    .distinct()
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Failed to get emotion tags for sessionId={}", sessionId, e);
            return Collections.emptyList();
        }
    }

    @Override
    public List<Long> searchSessionIdsByKeyword(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return Collections.emptyList();
        }

        List<ConsultationMessage> list =
                consultationMessageRepository.searchByContent(keyword);

        return list.stream()
                .map(m -> m.getSession().getId())
                .distinct()
                .collect(Collectors.toList());
    }

    @Override
    public int deleteMessagesBySessionId(Long sessionId) {
        try {
            List<ConsultationMessage> list =
                    consultationMessageRepository.findBySession_IdOrderByCreatedAtAsc(sessionId);

            consultationMessageRepository.deleteAll(list);
            return list.size();

        } catch (Exception e) {
            log.error("Failed to delete messages for sessionId={}", sessionId, e);
            return 0;
        }
    }

    private ConsultationMessageResponseDTO toDTO(ConsultationMessage entity) {

        ConsultationMessageResponseDTO dto = new ConsultationMessageResponseDTO();

        dto.setId(entity.getId());
        dto.setContent(entity.getContent());
        dto.setEmotionTag(entity.getEmotionTag());
        dto.setAiModel(entity.getAiModel());
        dto.setSenderType(entity.getSenderType());
        dto.setMessageType(entity.getMessageType());
        dto.setCreatedAt(entity.getCreatedAt());

        // sessionId
        if (entity.getSession() != null) {
            dto.setSessionId(entity.getSession().getId());
        }

        // Description fields (can be customized according to business needs)
        dto.setSenderTypeDesc(entity.getSenderType() == 1 ? "User" : "AI Assistant");
        dto.setMessageTypeDesc(entity.getMessageType() == 1 ? "Text" : "Unknown");

        dto.calculateContentLength();

        return dto;
    }

}
