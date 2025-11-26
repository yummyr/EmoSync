package com.emosync.service;

import com.emosync.DTO.response.ConsultationMessageResponseDTO;
import com.emosync.entity.ConsultationMessage;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public interface ConsultationMessageService {

    ConsultationMessage saveUserMessage(Long sessionId, String content, String emotionTag);

    ConsultationMessage saveAiMessage(Long sessionId, String content, String aiModel);

    List<ConsultationMessageResponseDTO> getMessagesBySessionId(Long sessionId);

    Integer getMessageCountBySessionId(Long sessionId);

    ConsultationMessageResponseDTO getLastMessageBySessionId(Long sessionId);

    List<String> getEmotionTagsBySessionId(Long sessionId);

    List<Long> searchSessionIdsByKeyword(String keyword);

    int deleteMessagesBySessionId(Long sessionId);
}
