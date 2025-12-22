package com.emosync.DTO.query;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * Consultation Session Query DTO
 */
@Data
@Schema(description = "Consultation Session Query")
public class ConsultationSessionQueryDTO {

    @Schema(description = "Current page", example = "1")
    private Integer currentPage = 1;

    @Schema(description = "Items per page", example = "10")
    private Integer size = 10;

    @Schema(description = "User ID")
    private Long userId;

    @Schema(description = "Emotion tag")
    private String emotionTag;

    @Schema(description = "Start date (from) format: yyyy-MM-dd")
    private String startDate;

    @Schema(description = "Start date (to) format: yyyy-MM-dd")
    private String endDate;

    @Schema(description = "Keyword search (session title or message content)")
    private String keyword;
}
