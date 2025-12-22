package com.emosync.DTO.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Consultation message response DTO
 */
@Data
@Schema(description = "Consultation message response DTO")
public class ConsultationMessageResponseDTO {

    @Schema(description = "Message ID")
    private Long id;

    @Schema(description = "Session ID")
    private Long sessionId;

    @Schema(description = "Sender type 1:User 2:AI Assistant")
    private Integer senderType;

    @Schema(description = "Sender type description")
    private String senderTypeDesc;

    @Schema(description = "Message type 1:Text")
    private Integer messageType;

    @Schema(description = "Message type description")
    private String messageTypeDesc;

    @Schema(description = "Message content")
    private String content;

    @Schema(description = "Emotion tag")
    private String emotionTag;

    @Schema(description = "AI model used")
    private String aiModel;

    @Schema(description = "Creation time")
    private LocalDateTime createdAt;

    @Schema(description = "Message length")
    private Integer contentLength;

    /**
     * Calculate message length
     */
    public void calculateContentLength() {
        this.contentLength = content != null ? content.length() : 0;
    }

    /**
     * Get message preview (first 100 characters)
     */
    public String getContentPreview() {
        if (content == null) {
            return "";
        }
        return content.length() > 100 ? content.substring(0, 100) + "..." : content;
    }
}
