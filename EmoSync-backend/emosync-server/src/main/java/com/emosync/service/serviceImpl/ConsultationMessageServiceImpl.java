package com.emosync.service.serviceImpl;

import com.emosync.DTO.response.ConsultationMessageResponseDTO;
import com.emosync.entity.ConsultationMessage;
import com.emosync.repository.ConsultationMessageRepository;
import com.emosync.service.ConsultationMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConsultationMessageServiceImpl implements ConsultationMessageService {

    private final ConsultationMessageRepository consultationMessageRepository;
    @Override
    public ConsultationMessage saveUserMessage(Long sessionId, String content, String emotionTag) {
        return null;
    }

    @Override
    public ConsultationMessage saveAiMessage(Long sessionId, String content, String aiModel) {
        return null;
    }

    @Override
    public List<ConsultationMessageResponseDTO> getMessagesBySessionId(Long sessionId) {
        return null;
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
        return null;
    }

    @Override
    public List<String> getEmotionTagsBySessionId(Long sessionId) {
        return null;
    }

    @Override
    public List<Long> searchSessionIdsByKeyword(String keyword) {
        return null;
    }

    @Override
    public int deleteMessagesBySessionId(Long sessionId) {
        return 0;
    }
}
