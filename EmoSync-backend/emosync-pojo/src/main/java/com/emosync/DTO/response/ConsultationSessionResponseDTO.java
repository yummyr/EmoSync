package com.emosync.DTO.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Consultation session response DTO
 */
@Data
@Schema(description = "Consultation session response")
public class ConsultationSessionResponseDTO {

    @Schema(description = "Session ID")
    private Long id;

    @Schema(description = "User ID")
    private Long userId;

    @Schema(description = "User nickname")
    private String userNickname;

    @Schema(description = "User avatar")
    private String userAvatar;

    @Schema(description = "Session title")
    private String sessionTitle;

    @Schema(description = "Start time")
    private LocalDateTime startedAt;

    @Schema(description = "Session duration (minutes)")
    private Long durationMinutes;

    @Schema(description = "Total message count")
    private Integer messageCount;

    @Schema(description = "Last message content (preview)")
    private String lastMessageContent;

    @Schema(description = "Last message time")
    private LocalDateTime lastMessageTime;

    @Schema(description = "Emotion tag list")
    private List<String> emotionTags;

    @Schema(description = "Primary emotion")
    private String primaryEmotion;
}
