package com.emosync.service.serviceImpl;

import com.emosync.DTO.command.ConsultationSessionCreateDTO;
import com.emosync.DTO.query.ConsultationSessionQueryDTO;
import com.emosync.DTO.response.ConsultationSessionResponseDTO;
import com.emosync.Result.PageResult;
import com.emosync.entity.ConsultationSession;
import com.emosync.service.ConsultationSessionService;
import org.springframework.stereotype.Service;

@Service
public class ConsultationSessionServiceImpl implements ConsultationSessionService {
    @Override
    public ConsultationSession createSession(Long userId, ConsultationSessionCreateDTO createDTO) {
        return null;
    }

    @Override
    public ConsultationSession getSessionById(Long sessionId) {
        return null;
    }

    @Override
    public void updateLastEmotionAnalysis(Long sessionId, String emotionAnalysisJson) {

    }

    @Override
    public PageResult<ConsultationSessionResponseDTO> selectPage(ConsultationSessionQueryDTO queryDTO) {
        return null;
    }

    @Override
    public ConsultationSessionResponseDTO getSessionDetail(Long sessionId) {
        return null;
    }

    @Override
    public boolean deleteSession(Long sessionId, Long userId) {
        return false;
    }

    @Override
    public boolean updateSessionTitle(Long sessionId, Long userId, String newTitle) {
        return false;
    }
}
