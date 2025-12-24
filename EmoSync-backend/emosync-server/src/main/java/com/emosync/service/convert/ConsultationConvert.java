package com.emosync.service.convert;

import com.emosync.DTO.response.ConsultationMessageResponseDTO;
import com.emosync.DTO.response.ConsultationSessionResponseDTO;
import com.emosync.entity.ConsultationMessage;
import com.emosync.entity.ConsultationSession;
import org.springframework.stereotype.Component;

/**
 * Converter for Consultation module
 *
 * Converts JPA entities into API response DTOs.
 * Handles nested relations such as User and Session objects.
 */
@Component
public class ConsultationConvert {

    /**
     * Convert ConsultationSession entity to response DTO.
     *
     * @param session ConsultationSession entity
     * @return ConsultationSessionResponseDTO
     */
    public ConsultationSessionResponseDTO toSessionResponseDTO(ConsultationSession session) {
        if (session == null) {
            return null;
        }

        ConsultationSessionResponseDTO dto = new ConsultationSessionResponseDTO();
        dto.setId(session.getId());

        // session.user is an entity → must fetch its ID
        if (session.getUser() != null) {
            dto.setUserId(session.getUser().getId());
        }

        dto.setSessionTitle(session.getSessionTitle());
        dto.setStartedAt(session.getStartedAt());

        return dto;
    }

    /**
     * Convert ConsultationMessage entity to response DTO.
     *
     * @param message ConsultationMessage entity
     * @return ConsultationMessageResponseDTO
     */
    public ConsultationMessageResponseDTO toMessageResponseDTO(ConsultationMessage message) {
        if (message == null) {
            return null;
        }

        ConsultationMessageResponseDTO dto = new ConsultationMessageResponseDTO();
        dto.setId(message.getId());

        // message.session is an entity → must fetch its ID
        if (message.getSession() != null) {
            dto.setSessionId(message.getSession().getId());
        }

        dto.setSenderType(message.getSenderType());
        dto.setMessageType(message.getMessageType());
        dto.setContent(message.getContent());
        dto.setEmotionTag(message.getEmotionTag());
        dto.setAiModel(message.getAiModel());
        dto.setCreatedAt(message.getCreatedAt());

        return dto;
    }
}
