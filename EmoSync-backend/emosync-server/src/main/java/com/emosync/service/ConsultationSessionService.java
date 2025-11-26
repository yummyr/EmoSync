package com.emosync.service;

import com.emosync.DTO.command.ConsultationSessionCreateDTO;
import com.emosync.DTO.query.ConsultationSessionQueryDTO;
import com.emosync.DTO.response.ConsultationSessionResponseDTO;
import com.emosync.Result.PageResult;
import com.emosync.entity.ConsultationSession;
import org.springframework.stereotype.Service;

@Service
public interface ConsultationSessionService {
    ConsultationSession createSession(Long userId, ConsultationSessionCreateDTO createDTO);
    ConsultationSession getSessionById(Long sessionId);
    void updateLastEmotionAnalysis(Long sessionId, String emotionAnalysisJson);
    PageResult<ConsultationSessionResponseDTO> selectPage(ConsultationSessionQueryDTO queryDTO);
    ConsultationSessionResponseDTO getSessionDetail(Long sessionId);
    boolean deleteSession(Long sessionId, Long userId);
    boolean updateSessionTitle(Long sessionId, Long userId, String newTitle);
}
