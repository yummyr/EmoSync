package com.emosync.service.serviceImpl;

import com.emosync.DTO.response.ConsultationMessageResponseDTO;
import com.emosync.entity.ConsultationMessage;
import com.emosync.service.ConsultationMessageService;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class ConsultationMessageServiceImpl implements ConsultationMessageService {
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
        return null;
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
